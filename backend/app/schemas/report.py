from __future__ import annotations
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class ReportBase(BaseModel):
    name: str
    notes: str | None = None
    type: str = "Before/After"
    status: str = "pending"
    rejection_reason: str | None = None
    visits_planned: int = 0
    visits_completed: int = 0
    before_image: str | None = None
    after_image: str | None = None
    gms_id: int | None = None
    visit_id: int | None = None

class ReportCreate(ReportBase):
    pass

class ReportResponse(ReportBase):
    id: int
    user_id: int
    merchandiser_name: str
    created_at: datetime

    class Config:
        from_attributes = True
