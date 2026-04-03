import asyncio
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session
from datetime import datetime
import math
from jose import jwt, JWTError

from app.core.security import SECRET_KEY, ALGORITHM
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.workday import Workday
from app.models.visit import Visit
from app.models.location_log import LocationLog
from app.models.gms import GMS
from app.models.assignment import GMSAssignment
from app.models.notification import Notification
from app.schemas.tracking import (
    WorkdayCreate, WorkdayResponse, WorkdayUpdate,
    VisitCreate, VisitResponse, VisitUpdate,
    LocationLogCreate
)
from app.schemas.gms import GMSWithDistance

router = APIRouter()

# =========================
# LIVE TRACKING MANAGER
# =========================
class LiveTracker:
    def __init__(self):
        self.connections: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.connections.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.connections:
            self.connections.remove(ws)

    async def broadcast(self, message: dict):
        # Efficient high-frequency broadcasting
        active_connections = list(self.connections)
        if not active_connections:
            return
        tasks = [ws.send_json(message) for ws in active_connections]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        for ws, res in zip(active_connections, results):
            if isinstance(res, Exception):
                self.disconnect(ws)

tracker = LiveTracker()

# =========================
# WORKDAY ENDPOINTS
# =========================
@router.post("/workday/start", response_model=WorkdayResponse)
def start_workday(data: WorkdayCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    active = db.query(Workday).filter(
        Workday.user_id == current_user.id,
        Workday.status == "active"
    ).first()
    if active: return active
    db_workday = Workday(
        user_id=current_user.id,
        start_lat=data.start_lat,
        start_lng=data.start_lng,
        status="active"
    )
    db.add(db_workday)
    db.commit()
    db.refresh(db_workday)
    return db_workday

@router.post("/workday/end", response_model=WorkdayResponse)
def end_workday(data: WorkdayUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_workday = db.query(Workday).filter(
        Workday.user_id == current_user.id,
        Workday.status == "active"
    ).first()
    if not db_workday: raise HTTPException(404, "No active workday found")
    active_visit = db.query(Visit).filter(Visit.workday_id==db_workday.id, Visit.status=="in_progress").first()
    if active_visit: raise HTTPException(400, "Close all active visits first")
    db_workday.status = "completed"
    db_workday.end_time = datetime.utcnow()
    db.commit()
    db.refresh(db_workday)
    return db_workday

# =========================
# VISIT ENDPOINTS
# =========================
@router.post("/visit/start", response_model=VisitResponse)
def start_visit(data: VisitCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    store = db.query(GMS).filter(GMS.id == data.gms_id).first()
    if not store: raise HTTPException(404, "Store not found")
    db_visit = Visit(
        workday_id=data.workday_id,
        gms_id=data.gms_id,
        start_lat=data.start_lat,
        start_lng=data.start_lng,
        status="in_progress"
    )
    db.add(db_visit)
    db.commit()
    db.refresh(db_visit)
    return db_visit

@router.post("/visit/end", response_model=VisitResponse)
def end_visit(data: VisitUpdate, visit_id: int = Body(..., embed=True), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_visit = db.query(Visit).join(Workday).filter(
        Visit.id==visit_id, Workday.user_id==current_user.id, Visit.status=="in_progress"
    ).first()
    if not db_visit: raise HTTPException(404, "No active visit found")
    db_visit.status = "completed"
    db_visit.end_time = datetime.utcnow()
    db_visit.end_lat = data.end_lat
    db_visit.end_lng = data.end_lng
    db.commit()
    db.refresh(db_visit)
    return db_visit

# =========================
# GPS LOGS SYNC (BULK INSERT + LIVE WS)
# =========================
@router.post("/logs/sync")
def sync_logs(logs: List[LocationLogCreate], db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    MAX_BATCH = 500
    if len(logs) > MAX_BATCH: raise HTTPException(400, "Too many logs")
    if not logs: return {"status":"success","count":0}

    workday_ids = list({log.workday_id for log in logs})
    valid_ids = {wd.id for wd in db.query(Workday.id).filter(Workday.id.in_(workday_ids), Workday.user_id==current_user.id)}

    insert_data = []
    for log in logs:
        if log.workday_id in valid_ids:
            data = log.model_dump()
            data["created_at"] = datetime.utcnow()
            insert_data.append(data)

    if not insert_data: return {"status":"success","count":0}

    try:
        db.bulk_insert_mappings(LocationLog, insert_data)
        db.commit()
    except:
        db.rollback()
        raise HTTPException(500, "Insert failed")

    # Live broadcast to WS clients
    for log in insert_data:
        timestamp_val = int(log.get("created_at", datetime.utcnow()).timestamp())
        asyncio.create_task(tracker.broadcast({
            "user_id": current_user.id,
            "latitude": log["latitude"],
            "longitude": log["longitude"],
            "timestamp": timestamp_val
        }))
    return {"status":"success","count":len(insert_data)}

# =========================
# WEBSOCKET ENDPOINT
# =========================
@router.websocket("/ws/live-location")
async def websocket_live(ws: WebSocket, token: str = Query(...), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
    except JWTError:
        await ws.close(code=1008)
        return

    user = db.query(User).filter(User.email == email).first()
    if not user: await ws.close(code=1008); return

    await tracker.connect(ws)
    try:
        while True:
            data = await ws.receive_json()
            await tracker.broadcast(data)
    except WebSocketDisconnect:
        tracker.disconnect(ws)