from sqlalchemy import Column, Integer, String, Text, ForeignKey, Date, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True, index=True)
    leave_type = Column(String, nullable=False)       # annual, sick, personal, emergency
    start_date = Column(Date, nullable=False)
    end_date   = Column(Date, nullable=False)
    reason     = Column(Text, nullable=True)
    status     = Column(String, default="pending")    # pending, approved, rejected
    admin_comment = Column(Text, nullable=True)

    user_id     = Column(Integer, ForeignKey("users.id"), nullable=False)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)

    user     = relationship("User", foreign_keys=[user_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by])

    @property
    def requester_name(self) -> str:
        if self.user:
            return f"{self.user.first_name} {self.user.last_name}"
        return "Unknown"

    @property
    def requester_role(self) -> str:
        return self.user.role if self.user else ""
