from typing import List
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
import json
from app.database.session import get_db
from app.models.domain import FeedbackSample
from app.schemas.domain import FeedbackSampleResponse

router = APIRouter(prefix="/feedback", tags=["Feedback Dataset"])

@router.get("", response_model=List[FeedbackSampleResponse])
def get_feedback_samples(db: Session = Depends(get_db)):
    samples = db.query(FeedbackSample).order_by(FeedbackSample.created_at.desc()).all()
    return samples

@router.post("/export")
def export_feedback_dataset(db: Session = Depends(get_db)):
    samples = db.query(FeedbackSample).all()
    data = []
    for s in samples:
        data.append({
            "sample_code": s.sample_code,
            "original_prediction": s.original_prediction,
            "confidence": s.confidence,
            "verified_result": s.verified_result,
            "verifier_name": s.verifier_name,
            "status": s.status,
            "dataset_version": s.dataset_version,
            "created_at": s.created_at.isoformat()
        })
    
    json_str = json.dumps({"dataset_version": "v1.2-retraining-candidate", "count": len(data), "samples": data}, indent=2)
    return Response(content=json_str, media_type="application/json", headers={"Content-Disposition": "attachment; filename=foodsafe_feedback_dataset.json"})
