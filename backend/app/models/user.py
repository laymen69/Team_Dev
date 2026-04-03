from sqlalchemy import Boolean, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    first_name: Mapped[str] = mapped_column(String)
    last_name: Mapped[str] = mapped_column(String)
    hashed_password: Mapped[str] = mapped_column(String)

    role: Mapped[str] = mapped_column(String)  # admin, supervisor, merchandiser

    phone: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, default="active")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    profile_image: Mapped[str | None] = mapped_column(Text, nullable=True)

    reports = relationship("Report", back_populates="user")