from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.core.security import get_password_hash
from app.core.config import settings
import base64
import os
import uuid

router = APIRouter()

def _save_base64_image(image_data: str, folder: str = "avatars") -> Optional[str]:
    """Helper to decode and save base64 images to disk."""
    if not image_data or not image_data.startswith("data:image"):
        return None
    try:
        header, encoded = image_data.split(",", 1)
        ext = header.split(";")[0].split("/")[1]
        filename = f"{uuid.uuid4()}.{ext}"
        filepath = os.path.join("uploads", folder, filename)
        
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "wb") as f:
            f.write(base64.b64decode(encoded))
        return f"/static/{folder}/{filename}"
    except Exception:
        return None

@router.get("/me", response_model=UserResponse)
def read_user_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch("/me", response_model=UserResponse)
def update_user_me(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Allow current user to update their own profile."""
    update_data = user_update.model_dump(exclude_unset=True)
    
    # Restrict self-update of role and email for non-admins
    if current_user.role != "admin":
        update_data.pop("role", None)
        update_data.pop("email", None)
        update_data.pop("is_active", None)

    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))

    if "profile_image" in update_data:
        img_url = _save_base64_image(update_data["profile_image"])
        if img_url:
            update_data["profile_image"] = img_url
        else:
            update_data.pop("profile_image")

    for key, value in update_data.items():
        setattr(current_user, key, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/", response_model=List[UserResponse])
def read_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "supervisor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(User).offset(skip).limit(limit).all()

@router.post("/", response_model=UserResponse)
def create_user(
    user: UserCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create users")
        
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    image_url = _save_base64_image(user.profile_image) if user.profile_image else None

    db_user = User(
        email=user.email,
        profile_image=image_url,
        first_name=user.first_name,
        last_name=user.last_name,
        hashed_password=get_password_hash(user.password),
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
def update_user(
    user_id: int, 
    user_update: UserUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update users")
        
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user_update.model_dump(exclude_unset=True)
    
    if "email" in update_data and update_data["email"] != db_user.email:
        if db.query(User).filter(User.email == update_data["email"]).first():
            raise HTTPException(status_code=400, detail="Email already registered")

    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))

    if "profile_image" in update_data:
        img_url = _save_base64_image(update_data["profile_image"])
        if img_url:
            update_data["profile_image"] = img_url
        else:
            update_data.pop("profile_image")

    for key, value in update_data.items():
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
    
    # Automated cascade handled by SQLAlchemy models
    db.delete(db_user)
    db.commit()
    return {"ok": True}
