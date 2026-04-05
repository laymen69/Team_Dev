from __future__ import annotations
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.api.deps import get_db, get_current_user
from app.models.report import Report
from app.models.user import User
from app.models.notification import Notification
from app.models.workday import Workday
from app.models.visit import Visit
from app.schemas.report import ReportCreate, ReportResponse

router = APIRouter()

@router.post("/", response_model=ReportResponse)
def create_report(
    report: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_report = Report(
        name=report.name,
        notes=report.notes,
        type=report.type,
        status=report.status,
        visits_planned=report.visits_planned,
        visits_completed=report.visits_completed,
        before_image=report.before_image,
        after_image=report.after_image,
        user_id=current_user.id,
        gms_id=report.gms_id
    )
    
    # Automatically link to active visit if it exists
    active_visit = db.query(Visit).join(Workday).filter(
        Workday.user_id == current_user.id,
        Workday.status == "active",
        Visit.status == "in_progress"
    ).first()
    
    if active_visit:
        db_report.visit_id = active_visit.id
        if not db_report.gms_id:
            db_report.gms_id = active_visit.gms_id

    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    # Optimized notification broadcast
    admins = db.query(User).filter(User.role.in_(['admin', 'supervisor'])).all()
    for user in admins:
        if user.id != current_user.id:
            db.add(Notification(
                user_id=user.id,
                title="New Product Report",
                message=f"{current_user.first_name} submitted a report for '{db_report.name}'",
                type="info",
                icon="document-text",
                action_link=f"/admin/before-after?id={db_report.id}"
            ))
    db.commit()

    # Eager load user and gms for the response
    db_report = db.query(Report).options(
        joinedload(Report.user),
        joinedload(Report.gms)
    ).filter(Report.id == db_report.id).first()
    
    return db_report

@router.get("/", response_model=List[ReportResponse])
def read_reports(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Performance: joinedload to fix N+1
    query = db.query(Report).options(
        joinedload(Report.user),
        joinedload(Report.gms)
    )
    
    if current_user.role not in ['admin', 'supervisor']:
        query = query.filter(Report.user_id == current_user.id)
        
    reports = query.order_by(Report.created_at.desc()).offset(skip).limit(limit).all()
    return reports

@router.get("/{report_id}", response_model=ReportResponse)
def read_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(Report).options(
        joinedload(Report.user),
        joinedload(Report.gms)
    ).filter(Report.id == report_id).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if current_user.role not in ['admin', 'supervisor'] and report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return report

@router.patch("/{report_id}/status", response_model=ReportResponse)
def update_report_status(
    report_id: int,
    status: str,
    rejection_reason: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ['admin', 'supervisor']:
        raise HTTPException(status_code=403, detail="Only admins/supervisors can validate")
    
    db_report = db.query(Report).options(joinedload(Report.user)).filter(Report.id == report_id).first()
    if not db_report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    db_report.status = status
    if rejection_reason:
        db_report.rejection_reason = rejection_reason
    
    # Notify merchandiser
    db.add(Notification(
        user_id=db_report.user_id,
        title=f"Report {status.capitalize()}",
        message=f"Your report '{db_report.name}' has been {status}.",
        type="info" if status == "approved" else "warning",
        icon="checkmark-circle" if status == "approved" else "close-circle"
    ))
    db.commit()
    db.refresh(db_report)
    
    return db_report
