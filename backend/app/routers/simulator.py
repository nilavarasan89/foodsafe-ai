import asyncio
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database.session import SessionLocal, get_db
from app.services.inspection_service import inspection_service
from app.websocket.manager import ws_manager

router = APIRouter(tags=["Hardware API & Demo Simulator"])

class DeviceInspectionPayload(BaseModel):
    device_id: str = "RPI-001"
    batch_id: str = "CHK-2026-017"
    food_type: str = "Chicken"
    image_url: Optional[str] = None
    sensor_data: Optional[Dict[str, Any]] = None

class DemoStepRequest(BaseModel):
    step_type: str = "ACCEPTED" # ACCEPTED, VERIFY, REJECTED, AUTO
    food_type: str = "Chicken"
    batch_code: str = "CHK-2026-017"

simulator_running = False

@router.post("/api/device/inspection")
async def rpi_hardware_inspection_endpoint(
    payload: DeviceInspectionPayload,
    db: Session = Depends(get_db)
):
    """
    Endpoint called directly by Raspberry Pi edge computer REST client.
    """
    ins = inspection_service.process_inspection(
        db=db,
        food_type=payload.food_type,
        batch_code=payload.batch_id,
        image_url=payload.image_url,
        sensor_data=payload.sensor_data
    )

    # Broadcast real-time WebSocket event
    event = {
        "event_type": "NEW_INSPECTION",
        "data": {
            "id": ins.id,
            "inspection_code": ins.inspection_code,
            "food_type": ins.food_type,
            "batch_code": payload.batch_id,
            "prediction_raw": ins.prediction_raw,
            "confidence": ins.confidence,
            "decision": ins.decision,
            "action_taken": ins.action_taken,
            "image_url": ins.image_url,
            "verification_status": ins.verification_status,
            "timestamp": ins.timestamp.isoformat()
        }
    }
    await ws_manager.broadcast(event)

    return {
        "status": "SUCCESS",
        "inspection_code": ins.inspection_code,
        "decision": ins.decision,
        "action_taken": ins.action_taken,
        "confidence": ins.confidence
    }

@router.post("/api/simulator/demo-step")
async def trigger_demo_step(
    payload: DemoStepRequest,
    db: Session = Depends(get_db)
):
    """
    Triggers a specific demo step flow for presentation:
    PRODUCT #1 -> ACCEPTED
    PRODUCT #2 -> VERIFY
    PRODUCT #3 -> REJECTED
    """
    forced_map = {
        "ACCEPTED": "NORMAL",
        "VERIFY": "UNCERTAIN",
        "REJECTED": "SUSPICIOUS"
    }
    forced_outcome = forced_map.get(payload.step_type, None)

    # 1. Broadcast sequence start: PRODUCT_DETECTED
    await ws_manager.broadcast({
        "event_type": "DEMO_STAGE",
        "stage": "PRODUCT_DETECTED",
        "message": f"IR Sensor triggered for {payload.food_type} on conveyor belt."
    })
    await asyncio.sleep(0.5)

    # 2. Stage 2: NIR_IMAGE_CAPTURED
    await ws_manager.broadcast({
        "event_type": "DEMO_STAGE",
        "stage": "NIR_CAPTURED",
        "message": "Controlled NIR illumination matrix active. Hyperspectral camera captured reflectance spectrum."
    })
    await asyncio.sleep(0.5)

    # 3. Stage 3: ML_PROCESSING
    await ws_manager.broadcast({
        "event_type": "DEMO_STAGE",
        "stage": "ML_PROCESSING",
        "message": "Raspberry Pi edge model analyzing 750nm-1700nm spectral curves..."
    })
    await asyncio.sleep(0.5)

    # 4. Process inspection in DB
    ins = inspection_service.process_inspection(
        db=db,
        food_type=payload.food_type,
        batch_code=payload.batch_code,
        forced_outcome=forced_outcome
    )

    # 5. Broadcast complete event
    event = {
        "event_type": "NEW_INSPECTION",
        "stage": "DECISION_MADE",
        "data": {
            "id": ins.id,
            "inspection_code": ins.inspection_code,
            "food_type": ins.food_type,
            "batch_code": payload.batch_code,
            "prediction_raw": ins.prediction_raw,
            "confidence": ins.confidence,
            "decision": ins.decision,
            "action_taken": ins.action_taken,
            "image_url": ins.image_url,
            "verification_status": ins.verification_status,
            "timestamp": ins.timestamp.isoformat()
        }
    }
    await ws_manager.broadcast(event)

    return {
        "status": "COMPLETED",
        "step": payload.step_type,
        "inspection": {
            "inspection_code": ins.inspection_code,
            "decision": ins.decision,
            "confidence": ins.confidence
        }
    }
