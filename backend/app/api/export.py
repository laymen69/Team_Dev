import io
import logging
from datetime import datetime, date, timezone
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

logger = logging.getLogger(__name__)

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False
    logger.warning("Reportlab is not installed. PDF exports will fail.")

router = APIRouter()

@router.get("/daily-report")
def export_daily_report(
    target_date: date = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not HAS_REPORTLAB:
        raise HTTPException(
            status_code=500, 
            detail="PDF generation library (reportlab) is not installed on the server."
        )
        
    if current_user.role not in ["admin", "supervisor"]:
        raise HTTPException(status_code=403, detail="Forbidden: Admin or Supervisor access required.")

    # Use UTC for consistent date filtering across timezones
    if not target_date:
        target_date = datetime.now(timezone.utc).date()

    # Optimized Querying using count() for efficiency
    merch_count = db.query(User).filter(User.role == "merchandiser").count()
    active_workdays = db.query(Workday).filter(func.date(Workday.start_time) == target_date).count()
    
    visits_completed = db.query(Visit).join(Workday).filter(
        func.date(Workday.start_time) == target_date, 
        Visit.status == "completed"
    ).count()
    
    reports_submitted = db.query(Report).filter(func.date(Report.created_at) == target_date).count()
    complaints_count = db.query(Complaint).filter(func.date(Complaint.created_at) == target_date).count()

    # Create PDF in memory
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    story = []
    
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    title_style.alignment = 1 # Center
    
    story.append(Paragraph(f"Merchandising Daily Report", title_style))
    story.append(Paragraph(f"Generated on: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')} UTC", styles['Normal']))
    story.append(Paragraph(f"Report Date: {target_date.strftime('%B %d, %Y')}", styles['Normal']))
    story.append(Spacer(1, 20))

    # Executive Summary Table
    story.append(Paragraph("Executive Summary", styles['Heading2']))
    story.append(Spacer(1, 10))
    
    summary_data = [
        ["Metric", "Value"],
        ["Total Merchandisers", str(merch_count)],
        ["Active Workdays Today", str(active_workdays)],
        ["Completed Visits", str(visits_completed)],
        ["Reports Submitted", str(reports_submitted)],
        ["New Complaints", str(complaints_count)],
    ]

    summary_table = Table(summary_data, colWidths=[200, 100])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#4F46E5")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 30))

    # Detailed Activity Table
    story.append(Paragraph("Merchandiser Activity Detail", styles['Heading2']))
    story.append(Spacer(1, 10))

    workdays = db.query(Workday).filter(func.date(Workday.start_time) == target_date).all()
    if workdays:
        merch_detail_data = [["Merchandiser", "Start", "End", "Status"]]
        for wd in workdays:
            # Note: In production, consider joinedload(Workday.user) to avoid N+1
            user_name = f"{wd.user.first_name} {wd.user.last_name}" if wd.user else f"ID: {wd.user_id}"
            start = wd.start_time.strftime("%H:%M") if wd.start_time else "N/A"
            end = wd.end_time.strftime("%H:%M") if wd.end_time else "N/A"
            merch_detail_data.append([user_name, start, end, wd.status.capitalize()])
            
        detail_table = Table(merch_detail_data, colWidths=[150, 100, 100, 100])
        detail_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.whitesmoke, colors.beige])
        ]))
        story.append(detail_table)
    else:
        story.append(Paragraph("No merchandiser activity recorded for this date.", styles['Normal']))

    doc.build(story)
    
    buffer.seek(0)
    filename = f"daily_report_{target_date}.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
