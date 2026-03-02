from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.api.deps import get_db, get_current_user
from app.models.leave_request import LeaveRequest
from app.models.user import User
from app.models.notification import Notification
from app.schemas.leave_request import LeaveRequestCreate, LeaveReview, LeaveRequestResponse

router = APIRouter()

def _serialize(obj: LeaveRequest) -> dict:
    return {
        "id": obj.id,
        "leave_type": obj.leave_type,
        "start_date": obj.start_date,
        "end_date": obj.end_date,
        "reason": obj.reason,
        "status": obj.status,
        "admin_comment": obj.admin_comment,
        "user_id": obj.user_id,
        "requester_name": f"{obj.user.first_name} {obj.user.last_name}" if obj.user else "Unknown",
        "requester_role": obj.user.role if obj.user else "",
        "created_at": obj.created_at,
    }

@router.get("/", response_model=List[LeaveRequestResponse])
def list_leaves(
    status: str | None = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(LeaveRequest).options(joinedload(LeaveRequest.user))
    if current_user.role not in ["admin", "supervisor"]:
        query = query.filter(LeaveRequest.user_id == current_user.id)
    if status:
        query = query.filter(LeaveRequest.status == status)
    leaves = query.order_by(LeaveRequest.created_at.desc()).offset(skip).limit(limit).all()
    return [LeaveRequestResponse(**_serialize(r)) for r in leaves]

@router.post("/", response_model=LeaveRequestResponse)
def create_leave(
    payload: LeaveRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    leave = LeaveRequest(**payload.model_dump(), user_id=current_user.id)
    db.add(leave)
    db.commit()
    db.refresh(leave)

    # Alert admins
    admins = db.query(User).filter(User.role == "admin").all()
    for admin in admins:
        notif = Notification(
            user_id=admin.id,
            title="New Leave Request",
            message=f"{current_user.first_name} {current_user.last_name} submitted a {payload.leave_type} leave request.",
            type="info",
            icon="calendar",
        )
        db.add(notif)
    db.commit()

    leave = db.query(LeaveRequest).options(joinedload(LeaveRequest.user)).filter(LeaveRequest.id == leave.id).first()
    return LeaveRequestResponse(**_serialize(leave))

@router.patch("/{leave_id}/review", response_model=LeaveRequestResponse)
def review_leave(
    leave_id: int,
    payload: LeaveReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "supervisor"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    leave = db.query(LeaveRequest).options(joinedload(LeaveRequest.user)).filter(LeaveRequest.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    if payload.status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="status must be 'approved' or 'rejected'")

    leave.status = payload.status
    leave.admin_comment = payload.admin_comment
    leave.reviewed_by = current_user.id
    leave.reviewed_at = datetime.now(timezone.utc)
    db.commit()

    # Notify requester
    icon = "checkmark-circle" if payload.status == "approved" else "close-circle"
    notif = Notification(
        user_id=leave.user_id,
        title=f"Leave Request {payload.status.capitalize()}",
        message=payload.admin_comment or f"Your leave request from {leave.start_date} to {leave.end_date} has been {payload.status}.",
        type="info" if payload.status == "approved" else "warning",
        icon=icon,
    )
    db.add(notif)
    db.commit()
    db.refresh(leave)

    return LeaveRequestResponse(**_serialize(leave))
