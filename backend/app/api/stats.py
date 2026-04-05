from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.report import Report
from app.models.gms import GMS
from app.models.assignment import GMSAssignment
from app.models.workday import Workday
from app.models.visit import Visit
from typing import Dict, Any

router = APIRouter()

@router.get("/public")
def get_public_stats(db: Session = Depends(get_db)):
    user_count = db.query(User).count()
    gms_count = db.query(GMS).count()
    total_reports = db.query(Report).count()
    
    # Estimate data points (hypothetically 10x reports)
    data_points = total_reports * 12
    
    return {
        "teams": f"{user_count}+",
        "stores": f"{gms_count}+",
        "reports": f"{total_reports}+",
        "data_points": f"{round(data_points / 1000, 1)}K" if data_points > 1000 else str(data_points)
    }

@router.get("/admin")
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user_count = db.query(User).count()
    gms_count = db.query(GMS).count()
    total_reports = db.query(Report).count()
    pending_reports = db.query(Report).filter(Report.status == "pending").count()
    
    return {
        "users": user_count,
        "stores": gms_count,
        "total_reports": total_reports,
        "pending_reports": pending_reports
    }

@router.get("/supervisor")
def get_supervisor_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "supervisor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Supervisor stats: stores assigned to them, reports from their merchandisers
    # For now, let's just get general stats or filter by some logic if available
    # Assuming supervisor sees all stores and reports they supervise
    
    assigned_stores = db.query(GMS).count() # Placeholder for actual supervision logic
    active_teams = db.query(User).filter(User.role == "merchandiser").count()
    pending_reports = db.query(Report).filter(Report.status == "pending").count()
    
    return {
        "assigned_stores": assigned_stores,
        "active_teams": active_teams,
        "pending_reports": pending_reports
    }

@router.get("/merchandiser")
def get_merchandiser_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Stores assigned to this merchandiser
    stores_count = db.query(GMSAssignment).filter(GMSAssignment.user_id == current_user.id).count()
    
    # Reports done by this merchandiser
    reports_count = db.query(Report).filter(Report.user_id == current_user.id).count()
    
    # Target hits (percentage of reports approved)
    total_reports = db.query(Report).filter(Report.user_id == current_user.id).count()
    approved_reports = db.query(Report).filter(Report.user_id == current_user.id, Report.status == "approved").count()
    
    target_hit = round((approved_reports / total_reports * 100), 1) if total_reports > 0 else 0
    
    return {
        "stores_assigned": stores_count,
        "reports_done": reports_count,
        "target_hit": f"{target_hit}%"
    }
