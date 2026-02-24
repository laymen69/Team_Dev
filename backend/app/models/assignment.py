from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class GMSAssignment(Base):
    __tablename__ = "gms_assignments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    gms_id = Column(Integer, ForeignKey("gms.id"))
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    gms = relationship("GMS", back_populates="assignments")
