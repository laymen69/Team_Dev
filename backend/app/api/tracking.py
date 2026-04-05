import asyncio
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone
from jose import jwt, JWTError
from geoalchemy2.functions import ST_DWithin, ST_MakePoint, ST_SetSRID

from app.core.config import settings
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.workday import Workday
from app.models.visit import Visit
from app.models.location_log import LocationLog
from app.models.gms import GMS
from app.schemas.tracking import (
    WorkdayCreate, WorkdayResponse, WorkdayUpdate,
    VisitCreate, VisitResponse, VisitUpdate,
    LocationLogCreate
)

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
        """Efficient high-frequency broadcasting to active connections."""
        if not self.connections:
            return
        
        # Create tasks for parallel sending
        tasks = [ws.send_json(message) for ws in self.connections]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Cleanup failed connections
        for ws, res in zip(self.connections[:], results):
            if isinstance(res, Exception):
                self.disconnect(ws)

tracker = LiveTracker()

# =========================
# WORKDAY ENDPOINTS
# =========================
@router.post("/workday/start", response_model=WorkdayResponse)
def start_workday(
    data: WorkdayCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    active = db.query(Workday).filter(
        Workday.user_id == current_user.id,
        Workday.status == "active"
    ).first()
    
    if active:
        return active

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
def end_workday(
    data: WorkdayUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    db_workday = db.query(Workday).filter(
        Workday.user_id == current_user.id,
        Workday.status == "active"
    ).first()
    
    if not db_workday:
        raise HTTPException(status_code=404, detail="No active workday found")
    
    active_visit = db.query(Visit).filter(
        Visit.workday_id == db_workday.id, 
        Visit.status == "in_progress"
    ).first()
    
    if active_visit:
        raise HTTPException(status_code=400, detail="Close all active visits first")
        
    db_workday.status = "completed"
    db_workday.end_time = datetime.now(timezone.utc)
    db_workday.end_lat = data.end_lat
    db_workday.end_lng = data.end_lng
    
    db.commit()
    db.refresh(db_workday)
    return db_workday

# =========================
# VISIT ENDPOINTS
# =========================
@router.post("/visit/start", response_model=VisitResponse)
def start_visit(
    data: VisitCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # PostGIS optimized proximity check (1km)
    user_point = ST_SetSRID(ST_MakePoint(data.start_lng, data.start_lat), 4326)
    
    # Check if store exists and is within 1km
    store_in_range = db.query(GMS).filter(
        GMS.id == data.gms_id,
        ST_DWithin(GMS.location, user_point, 1000) # 1000 meters
    ).first()
    
    if not store_in_range:
        raise HTTPException(
            status_code=400, 
            detail="You are too far from the store (limit 1km) or store not found."
        )

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
def end_visit(
    data: VisitUpdate, 
    visit_id: int = Body(..., embed=True), 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    db_visit = db.query(Visit).join(Workday).filter(
        Visit.id == visit_id, 
        Workday.user_id == current_user.id, 
        Visit.status == "in_progress"
    ).first()
    
    if not db_visit:
        raise HTTPException(status_code=404, detail="No active visit found")
        
    db_visit.status = "completed"
    db_visit.end_time = datetime.now(timezone.utc)
    db_visit.end_lat = data.end_lat
    db_visit.end_lng = data.end_lng
    
    db.commit()
    db.refresh(db_visit)
    return db_visit

# =========================
# GPS LOGS SYNC
# =========================
@router.post("/logs/sync")
def sync_logs(
    logs: List[LocationLogCreate], 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if not logs:
        return {"status": "success", "count": 0}
        
    MAX_BATCH = 1000
    if len(logs) > MAX_BATCH:
        raise HTTPException(status_code=400, detail=f"Batch too large (max {MAX_BATCH})")

    workday_ids = list({log.workday_id for log in logs})
    valid_ids = {wd.id for wd in db.query(Workday.id).filter(
        Workday.id.in_(workday_ids), 
        Workday.user_id == current_user.id
    )}

    insert_data = []
    now = datetime.now(timezone.utc)
    
    for log in logs:
        if log.workday_id in valid_ids:
            mapping = log.model_dump()
            mapping["timestamp"] = now # Or use log timestamp if provided
            insert_data.append(mapping)

    if not insert_data:
        return {"status": "success", "count": 0}

    try:
        # High-performance bulk mapping insert
        db.bulk_insert_mappings(LocationLog, insert_data)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    # Broadcast latest point to live supervisors
    latest = insert_data[-1]
    asyncio.create_task(tracker.broadcast({
        "type": "location_update",
        "user_id": current_user.id,
        "name": f"{current_user.first_name} {current_user.last_name}",
        "latitude": latest["latitude"],
        "longitude": latest["longitude"],
        "timestamp": now.isoformat()
    }))
    
    return {"status": "success", "count": len(insert_data)}

# =========================
# WEBSOCKET
# =========================
@router.websocket("/ws/live-location")
async def websocket_live(
    ws: WebSocket, 
    token: str = Query(...), 
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
    except JWTError:
        await ws.close(code=1008)
        return

    user = db.query(User).filter(User.email == email).first()
    if not user:
        await ws.close(code=1008)
        return

    await tracker.connect(ws)
    try:
        while True:
            # We mostly broadcast out, but we can handle heartbeats or incoming pings
            await ws.receive_text()
    except WebSocketDisconnect:
        tracker.disconnect(ws)
