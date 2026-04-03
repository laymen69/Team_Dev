from typing import List, Optional
from sqlalchemy import Integer, String, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry
from app.db.session import Base

class GMS(Base):
    __tablename__ = "gms"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, index=True)
    address: Mapped[str] = mapped_column(String)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    location: Mapped[Geometry] = mapped_column(Geometry(geometry_type='POINT', srid=4326))
    city: Mapped[str] = mapped_column(String)
    type: Mapped[str] = mapped_column(String)  # Supermarket, Hypermarket, etc.
    
    # Cascade deletes to assignments and reports
    assignments: Mapped[List["GMSAssignment"]] = relationship(
        "GMSAssignment", back_populates="gms", cascade="all, delete-orphan"
    )
    reports: Mapped[List["Report"]] = relationship(
        "Report", back_populates="gms", cascade="all, delete-orphan"
    )
    complaints: Mapped[List["Complaint"]] = relationship(
        "Complaint", back_populates="gms", cascade="all, delete-orphan"
    )
    visits: Mapped[List["Visit"]] = relationship(
        "Visit", back_populates="gms", cascade="all, delete-orphan"
    )
