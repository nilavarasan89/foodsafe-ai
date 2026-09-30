from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.domain import Batch, Inspection, VerificationRecord
from app.schemas.domain import BatchResponse, BatchCreate

router = APIRouter(prefix="/batches", tags=["Batch Management"])

@router.get("", response_model=List[BatchResponse])
def get_batches(db: Session = Depends(get_db)):
    batches = db.query(Batch).order_by(Batch.created_at.desc()).all()
    for b in batches:
        b.qr_code_url = f"/api/verify/batch/{b.batch_code}/qr"
    return batches

@router.get("/{id}")
def get_batch_detail(id: str, db: Session = Depends(get_db)):
    batch = db.query(Batch).filter((Batch.id == id) | (Batch.batch_code == id)).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    inspections = db.query(Inspection).filter(Inspection.batch_id == batch.id).order_by(Inspection.timestamp.desc()).limit(50).all()

    inspection_records = []
    for ins in inspections:
        inspection_records.append({
            "id": ins.id,
            "inspection_code": ins.inspection_code,
            "timestamp": ins.timestamp,
            "prediction_raw": ins.prediction_raw,
            "confidence": ins.confidence,
            "decision": ins.decision,
            "action_taken": ins.action_taken,
            "image_url": ins.image_url,
            "verification_status": ins.verification_status
        })

    total = batch.inspected_count if batch.inspected_count > 0 else 1
    acc_pct = round((batch.accepted_count / total) * 100, 1)
    ver_pct = round((batch.verify_count / total) * 100, 1)
    rej_pct = round((batch.rejected_count / total) * 100, 1)

    return {
        "id": batch.id,
        "batch_code": batch.batch_code,
        "food_type": batch.food_type,
        "production_date": batch.production_date,
        "supplier": batch.supplier,
        "total_quantity": batch.total_quantity,
        "inspected_count": batch.inspected_count,
        "accepted_count": batch.accepted_count,
        "verify_count": batch.verify_count,
        "rejected_count": batch.rejected_count,
        "reject_rate": batch.reject_rate,
        "acceptance_rate": acc_pct,
        "verification_rate": ver_pct,
        "status": batch.status,
        "qr_code_url": f"/verify/batch/{batch.batch_code}",
        "inspections": inspection_records
    }

@router.post("", response_model=BatchResponse)
def create_batch(payload: BatchCreate, db: Session = Depends(get_db)):
    existing = db.query(Batch).filter(Batch.batch_code == payload.batch_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Batch code already exists")

    batch = Batch(
        batch_code=payload.batch_code,
        food_type=payload.food_type,
        supplier=payload.supplier,
        total_quantity=payload.total_quantity,
        status="MONITORING"
    )
    db.add(batch)
    db.commit()
    db.refresh(batch)
    batch.qr_code_url = f"/verify/batch/{batch.batch_code}"
    return batch
