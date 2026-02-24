from __future__ import annotations
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.db.session import SessionLocal
from app.models.report import Report
from app.models.user import User
from app.models.notification import Notification
from app.schemas.report import ReportCreate, ReportResponse

router = APIRouter()

from app.api.deps import get_db, get_current_user

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
    from app.models.workday import Workday
    from app.models.visit import Visit
    active_visit = db.query(Visit).join(Workday).filter(
        Workday.user_id == current_user.id,
        Workday.status == "active",
        Visit.status == "in_progress"
    ).first()
    
    if active_visit:
        db_report.visit_id = active_visit.id
        # If GMS ID wasn't provided, use the visit's GMS ID
        if not db_report.gms_id:
            db_report.gms_id = active_visit.gms_id

    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    # Trigger notifications for all admins and supervisors
    recipients = db.query(User).filter(User.role.in_(['admin', 'supervisor'])).all()
    for user in recipients:
        # Don't notify the creator if they are a supervisor
        if user.id != current_user.id:
            notif = Notification(
                user_id=user.id,
                title="New Product Report",
                message=f"{current_user.first_name} submitted a report for '{db_report.name}'",
                type="info",
                icon="document-text",
                action_link=f"/admin/before-after?id={db_report.id}"
            )
            db.add(notif)
    db.commit()

    # Re-fetch with user relationship loaded
    db_report = db.query(Report).options(joinedload(Report.user)).filter(Report.id == db_report.id).first()
    return db_report

@router.get("/", response_model=List[ReportResponse])
def read_reports(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Admins/Supervisors see all, Merchandisers see their own
    query = db.query(Report).options(joinedload(Report.user))
    if current_user.role not in ['admin', 'supervisor']:
        query = query.filter(Report.user_id == current_user.id)
    reports = query.offset(skip).limit(limit).all()
    return reports

@router.get("/{report_id}", response_model=ReportResponse)
def read_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(Report).options(joinedload(Report.user)).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Check permissions
    if current_user.role not in ['admin', 'supervisor'] and report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this report")
    
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
        raise HTTPException(status_code=403, detail="Only admins and supervisors can validate reports")
    
    db_report = db.query(Report).options(joinedload(Report.user)).filter(Report.id == report_id).first()
    if not db_report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    db_report.status = status
    if rejection_reason:
        db_report.rejection_reason = rejection_reason
    
    db.commit()
    db.refresh(db_report)
    
    # Notify merchandiser
    notif = Notification(
        user_id=db_report.user_id,
        title=f"Report {status.capitalize()}",
        message=f"Your report '{db_report.name}' has been {status}.",
        type="info" if status == "approved" else "warning",
        icon="checkmark-circle" if status == "approved" else "close-circle"
    )
    db.add(notif)
    db.commit()
    
    return db_report
