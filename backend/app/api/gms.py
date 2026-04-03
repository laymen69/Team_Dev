from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from geoalchemy2.functions import ST_Distance, ST_DWithin, ST_MakePoint, ST_SetSRID
from app.models.gms import GMS
from app.models.assignment import GMSAssignment
from app.models.user import User
from app.models.notification import Notification
from app.schemas.gms import (
    GMSCreate, GMSResponse, GMSBase,
    GMSWithDistance, GMSAssignmentCreate, GMSAssignmentResponse
)
from app.api.deps import get_db, get_current_user
from geoalchemy2.elements import WKTElement

router = APIRouter()


# -------------------------------
# List GMS with role-based filter
# -------------------------------
@router.get("/", response_model=List[GMSResponse])
def read_gms(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(GMS)

    if current_user.role == 'merchandiser':
        query = query.join(GMSAssignment).filter(GMSAssignment.user_id == current_user.id)

    # Pre-fetch assignments to avoid N+1
    query = query.options(joinedload(GMS.assignments))

    return query.offset(skip).limit(limit).all()


# -------------------------------
# Assign a merchandiser to a store
# -------------------------------
@router.post("/assign", response_model=GMSAssignmentResponse)
def assign_merchandiser(
    assignment: GMSAssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ['admin', 'supervisor']:
        raise HTTPException(status_code=403, detail="Not allowed")

    existing = db.query(GMSAssignment).filter_by(
        user_id=assignment.user_id,
        gms_id=assignment.gms_id
    ).first()

    if existing:
        return existing

    db_assign = GMSAssignment(**assignment.model_dump())
    db.add(db_assign)
    db.commit()
    db.refresh(db_assign)

    # Send notification
    store = db.query(GMS).filter(GMS.id == assignment.gms_id).first()
    if store:
        notif = Notification(
            user_id=assignment.user_id,
            title="New Store Assigned",
            message=f"You have been assigned to '{store.name}' in {store.city}.",
            type="info",
            icon="person-add"
        )
        db.add(notif)
        db.commit()

    return db_assign


# -------------------------------
# Nearest stores using PostGIS
# -------------------------------
@router.get("/nearest/", response_model=List[GMSWithDistance])
def get_nearest_stores(
    latitude: float = Query(..., description="User latitude"),
    longitude: float = Query(..., description="User longitude"),
    limit: int = Query(5, description="Number of stores to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_point = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
    query = db.query(
        GMS,
        ST_Distance(GMS.location, user_point).label("distance")
    )

    if current_user.role == 'merchandiser':
        query = query.join(GMSAssignment).filter(GMSAssignment.user_id == current_user.id)

    results = query.order_by("distance").limit(limit).all()

    return [
        {
            "id": gms.id,
            "name": gms.name,
            "address": gms.address,
            "latitude": gms.latitude,
            "longitude": gms.longitude,
            "city": gms.city,
            "type": gms.type,
            "distance_km": round(distance / 1000, 2)
        }
        for gms, distance in results
    ]


# -------------------------------
# Stores within a radius using PostGIS
# -------------------------------
@router.get("/within-radius/", response_model=List[GMSWithDistance])
def get_stores_within_radius(
    latitude: float = Query(..., description="User latitude"),
    longitude: float = Query(..., description="User longitude"),
    radius_km: float = Query(10, description="Radius in kilometers"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_point = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
    radius_m = radius_km * 1000

    query = db.query(
        GMS,
        ST_Distance(GMS.location, user_point).label("distance")
    ).filter(ST_DWithin(GMS.location, user_point, radius_m))

    if current_user.role == 'merchandiser':
        query = query.join(GMSAssignment).filter(GMSAssignment.user_id == current_user.id)

    results = query.order_by("distance").all()

    return [
        {
            "id": gms.id,
            "name": gms.name,
            "address": gms.address,
            "latitude": gms.latitude,
            "longitude": gms.longitude,
            "city": gms.city,
            "type": gms.type,
            "distance_km": round(distance / 1000, 2)
        }
        for gms, distance in results
    ]



@router.post("/", response_model=GMSResponse)
def create_gms(
    gms: GMSCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_gms = GMS(
        name=gms.name,
        address=gms.address,
        latitude=gms.latitude,
        longitude=gms.longitude,
        location=WKTElement(f'POINT({gms.longitude} {gms.latitude})', srid=4326),
        city=gms.city,
        type=gms.type
    )
    db.add(db_gms)
    db.commit()
    db.refresh(db_gms)

    # Notify admins/supervisors asynchronously
    recipients = db.query(User).filter(User.role.in_(['admin', 'supervisor'])).all()
    for user in recipients:
        db.add(Notification(
            user_id=user.id,
            title="New GMS Store Created",
            message=f"Store '{db_gms.name}' added in {db_gms.city}.",
            type="success",
            icon="storefront"
        ))
    db.commit()

    return db_gms



@router.put("/{gms_id}/", response_model=GMSResponse)
def update_gms(
    gms_id: int,
    gms_update: GMSBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_gms = db.query(GMS).filter(GMS.id == gms_id).first()
    if not db_gms:
        raise HTTPException(status_code=404, detail="GMS not found")

    for key, value in gms_update.dict(exclude_unset=True).items():
        setattr(db_gms, key, value)

    if 'latitude' in gms_update.dict(exclude_unset=True) or 'longitude' in gms_update.dict(exclude_unset=True):
        db_gms.location = WKTElement(f'POINT({db_gms.longitude} {db_gms.latitude})', srid=4326)

    db.commit()
    db.refresh(db_gms)

    # Notify admins/supervisors
    recipients = db.query(User).filter(User.role.in_(['admin', 'supervisor'])).all()
    for user in recipients:
        db.add(Notification(
            user_id=user.id,
            title="GMS Store Updated",
            message=f"Store '{db_gms.name}' updated.",
            type="info",
            icon="create"
        ))
    db.commit()

    return db_gms



@router.delete("/{gms_id}/")
def delete_gms(
    gms_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_gms = db.query(GMS).filter(GMS.id == gms_id).first()
    if not db_gms:
        raise HTTPException(status_code=404, detail="GMS not found")

    db.delete(db_gms)
    db.commit()
    return {"ok": True}