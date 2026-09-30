from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.domain import Inspection, VerificationRecord, FeedbackSample, AuditLog, User
from app.schemas.domain import VerificationCreate, VerificationResponse

router = APIRouter(prefix="/verification", tags=["Verification Center"])

@router.get("/pending")
def get_pending_verifications(db: Session = Depends(get_db)):
    inspections = db.query(Inspection).filter(
        Inspection.decision == "VERIFY",
        Inspection.verification_status == "PENDING"
    ).order_by(Inspection.timestamp.desc()).all()

    result = []
    for ins in inspections:
        result.append({
            "id": ins.id,
            "inspection_code": ins.inspection_code,
            "food_type": ins.food_type,
            "batch_code": ins.batch.batch_code if ins.batch else "N/A",
            "prediction_raw": ins.prediction_raw,
            "confidence": ins.confidence,
            "image_url": ins.image_url,
            "timestamp": ins.timestamp,
            "verification_status": ins.verification_status
        })
    return result

@router.get("/summary")
def get_verification_summary(db: Session = Depends(get_db)):
    pending = db.query(Inspection).filter(Inspection.decision == "VERIFY", Inspection.verification_status == "PENDING").count()
    total_verified = db.query(VerificationRecord).count()
    normal_verified = db.query(VerificationRecord).filter(VerificationRecord.human_verification == "NORMAL").count()
    suspicious_verified = db.query(VerificationRecord).filter(VerificationRecord.human_verification == "SUSPICIOUS").count()

    return {
        "pending_count": pending,
        "verified_today": total_verified,
        "normal_after_verification": normal_verified,
        "suspicious_after_verification": suspicious_verified
    }

@router.post("/{inspection_id}/verify", response_model=VerificationResponse)
def submit_verification(
    inspection_id: str,
    payload: VerificationCreate,
    db: Session = Depends(get_db)
):
    ins = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not ins:
        raise HTTPException(status_code=404, detail="Inspection not found")

    if ins.verification_record:
        raise HTTPException(status_code=400, detail="Inspection has already been verified")

    # 1. Create Verification Record
    ver_record = VerificationRecord(
        inspection_id=ins.id,
        ai_prediction=ins.prediction_raw,
        ai_confidence=ins.confidence,
        human_verification=payload.human_verification,
        verifier_name="Dr. Sarah Chen (Quality Operator)",
        notes=payload.notes,
        created_at=datetime.utcnow()
    )
    db.add(ver_record)
    db.flush()

    # 2. Update Inspection verification status
    ins.verification_status = "VERIFIED"

    # 3. Create Feedback Sample for ML retraining pipeline
    fb_count = db.query(FeedbackSample).count() + 1
    sample_code = f"FB-{fb_count:04d}"

    fb_sample = FeedbackSample(
        sample_code=sample_code,
        verification_id=ver_record.id,
        inspection_id=ins.id,
        original_prediction=ins.prediction_raw,
        confidence=ins.confidence,
        verified_result=payload.human_verification,
        verifier_name=ver_record.verifier_name,
        status="READY_FOR_TRAINING",
        dataset_version="v1.2-feedback-subset"
    )
    db.add(fb_sample)

    # 4. Audit Log
    audit = AuditLog(
        user_email="quality@foodsafe.ai",
        action="VERIFICATION_COMPLETED",
        details=f"Verified inspection {ins.inspection_code} as {payload.human_verification}. Added feedback sample {sample_code}."
    )
    db.add(audit)

    db.commit()
    db.refresh(ver_record)

    return ver_record
