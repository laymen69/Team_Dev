from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class LocationLogBase(BaseModel):
    latitude: float
    longitude: float
    log_type: str = "checkpoint"

class LocationLogCreate(LocationLogBase):
    workday_id: int

class LocationLogResponse(LocationLogBase):
    id: int
    workday_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class VisitBase(BaseModel):
    gms_id: int
    start_lat: Optional[float] = None
    start_lng: Optional[float] = None

class VisitCreate(VisitBase):
    workday_id: int

class VisitUpdate(BaseModel):
    status: str = "completed"
    end_lat: Optional[float] = None
    end_lng: Optional[float] = None

class VisitResponse(VisitBase):
    id: int
    workday_id: int
    status: str
    start_time: datetime
    end_time: Optional[datetime] = None
    end_lat: Optional[float] = None
    end_lng: Optional[float] = None

    class Config:
        from_attributes = True

class WorkdayBase(BaseModel):
    start_lat: Optional[float] = None
    start_lng: Optional[float] = None

class WorkdayCreate(WorkdayBase):
    pass

class WorkdayUpdate(BaseModel):
    status: str = "completed"
    end_lat: Optional[float] = None
    end_lng: Optional[float] = None

class WorkdayResponse(WorkdayBase):
    id: int
    user_id: int
    status: str
    start_time: datetime
    end_time: Optional[datetime] = None
    end_lat: Optional[float] = None
    end_lng: Optional[float] = None
    
    class Config:
        from_attributes = True

class WorkdayDetailResponse(WorkdayResponse):
    visits: List[VisitResponse] = []
    location_logs: List[LocationLogResponse] = []
