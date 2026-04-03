from time import time
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
import math
import asyncio
from jose import jwt, JWTError
from app.core.security import SECRET_KEY, ALGORITHM

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.workday import Workday
from app.models.visit import Visit
from app.models.location_log import LocationLog
from app.models.gms import GMS
from app.schemas.tracking import (
    WorkdayCreate, WorkdayResponse, WorkdayUpdate,
    VisitCreate, VisitResponse, VisitUpdate,
    LocationLogCreate, LocationLogResponse
)

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance in meters between two GPS points."""
    R = 6371000  # Radius of the earth in m
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat / 2) * math.sin(dLat / 2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dLon / 2) * math.sin(dLon / 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# --- Workday Endpoints ---

@router.post("/workday/start", response_model=WorkdayResponse)
def start_workday(
    data: WorkdayCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check for active workday
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
    
    # Check for active visits
    active_visit = db.query(Visit).filter(
        Visit.workday_id == db_workday.id,
        Visit.status == "in_progress"
    ).first()
    
    if active_visit:
        raise HTTPException(status_code=400, detail="Close all active visits before ending your workday")

    db_workday.status = "completed"
    db_workday.end_time = datetime.now()
    db_workday.end_lat = data.end_lat
    db_workday.end_lng = data.end_lng

    db.commit()
    db.refresh(db_workday)
    return db_workday

# --- Visit Endpoints ---

@router.post("/visit/start", response_model=VisitResponse)
def start_visit(
    data: VisitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ensure workday exists
    workday = db.query(Workday).filter(
        Workday.id == data.workday_id,
        Workday.user_id == current_user.id
    ).first()
    if workday is None:
        raise HTTPException(status_code=403, detail="Invalid workday session")

    # Check for active visit
    active = db.query(Visit).filter(
        Visit.workday_id == workday.id,
        Visit.status == "in_progress"
    ).first()
    if active:
        raise HTTPException(status_code=400, detail="Another visit is already in progress")

    # Proximity Check (1km limit)
    store = db.query(GMS).filter(GMS.id == data.gms_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    
    if data.start_lat and data.start_lng:
        dist = calculate_distance(data.start_lat, data.start_lng, store.latitude, store.longitude)
        if dist > 1000: # 1km
            raise HTTPException(status_code=400, detail=f"You are too far from the store ({int(dist)}m away) to start a visit")

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
        raise HTTPException(status_code=404, detail="No active visit found with this ID")

    db_visit.status = "completed"
    db_visit.end_time = datetime.now()
    db_visit.end_lat = data.end_lat
    db_visit.end_lng = data.end_lng
    
    db.commit()
    db.refresh(db_visit)
    return db_visit

# --- GPS Logs ---

@router.post("/logs/sync", response_model=List[LocationLogResponse])
def sync_logs(
    logs: List[LocationLogCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Protect the database from excessively large batches
    MAX_BATCH = 500
    if len(logs) > MAX_BATCH:
        raise HTTPException(
            status_code=400,
            detail=f"Too many logs in a single batch (max {MAX_BATCH})"
        )

    db_logs: List[LocationLog] = []
    
    # N+1 Fix: pre-fetch valid workday IDs
    workday_ids = list({log.workday_id for log in logs})
    if not workday_ids:
        return []
        
    valid_workdays = db.query(Workday.id).filter(
        Workday.id.in_(workday_ids),
        Workday.user_id == current_user.id
    ).all()
    valid_workday_ids = {wd.id for wd in valid_workdays}

    for log in logs:
        if log.workday_id not in valid_workday_ids:
            continue
            
        db_log = LocationLog(**log.model_dump())
        db.add(db_log)
        db_logs.append(db_log)
    
    if not db_logs:
        return []

    db.commit()
    return db_logs

@router.get("/active-session", response_model=dict)
def get_active_session(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check if the user has an active workday or visit."""
    workday = db.query(Workday).filter(
        Workday.user_id == current_user.id,
        Workday.status == "active"
    ).first()
    
    visit = None
    if workday:
        visit = db.query(Visit).filter(
            Visit.workday_id == workday.id,
            Visit.status == "in_progress"
        ).first()
        
    return {
        "workday": workday,
        "visit": visit
    }

@router.websocket("/ws")
async def websocket_tracking(websocket: WebSocket, token: str = None, db: Session = Depends(get_db)):
    if not token:
        await websocket.close(code=1008, reason="Missing token")
        return
        
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str | None = payload.get("sub")
        if not email:
            raise JWTError()
    except JWTError:
        await websocket.close(code=1008, reason="Invalid token")
        return
        
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "location_update":
                await manager.broadcast(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

