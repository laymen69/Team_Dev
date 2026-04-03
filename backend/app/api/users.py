from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.models.notification import Notification
from app.models.complaint import Complaint
from app.models.workday import Workday
from app.models.report import Report
from app.models.objective import Objective
from app.models.assignment import GMSAssignment
from app.models.leave_request import LeaveRequest
from app.schemas.user import UserCreate, UserResponse, UserBase, UserUpdate
from app.core.security import get_password_hash
import base64
import os
import uuid

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from app.api.deps import get_current_user

@router.get("/me", response_model=UserResponse)
def read_user_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/", response_model=List[UserResponse])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    
    image_url = user.profile_image
    if image_url and image_url.startswith("data:image"):
        try:
            header, encoded = image_url.split(",", 1)
            ext = header.split(";")[0].split("/")[1]
            filename = f"{uuid.uuid4()}.{ext}"
            filepath = os.path.join("uploads", "avatars", filename)
            with open(filepath, "wb") as f:
                f.write(base64.b64decode(encoded))
            image_url = f"/static/avatars/{filename}"
        except Exception as e:
            image_url = None

    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        profile_image=image_url,
        first_name=user.first_name,
        last_name=user.last_name,
        hashed_password=hashed_password,
        role=user.role,
        phone=user.phone,
        status=user.status,
        is_active=user.is_active
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user_update.dict(exclude_unset=True)
    
    if "email" in update_data and update_data["email"] != db_user.email:
        existing_user = db.query(User).filter(User.email == update_data["email"]).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

    if "password" in update_data:
        hashed_password = get_password_hash(update_data["password"])
        update_data["hashed_password"] = hashed_password
        del update_data["password"]

    if "profile_image" in update_data:
        img_data = update_data["profile_image"]
        if img_data is None:
            pass
        elif img_data and img_data.startswith("data:image"):
            try:
                header, encoded = img_data.split(",", 1)
                ext = header.split(";")[0].split("/")[1]
                filename = f"{uuid.uuid4()}.{ext}"
                filepath = os.path.join("uploads", "avatars", filename)
                with open(filepath, "wb") as f:
                    f.write(base64.b64decode(encoded))
                update_data["profile_image"] = f"/static/avatars/{filename}"
            except Exception as e:
                del update_data["profile_image"]
        else:
            del update_data["profile_image"]

    for key, value in update_data.items():
        if value is not None:
            setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/{user_id}")
def delete_user(
    user_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Cascade delete all dependent records
    db.query(Notification).filter(Notification.user_id == user_id).delete()
    db.query(Complaint).filter(Complaint.user_id == user_id).delete()
    db.query(Workday).filter(Workday.user_id == user_id).delete()
    db.query(Report).filter(Report.user_id == user_id).delete()
    db.query(Objective).filter(Objective.user_id == user_id).delete()
    db.query(GMSAssignment).filter(GMSAssignment.user_id == user_id).delete()
    db.query(LeaveRequest).filter((LeaveRequest.user_id == user_id) | (LeaveRequest.reviewed_by == user_id)).delete()
    
    db.delete(db_user)
    db.commit()
    return {"ok": True}
