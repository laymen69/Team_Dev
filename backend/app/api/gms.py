from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from geoalchemy2.functions import ST_Distance, ST_MakePoint, ST_SetSRID
from app.db.session import SessionLocal
from app.models.gms import GMS
from app.models.assignment import GMSAssignment
from app.models.user import User
from app.models.notification import Notification
from app.schemas.gms import GMSCreate, GMSResponse, GMSBase, GMSWithDistance, GMSAssignmentCreate, GMSAssignmentResponse

router = APIRouter()

from app.api.deps import get_db, get_current_user

@router.get("/", response_model=List[GMSResponse])
def read_gms(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    print(f"Fetching GMS for user: {current_user.email} ({current_user.role})", flush=True)
    if current_user.role == 'merchandiser':
        gms_list = db.query(GMS).join(GMSAssignment).filter(GMSAssignment.user_id == current_user.id).offset(skip).limit(limit).all()
    else:
        gms_list = db.query(GMS).offset(skip).limit(limit).all()
    
    print(f"Found {len(gms_list)} stores", flush=True)
    return gms_list

@router.post("/assign", response_model=GMSAssignmentResponse)
def assign_merchandiser(
    assignment: GMSAssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ['admin', 'supervisor']:
        raise HTTPException(status_code=403, detail="Only admins and supervisors can assign merchandisers")
    
    # Check if assignment already exists
    existing = db.query(GMSAssignment).filter(
        GMSAssignment.user_id == assignment.user_id,
        GMSAssignment.gms_id == assignment.gms_id
    ).first()
    if existing:
        return existing

    db_assign = GMSAssignment(**assignment.model_dump())
    db.add(db_assign)
    db.commit()
    db.refresh(db_assign)
    
    # Notify merchandiser
    store = db.query(GMS).filter(GMS.id == assignment.gms_id).first()
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

def haversine(lat1, lon1, lat2, lon2):
    import math
    R = 6371  # Earth radius in km
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat/2) * math.sin(dLat/2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dLon/2) * math.sin(dLon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

@router.get("/nearest/", response_model=List[GMSWithDistance])
def get_nearest_stores(
    latitude: float = Query(..., description="User latitude"),
    longitude: float = Query(..., description="User longitude"),
    limit: int = Query(5, description="Number of stores to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Find nearest stores to a given location"""
    all_stores = db.query(GMS).all()
    
    stores_with_dist = []
    for store in all_stores:
        if store.latitude and store.longitude:
            dist = haversine(latitude, longitude, store.latitude, store.longitude)
            store_data = {
                "id": store.id,
                "name": store.name,
                "address": store.address,
                "latitude": store.latitude,
                "longitude": store.longitude,
                "city": store.city,
                "type": store.type,
                "distance_km": round(dist, 2)
            }
            stores_with_dist.append(store_data)
            
    # Sort by distance
    stores_with_dist.sort(key=lambda x: x['distance_km'])
    
    return stores_with_dist[:limit]

@router.get("/within-radius/", response_model=List[GMSWithDistance])
def get_stores_within_radius(
    latitude: float = Query(..., description="User latitude"),
    longitude: float = Query(..., description="User longitude"),
    radius_km: float = Query(10, description="Radius in kilometers"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all stores within a specified radius"""
    all_stores = db.query(GMS).all()
    
    result = []
    for store in all_stores:
        if store.latitude and store.longitude:
            dist = haversine(latitude, longitude, store.latitude, store.longitude)
            if dist <= radius_km:
                store_data = {
                    "id": store.id,
                    "name": store.name,
                    "address": store.address,
                    "latitude": store.latitude,
                    "longitude": store.longitude,
                    "city": store.city,
                    "type": store.type,
                    "distance_km": round(dist, 2)
                }
                result.append(store_data)
                
    result.sort(key=lambda x: x['distance_km'])
    return result

@router.post("/", response_model=GMSResponse)
def create_gms(
    gms: GMSCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    from geoalchemy2.elements import WKTElement
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
    
    # Trigger notifications for all admins and supervisors
    recipients = db.query(User).filter(User.role.in_(['admin', 'supervisor'])).all()
    for user in recipients:
        notif = Notification(
            user_id=user.id,
            title="New GMS Store Created",
            message=f"Store '{db_gms.name}' has been added to {db_gms.city}.",
            type="success",
            icon="storefront"
        )
        db.add(notif)
    db.commit()
    
    return db_gms

@router.put("/{gms_id}/", response_model=GMSResponse)
def update_gms(
    gms_id: int, 
    gms_update: GMSBase, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from geoalchemy2.elements import WKTElement
    
    db_gms = db.query(GMS).filter(GMS.id == gms_id).first()
    if not db_gms:
        raise HTTPException(status_code=404, detail="GMS not found")
    
    for key, value in gms_update.dict(exclude_unset=True).items():
        setattr(db_gms, key, value)
    
    # Update geometry if coordinates changed
    if 'latitude' in gms_update.dict(exclude_unset=True) or 'longitude' in gms_update.dict(exclude_unset=True):
        from geoalchemy2.elements import WKTElement
        db_gms.location = WKTElement(f'POINT({db_gms.longitude} {db_gms.latitude})', srid=4326)
    
    db.commit()
    db.refresh(db_gms)
    
    # Trigger notifications for all admins and supervisors
    recipients = db.query(User).filter(User.role.in_(['admin', 'supervisor'])).all()
    for user in recipients:
        notif = Notification(
            user_id=user.id,
            title="GMS Store Updated",
            message=f"Store '{db_gms.name}' information has been modified.",
            type="info",
            icon="create"
        )
        db.add(notif)
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
