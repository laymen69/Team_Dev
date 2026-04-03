from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import NotificationBase, NotificationCreate, NotificationResponse, NotificationUpdate

router = APIRouter()

@router.get("/", response_model=List[NotificationResponse])
def read_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve notifications for the current user."""
    notifications = db.query(Notification)\
        .filter(Notification.user_id == current_user.id)\
        .order_by(Notification.created_at.desc())\
        .all()
    return notifications

@router.get("/{notification_id}/", response_model=NotificationResponse)
def read_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve a specific notification."""
    notification = db.query(Notification)\
        .filter(Notification.id == notification_id, Notification.user_id == current_user.id)\
        .first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return notification

@router.put("/{notification_id}/read/", response_model=NotificationResponse)
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a specific notification as read."""
    notification = db.query(Notification)\
        .filter(Notification.id == notification_id, Notification.user_id == current_user.id)\
        .first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification

@router.put("/read-all/")
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark all notifications as read for the current user."""
    db.query(Notification)\
        .filter(Notification.user_id == current_user.id, Notification.is_read == False)\
        .update({"is_read": True}, synchronize_session=False)
    
    db.commit()
    return {"message": "All notifications marked as read"}

@router.post("/notify-admins/", response_model=List[NotificationResponse])
def notify_admins(
    notification_in: NotificationBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a notification for all admin users."""
    admins = db.query(User).filter(User.role == 'admin').all()
    created_notifications = []
    
    for admin in admins:
        notification = Notification(
            user_id=admin.id,
            title=notification_in.title,
            message=notification_in.message,
            type=notification_in.type,
            icon=notification_in.icon,
            action_link=notification_in.action_link
        )
        db.add(notification)
        created_notifications.append(notification)
        
    db.commit()
    for notif in created_notifications:
        db.refresh(notif)
        
    return created_notifications

@router.post("/send/", response_model=NotificationResponse)
def send_notification(
    notification_in: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a notification for a specific user."""
    # Only admins can send custom notifications like this for now
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Only admins can send direct notifications")
        
    target_user = db.query(User).filter(User.id == notification_in.user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found")
        
    notification = Notification(
        user_id=notification_in.user_id,
        title=notification_in.title,
        message=notification_in.message,
        type=notification_in.type,
        icon=notification_in.icon,
        action_link=notification_in.action_link
    )
    
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification

@router.delete("/{notification_id}/")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a specific notification."""
    notification = db.query(Notification)\
        .filter(Notification.id == notification_id, Notification.user_id == current_user.id)\
        .first()
        
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    db.delete(notification)
    db.commit()
    return {"message": "Notification deleted"}
