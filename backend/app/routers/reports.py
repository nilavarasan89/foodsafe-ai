from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.domain import Report, Batch
from app.schemas.domain import ReportGenerateRequest, ReportResponse
from app.services.report_service import report_service

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("", response_model=List[ReportResponse])
def get_reports(db: Session = Depends(get_db)):
    reports = db.query(Report).order_by(Report.created_at.desc()).all()
    return reports

@router.post("/generate", response_model=ReportResponse)
def generate_report(payload: ReportGenerateRequest, db: Session = Depends(get_db)):
    batch = None
    if payload.batch_id:
        batch = db.query(Batch).filter((Batch.id == payload.batch_id) | (Batch.batch_code == payload.batch_id)).first()
    if not batch:
        batch = db.query(Batch).first()

    report_title = payload.title or f"FOODSAFE AI Inspection Report - {batch.batch_code if batch else 'General'}"
    
    report = Report(
        title=report_title,
        report_type=payload.report_type,
        batch_id=batch.id if batch else None,
        generated_by="admin@foodsafe.ai",
        file_path=f"/reports/{batch.batch_code if batch else 'summary'}.pdf",
        file_url=f"/api/reports/download/{batch.id if batch else 'latest'}"
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report

@router.get("/download/{id}")
def download_report_pdf(id: str, db: Session = Depends(get_db)):
    pdf_bytes = report_service.generate_batch_pdf(db=db, batch_id=id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=FOODSAFE_AI_Report_{id}.pdf"}
    )
