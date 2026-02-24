from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.db.session import Base

class GMS(Base):
    __tablename__ = "gms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    address = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    location = Column(Geometry(geometry_type='POINT', srid=4326))
    city = Column(String)
    type = Column(String)  # Supermarket, Hypermarket, etc.
    
    assignments = relationship("GMSAssignment", back_populates="gms")
