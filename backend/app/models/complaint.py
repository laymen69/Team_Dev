from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

COMPLAINT_TYPES = ["store_issue", "colleague", "equipment", "route", "other"]

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False)             # store_issue, colleague, …
    description = Column(Text, nullable=False)
    photo_url = Column(String, nullable=True)
    status = Column(String, default="open")          # open, in_review, resolved
    admin_response = Column(Text, nullable=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    gms_id  = Column(Integer, ForeignKey("gms.id"),  nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User")
    gms  = relationship("GMS")
