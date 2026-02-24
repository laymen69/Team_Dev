from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    notes = Column(Text, nullable=True)
    type = Column(String, default="Before/After")  # Out of Stock, Facing Change, etc.
    status = Column(String, default="pending")  # pending, approved, rejected
    rejection_reason = Column(Text, nullable=True)
    
    # visit stats if applicable
    visits_planned = Column(Integer, default=0)
    visits_completed = Column(Integer, default=0)
    
    before_image = Column(String, nullable=True)
    after_image = Column(String, nullable=True)
    
    user_id = Column(Integer, ForeignKey("users.id"))
    gms_id = Column(Integer, ForeignKey("gms.id"), nullable=True)
    visit_id = Column(Integer, ForeignKey("visits.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="reports")
    gms = relationship("GMS")
    visit = relationship("Visit", back_populates="reports", overlaps="reports")

    @property
    def merchandiser_name(self) -> str:
        if self.user:
            return f"{self.user.first_name} {self.user.last_name}"
        return "Unknown"
