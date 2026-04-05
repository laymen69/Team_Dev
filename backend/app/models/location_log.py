from sqlalchemy import Integer, Float, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.db.session import Base
from datetime import datetime

class LocationLog(Base):
    __tablename__ = "location_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    workday_id: Mapped[int] = mapped_column(Integer, ForeignKey("workdays.id"))
    
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    log_type: Mapped[str] = mapped_column(String, default="checkpoint")  # start, end, checkpoint

    workday: Mapped["Workday"] = relationship("Workday", back_populates="location_logs")
