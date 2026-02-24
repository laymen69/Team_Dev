from sqlalchemy import Boolean, Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    hashed_password = Column(String)
    role = Column(String)  # admin, supervisor, merchandiser
    phone = Column(String, nullable=True)
    status = Column(String, default="active")  # active, inactive, pending
    is_active = Column(Boolean, default=True)
    profile_image = Column(Text, nullable=True)

    reports = relationship("Report", back_populates="user")
