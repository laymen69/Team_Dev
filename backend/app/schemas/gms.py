from typing import Optional, List
from pydantic import BaseModel

class GMSBase(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    city: str
    type: str

class GMSCreate(GMSBase):
    pass

class GMSResponse(GMSBase):
    id: int

    class Config:
        from_attributes = True

class GMSWithDistance(GMSResponse):
    distance_km: float

class GMSAssignmentCreate(BaseModel):
    user_id: int
    gms_id: int

class GMSAssignmentResponse(GMSAssignmentCreate):
    id: int
    assigned_at: str

    class Config:
        from_attributes = True
