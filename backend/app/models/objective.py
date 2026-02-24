from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class Objective(Base):
    __tablename__ = "objectives"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, default="Monthly Visits")
    target = Column(Integer, default=0)
    current = Column(Integer, default=0)
    target_visits = Column(Integer, default=0) # Kept for migration compatibility
    month = Column(Integer)  # 1-12
    year = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
