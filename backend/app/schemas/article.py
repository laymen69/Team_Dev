from __future__ import annotations
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class ArticleBase(BaseModel):
    name: str
    reference: str | None = None
    category: str | None = None
    brand: str | None = None
    unit: str | None = None
    description: str | None = None
    is_active: bool = True
    gms_id: int | None = None

class ArticleCreate(ArticleBase):
    pass

class ArticleUpdate(BaseModel):
    name: str | None = None
    reference: str | None = None
    category: str | None = None
    brand: str | None = None
    unit: str | None = None
    description: str | None = None
    is_active: bool | None = None
    gms_id: int | None = None

class ArticleResponse(ArticleBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
