from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class LocationLog(Base):
    __tablename__ = "location_logs"

    id = Column(Integer, primary_key=True, index=True)
    workday_id = Column(Integer, ForeignKey("workdays.id"))
    
    latitude = Column(Float)
    longitude = Column(Float)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    log_type = Column(String, default="checkpoint")  # start, end, checkpoint

    workday = relationship("Workday", back_populates="location_logs")
