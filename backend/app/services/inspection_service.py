import random
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.domain import Inspection, Batch, Alert, RejectionEvent, ModelVersion, Device
from app.ml.service import ml_service
from app.services.decision_engine import decision_engine
from app.services.action_engine import action_engine
from app.websocket.manager import ws_manager

class InspectionService:
    @staticmethod
    def process_inspection(
        db: Session,
        food_type: str,
        batch_code: str,
        image_url: Optional[str] = None,
        sensor_data: Optional[Dict[str, Any]] = None,
        forced_outcome: Optional[str] = None
    ) -> Inspection:
        # 1. Get or create batch
        batch = db.query(Batch).filter(Batch.batch_code == batch_code).first()
        if not batch:
            batch = Batch(
                batch_code=batch_code,
                food_type=food_type,
                supplier="AgriSafe Farms Ltd",
                total_quantity=2000,
                status="MONITORING"
            )
            db.add(batch)
            db.flush()

        # 2. Get active model version and device
        model_ver = db.query(ModelVersion).filter(ModelVersion.status == "ACTIVE").first()
        model_ver_id = model_ver.id if model_ver else None

        device = db.query(Device).filter(Device.device_code == "RPI-001").first()
        device_id = device.id if device else None

        # 3. Call ML Service
        ml_result = ml_service.predict(
            food_type=food_type,
            image_url=image_url,
            sensor_data=sensor_data,
            forced_outcome=forced_outcome
        )

        prediction_raw = ml_result["prediction"] # NORMAL, UNCERTAIN, SUSPICIOUS
        confidence = ml_result["confidence"]

        # 4. Evaluate via Decision Engine
        decision_eval = decision_engine.evaluate(prediction_raw, confidence)
        decision = decision_eval["decision"] # ACCEPTED, VERIFY, REJECTED

        # 5. Execute Action Engine
        action_res = action_engine.execute_action(decision)
        action_taken = action_res["action_taken"]

        # Generate unique code
        count = db.query(Inspection).count() + 1
        ins_code = f"INS-{count:05d}"

        # Verification status
        ver_status = "PENDING" if decision == "VERIFY" else "NOT_REQUIRED"

        # Image placeholder generator based on outcome
        if not image_url:
            if decision == "ACCEPTED":
                image_url = "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&auto=format&fit=crop"
            elif decision == "VERIFY":
                image_url = "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&auto=format&fit=crop"
            else:
                image_url = "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&auto=format&fit=crop"

        inspection = Inspection(
            inspection_code=ins_code,
            batch_id=batch.id,
            food_type=food_type,
            timestamp=datetime.utcnow(),
            prediction_raw=prediction_raw,
            confidence=confidence,
            decision=decision,
            action_taken=action_taken,
            model_version_id=model_ver_id,
            device_id=device_id,
            image_url=image_url,
            nir_spectrum_data=ml_result.get("nir_spectrum"),
            verification_status=ver_status
        )

        db.add(inspection)
        db.flush()

        # Create rejection event if rejected
        if decision == "REJECTED":
            rej_event = RejectionEvent(
                inspection_id=inspection.id,
                batch_id=batch.id,
                servo_response_ms=action_res.get("response_time_ms", 120),
                status="COMPLETED"
            )
            db.add(rej_event)

        # Update batch counters
        batch.inspected_count += 1
        if decision == "ACCEPTED":
            batch.accepted_count += 1
        elif decision == "VERIFY":
            batch.verify_count += 1
        elif decision == "REJECTED":
            batch.rejected_count += 1

        if batch.inspected_count > 0:
            batch.reject_rate = round((batch.rejected_count / batch.inspected_count) * 100, 2)

        # Early Warning Anomaly Detection Check
        if batch.reject_rate > 3.5 and batch.inspected_count >= 10:
            alert_code = f"ALT-{batch.batch_code}-REJ"
            existing_alert = db.query(Alert).filter(Alert.alert_code == alert_code, Alert.is_resolved == False).first()
            if not existing_alert:
                alert = Alert(
                    alert_code=alert_code,
                    severity="WARNING",
                    title="Suspicious Event Frequency Increase",
                    message=f"Inspection anomaly trend detected in batch {batch.batch_code}. Rejection rate reached {batch.reject_rate}%. Consider verification or laboratory testing.",
                    batch_id=batch.id
                )
                db.add(alert)

        db.commit()
        db.refresh(inspection)

        return inspection

inspection_service = InspectionService()
