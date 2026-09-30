from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.domain import SystemConfig, AuditLog
from app.schemas.domain import SystemSettingsResponse, SystemSettingsUpdate
from app.config import settings

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("", response_model=SystemSettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    norm_cfg = db.query(SystemConfig).filter(SystemConfig.key == "NORMAL_CONFIDENCE_THRESHOLD").first()
    susp_cfg = db.query(SystemConfig).filter(SystemConfig.key == "SUSPICIOUS_CONFIDENCE_THRESHOLD").first()
    spd_cfg = db.query(SystemConfig).filter(SystemConfig.key == "SIMULATOR_SPEED_MS").first()

    norm_val = float(norm_cfg.value) if norm_cfg else settings.NORMAL_CONFIDENCE_THRESHOLD
    susp_val = float(susp_cfg.value) if susp_cfg else settings.SUSPICIOUS_CONFIDENCE_THRESHOLD
    spd_val = int(spd_cfg.value) if spd_cfg else 2000

    return {
        "normal_confidence_threshold": norm_val,
        "suspicious_confidence_threshold": susp_val,
        "simulator_speed_ms": spd_val,
        "disclaimer": "Thresholds are application configuration values and require validation before production deployment."
    }

@router.put("", response_model=SystemSettingsResponse)
def update_settings(payload: SystemSettingsUpdate, db: Session = Depends(get_db)):
    configs = {
        "NORMAL_CONFIDENCE_THRESHOLD": str(payload.normal_confidence_threshold),
        "SUSPICIOUS_CONFIDENCE_THRESHOLD": str(payload.suspicious_confidence_threshold),
        "SIMULATOR_SPEED_MS": str(payload.simulator_speed_ms)
    }

    for key, value in configs.items():
        cfg = db.query(SystemConfig).filter(SystemConfig.key == key).first()
        if cfg:
            cfg.value = value
        else:
            db.add(SystemConfig(key=key, value=value))

    # Audit log
    audit = AuditLog(
        user_email="admin@foodsafe.ai",
        action="SETTINGS_UPDATED",
        details=f"Updated confidence thresholds: Normal={payload.normal_confidence_threshold}, Suspicious={payload.suspicious_confidence_threshold}, Speed={payload.simulator_speed_ms}ms"
    )
    db.add(audit)
    db.commit()

    # Update in-memory settings
    settings.NORMAL_CONFIDENCE_THRESHOLD = payload.normal_confidence_threshold
    settings.SUSPICIOUS_CONFIDENCE_THRESHOLD = payload.suspicious_confidence_threshold

    return {
        "normal_confidence_threshold": payload.normal_confidence_threshold,
        "suspicious_confidence_threshold": payload.suspicious_confidence_threshold,
        "simulator_speed_ms": payload.simulator_speed_ms,
        "disclaimer": "Thresholds are application configuration values and require validation before production deployment."
    }
