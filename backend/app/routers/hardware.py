from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.domain import Device
from app.schemas.domain import DeviceStatusResponse

router = APIRouter(prefix="/devices", tags=["Hardware & Device Status"])

@router.get("", response_model=List[DeviceStatusResponse])
def get_devices(db: Session = Depends(get_db)):
    devices = db.query(Device).all()
    return devices

@router.get("/{id}/status", response_model=DeviceStatusResponse)
def get_device_status(id: str, db: Session = Depends(get_db)):
    device = db.query(Device).filter((Device.id == id) | (Device.device_code == id)).first()
    if not device:
        device = db.query(Device).first()
    return device
