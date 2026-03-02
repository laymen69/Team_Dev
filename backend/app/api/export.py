import io
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.workday import Workday
from app.models.visit import Visit
from app.models.report import Report
from app.models.complaint import Complaint

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False

router = APIRouter()

@router.get("/daily-report")
def export_daily_report(
    target_date: date = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not HAS_REPORTLAB:
        raise HTTPException(status_code=500, detail="Reportlab library is not installed")
        
    if current_user.role not in ["admin", "supervisor"]:
        raise HTTPException(status_code=403, detail="Forbidden")

    if not target_date:
        target_date = datetime.now().date()

    # Query daily stats
    users = db.query(User).filter(User.role == "merchandiser").count()
    active_workdays = db.query(Workday).filter(func.date(Workday.start_time) == target_date).count()
    visits_completed = db.query(Visit).join(Workday).filter(
        func.date(Workday.start_time) == target_date, 
        Visit.status == "completed"
    ).count()
    reports_submitted = db.query(Report).filter(func.date(Report.created_at) == target_date).count()
    complaints = db.query(Complaint).filter(func.date(Complaint.created_at) == target_date).count()

    # Create PDF
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    Story = []
    
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    title_style.alignment = 1 # Center
    
    Story.append(Paragraph(f"Merchandising Daily Report", title_style))
    Story.append(Paragraph(f"Date: {target_date.strftime('%B %d, %Y')}", styles['Normal']))
    Story.append(Spacer(1, 20))

    # Executive Summary
    Story.append(Paragraph("Executive Summary", styles['Heading2']))
    Story.append(Spacer(1, 10))
    
    summary_data = [
        ["Metric", "Value"],
        ["Total Merchandisers", str(users)],
        ["Active Today", str(active_workdays)],
        ["Visits Completed", str(visits_completed)],
        ["Reports Submitted", str(reports_submitted)],
        ["Complaints/Issues", str(complaints)],
    ]

    t = Table(summary_data, colWidths=[200, 100])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#4F46E5")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    Story.append(t)
    Story.append(Spacer(1, 30))

    # Merchandiser Details
    Story.append(Paragraph("Merchandiser Activity", styles['Heading2']))
    Story.append(Spacer(1, 10))

    workdays = db.query(Workday).filter(func.date(Workday.start_time) == target_date).all()
    if workdays:
        merch_data = [["Name", "Start Time", "End Time", "Status"]]
        for wd in workdays:
            user_info = db.query(User).filter(User.id == wd.user_id).first()
            name = f"{user_info.first_name} {user_info.last_name}" if user_info else "Unknown"
            start = wd.start_time.strftime("%H:%M") if wd.start_time else "N/A"
            end = wd.end_time.strftime("%H:%M") if wd.end_time else "N/A"
            merch_data.append([name, start, end, wd.status.upper()])
            
        t2 = Table(merch_data, colWidths=[150, 100, 100, 100])
        t2.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.gray),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        Story.append(t2)
    else:
        Story.append(Paragraph("No activity recorded for this date.", styles['Normal']))

    doc.build(Story)
    
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=daily_report_{target_date}.pdf"}
    )
