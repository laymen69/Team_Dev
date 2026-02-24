from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class Visit(Base):
    __tablename__ = "visits"

    id = Column(Integer, primary_key=True, index=True)
    workday_id = Column(Integer, ForeignKey("workdays.id"))
    gms_id = Column(Integer, ForeignKey("gms.id"))
    status = Column(String, default="in_progress")  # in_progress, completed
    
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=True)
    
    start_lat = Column(Float, nullable=True)
    start_lng = Column(Float, nullable=True)
    end_lat = Column(Float, nullable=True)
    end_lng = Column(Float, nullable=True)

    workday = relationship("Workday", back_populates="visits")
    gms = relationship("GMS")
    reports = relationship("Report", primaryjoin="and_(Visit.id==foreign(Report.visit_id))", overlaps="reports")
