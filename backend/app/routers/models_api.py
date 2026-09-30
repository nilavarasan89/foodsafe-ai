from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.domain import ModelVersion
from app.schemas.domain import ModelVersionResponse

router = APIRouter(prefix="/models", tags=["Model Monitoring"])

@router.get("", response_model=List[ModelVersionResponse])
def get_models(db: Session = Depends(get_db)):
    models = db.query(ModelVersion).order_by(ModelVersion.created_at.desc()).all()
    return models

@router.get("/active", response_model=ModelVersionResponse)
def get_active_model(db: Session = Depends(get_db)):
    model = db.query(ModelVersion).filter(ModelVersion.status == "ACTIVE").first()
    if not model:
        model = db.query(ModelVersion).order_by(ModelVersion.created_at.desc()).first()
    if not model:
        raise HTTPException(status_code=404, detail="No active ML model found")
    return model

@router.get("/{id}", response_model=ModelVersionResponse)
def get_model_detail(id: str, db: Session = Depends(get_db)):
    model = db.query(ModelVersion).filter((ModelVersion.id == id) | (ModelVersion.version_code == id)).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model version not found")
    return model
