from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    reference = Column(String, nullable=True)        # SKU / barcode
    category = Column(String, nullable=True)          # Dairy, Beverage, Snacks…
    brand = Column(String, nullable=True)
    unit = Column(String, nullable=True)              # piece, kg, litre…
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

    # Optional: article belongs to a specific store
    gms_id = Column(Integer, ForeignKey("gms.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    gms = relationship("GMS")
