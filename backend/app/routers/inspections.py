from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.domain import Inspection, Batch, VerificationRecord, ModelVersion, Device
from app.schemas.domain import InspectionResponse, InspectionDetailResponse, InspectionCreate
from app.services.inspection_service import inspection_service

router = APIRouter(prefix="/inspections", tags=["Inspections"])

@router.get("", response_model=List[InspectionResponse])
def get_inspections(
    skip: int = 0,
    limit: int = 100,
    food_type: Optional[str] = None,
    batch_code: Optional[str] = None,
    decision: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Inspection)

    if food_type:
        query = query.filter(Inspection.food_type == food_type)
    if decision:
        query = query.filter(Inspection.decision == decision)
    if batch_code:
        query = query.join(Batch).filter(Batch.batch_code == batch_code)
    if search:
        query = query.filter(
            (Inspection.inspection_code.ilike(f"%{search}%")) |
            (Inspection.food_type.ilike(f"%{search}%"))
        )

    inspections = query.order_by(Inspection.timestamp.desc()).offset(skip).limit(limit).all()
    return inspections

@router.get("/{id}", response_model=InspectionDetailResponse)
def get_inspection_detail(id: str, db: Session = Depends(get_db)):
    ins = db.query(Inspection).filter((Inspection.id == id) | (Inspection.inspection_code == id)).first()
    if not ins:
        raise HTTPException(status_code=404, detail="Inspection record not found")

    batch = db.query(Batch).filter(Batch.id == ins.batch_id).first()

    # Timeline steps reconstruction
    ts = ins.timestamp
    timeline = [
        {
            "time_offset": ts.strftime("%H:%M:%S.%f")[:-3],
            "step": "Product Detected",
            "detail": f"IR/photoelectric sensor triggered on conveyor for {ins.food_type}.",
            "status": "success"
        },
        {
            "time_offset": (ts).strftime("%H:%M:%S.%f")[:-3],
            "step": "NIR Image & Spectrum Captured",
            "detail": "NIR camera (750nm - 1700nm) acquired high-resolution spectral reflectance curve.",
            "status": "success"
        },
        {
            "time_offset": (ts).strftime("%H:%M:%S.%f")[:-3],
            "step": "ML Prediction Completed",
            "detail": f"Model classified pattern as {ins.prediction_raw} with {ins.confidence*100:.1f}% confidence.",
            "status": "warning" if ins.prediction_raw != "NORMAL" else "success"
        },
        {
            "time_offset": (ts).strftime("%H:%M:%S.%f")[:-3],
            "step": f"Decision Evaluated: {ins.decision}",
            "detail": f"Confidence-aware Decision Engine assigned outcome {ins.decision}.",
            "status": "danger" if ins.decision == "REJECTED" else ("warning" if ins.decision == "VERIFY" else "success")
        },
        {
            "time_offset": (ts).strftime("%H:%M:%S.%f")[:-3],
            "step": f"Action Executed: {ins.action_taken}",
            "detail": f"Hardware signal executed: {ins.action_taken} for batch {batch.batch_code if batch else 'N/A'}.",
            "status": "success"
        }
    ]

    ver_rec = None
    if ins.verification_record:
        ver_rec = {
            "human_verification": ins.verification_record.human_verification,
            "verifier_name": ins.verification_record.verifier_name,
            "notes": ins.verification_record.notes,
            "created_at": ins.verification_record.created_at.strftime("%Y-%m-%d %H:%M")
        }

    return {
        "id": ins.id,
        "inspection_code": ins.inspection_code,
        "batch_id": ins.batch_id,
        "food_type": ins.food_type,
        "timestamp": ins.timestamp,
        "prediction_raw": ins.prediction_raw,
        "confidence": ins.confidence,
        "decision": ins.decision,
        "action_taken": ins.action_taken,
        "model_version_id": ins.model_version_id or "FoodSafe-AI-v1.2",
        "device_id": ins.device_id or "RPI-001",
        "verification_status": ins.verification_status,
        "image_url": ins.image_url,
        "camera_id": ins.camera_id,
        "sensor_id": ins.sensor_id,
        "nir_spectrum_data": ins.nir_spectrum_data,
        "timeline": timeline,
        "verification_record": ver_rec
    }

@router.post("", response_model=InspectionResponse)
def create_inspection(payload: InspectionCreate, db: Session = Depends(get_db)):
    ins = inspection_service.process_inspection(
        db=db,
        food_type=payload.food_type,
        batch_code=payload.batch_code,
        image_url=payload.image_url,
        sensor_data=payload.sensor_data
    )
    return ins
