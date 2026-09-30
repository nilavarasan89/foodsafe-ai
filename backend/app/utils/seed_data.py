import random
import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.domain import (
    User, FoodProduct, Batch, Device, ModelVersion, Inspection,
    VerificationRecord, FeedbackSample, RejectionEvent, DeviceEvent, Alert, Report, AuditLog, SystemConfig
)
from app.utils.security import get_password_hash

def seed_database(db: Session):
    # Check if database already seeded
    if db.query(User).filter(User.email == "admin@foodsafe.ai").first():
        return

    # 1. Users
    users = [
        User(
            email="admin@foodsafe.ai",
            hashed_password=get_password_hash("admin123"),
            full_name="Admin Supervisor",
            role="ADMIN"
        ),
        User(
            email="operator@foodsafe.ai",
            hashed_password=get_password_hash("operator123"),
            full_name="John Operator",
            role="OPERATOR"
        ),
        User(
            email="quality@foodsafe.ai",
            hashed_password=get_password_hash("quality123"),
            full_name="Dr. Sarah Chen",
            role="QUALITY_MANAGER"
        )
    ]
    for u in users:
        db.add(u)
    db.flush()

    # 2. Food Products
    products = [
        FoodProduct(name="Chicken", category="Poultry", default_normal_threshold=0.90, default_suspicious_threshold=0.70, description="Fresh poultry cuts inspected for surface spectral anomalies."),
        FoodProduct(name="Leafy Greens", category="Produce", default_normal_threshold=0.88, default_suspicious_threshold=0.68, description="Spinach and lettuce leaves screened for moisture & cellular degradation."),
        FoodProduct(name="Tomato", category="Produce", default_normal_threshold=0.92, default_suspicious_threshold=0.72, description="Whole tomatoes inspected for internal soft tissue rot."),
        FoodProduct(name="Fish", category="Seafood", default_normal_threshold=0.90, default_suspicious_threshold=0.70, description="Raw fish fillets inspected for spectral freshness profiles.")
    ]
    for p in products:
        db.add(p)
    db.flush()

    # 3. Devices
    devices = [
        Device(device_code="RPI-001", name="Raspberry Pi 4 Edge Gateway", type="EDGE_COMPUTER", ip_address="192.168.1.105", firmware_version="v2.4.1", status="ONLINE"),
        Device(device_code="NIR-CAM-01", name="Specim FX10 NIR Hyperspectral Camera", type="NIR_CAMERA", ip_address="192.168.1.106", firmware_version="v1.8.2", status="ONLINE"),
        Device(device_code="IR-SENS-01", name="Photoelectric Object Sensor", type="IR_SENSOR", ip_address="192.168.1.107", firmware_version="v1.0.4", status="ONLINE"),
        Device(device_code="ILLUM-01", name="Halogen-NIR Illumination Matrix", type="ILLUMINATION", ip_address="192.168.1.108", firmware_version="v1.2.0", status="ONLINE"),
        Device(device_code="SERVO-01", name="High-Speed Pneumatic Rejection Servo", type="SERVO", ip_address="192.168.1.109", firmware_version="v3.0.1", status="ONLINE"),
        Device(device_code="CONVEYOR-01", name="Variable Speed Inline Conveyor Motor", type="CONVEYOR", ip_address="192.168.1.110", firmware_version="v2.1.0", status="ONLINE")
    ]
    for d in devices:
        db.add(d)
    db.flush()

    # 4. Model Versions
    model_versions = [
        ModelVersion(version_code="FoodSafe-AI-v1.0", model_name="SpectralNet Baseline", type="NIR Classification", deployment_target="Cloud Server", status="ARCHIVED", accuracy=94.2, precision=93.5, recall=94.0, f1_score=93.7, training_samples_count=15000, validation_samples_count=2000, is_demo=True, created_at=datetime.utcnow() - timedelta(days=120)),
        ModelVersion(version_code="FoodSafe-AI-v1.1", model_name="SpectralNet Compact", type="NIR Classification", deployment_target="Raspberry Pi Edge", status="ARCHIVED", accuracy=96.8, precision=96.1, recall=96.5, f1_score=96.3, training_samples_count=30000, validation_samples_count=3500, is_demo=True, created_at=datetime.utcnow() - timedelta(days=60)),
        ModelVersion(version_code="FoodSafe-AI-v1.2", model_name="SpectralNet-FoodScreen", type="NIR Hyperspectral Classification", deployment_target="Raspberry Pi Edge", status="ACTIVE", accuracy=98.4, precision=97.8, recall=98.1, f1_score=97.9, training_samples_count=45000, validation_samples_count=5000, is_demo=True, created_at=datetime.utcnow() - timedelta(days=15))
    ]
    for mv in model_versions:
        db.add(mv)
    db.flush()

    active_model = model_versions[2]
    rpi_device = devices[0]

    # 5. Batches
    batches_data = [
        {"code": "CHK-2026-017", "food": "Chicken", "supplier": "PoultryCraft Farms Ltd", "total": 2000, "inspected": 2000, "acc": 1870, "ver": 82, "rej": 48, "rate": 2.40, "status": "MONITORING"},
        {"code": "CHK-2026-001", "food": "Chicken", "supplier": "AgriSafe Farms Ltd", "total": 1500, "inspected": 1500, "acc": 1450, "ver": 30, "rej": 20, "rate": 1.33, "status": "COMPLETED"},
        {"code": "LG-2026-001", "food": "Leafy Greens", "supplier": "GreenValley Organics", "total": 3000, "inspected": 3000, "acc": 2910, "ver": 60, "rej": 30, "rate": 1.00, "status": "COMPLETED"},
        {"code": "TOM-2026-003", "food": "Tomato", "supplier": "SunRipe Processing Co", "total": 2500, "inspected": 2500, "acc": 2410, "ver": 50, "rej": 40, "rate": 1.60, "status": "COMPLETED"},
        {"code": "FISH-2026-004", "food": "Fish", "supplier": "OceanFresh Fisheries", "total": 1200, "inspected": 1200, "acc": 1140, "ver": 40, "rej": 20, "rate": 1.67, "status": "COMPLETED"}
    ]

    batch_objs = {}
    for b in batches_data:
        batch_obj = Batch(
            batch_code=b["code"],
            food_type=b["food"],
            supplier=b["supplier"],
            total_quantity=b["total"],
            inspected_count=b["inspected"],
            accepted_count=b["acc"],
            verify_count=b["ver"],
            rejected_count=b["rej"],
            reject_rate=b["rate"],
            status=b["status"],
            created_at=datetime.utcnow() - timedelta(days=random.randint(1, 10))
        )
        db.add(batch_obj)
        batch_objs[b["code"]] = batch_obj
    db.flush()

    # 6. Inspections & Verification & Feedback Seed
    now = datetime.utcnow()
    inspection_counter = 1

    # Images for realistic rendering
    chicken_img = "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&auto=format&fit=crop"
    greens_img = "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop"
    tomato_img = "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop"
    fish_img = "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop"

    img_map = {
        "Chicken": chicken_img,
        "Leafy Greens": greens_img,
        "Tomato": tomato_img,
        "Fish": fish_img
    }

    # Generate historical inspections spread across past 7 days
    sample_records = [
        {"batch": "CHK-2026-017", "food": "Chicken", "pred": "NORMAL", "conf": 0.965, "dec": "ACCEPTED", "act": "CONTINUE", "ver_status": "NOT_REQUIRED", "hours_ago": 0.1},
        {"batch": "CHK-2026-017", "food": "Chicken", "pred": "UNCERTAIN", "conf": 0.782, "dec": "VERIFY", "act": "VERIFY_DIVERTER", "ver_status": "PENDING", "hours_ago": 0.3},
        {"batch": "CHK-2026-017", "food": "Chicken", "pred": "SUSPICIOUS", "conf": 0.947, "dec": "REJECTED", "act": "SERVO_REJECT", "ver_status": "NOT_REQUIRED", "hours_ago": 0.5},
        {"batch": "CHK-2026-017", "food": "Chicken", "pred": "NORMAL", "conf": 0.981, "dec": "ACCEPTED", "act": "CONTINUE", "ver_status": "NOT_REQUIRED", "hours_ago": 1.2},
        {"batch": "CHK-2026-017", "food": "Chicken", "pred": "UNCERTAIN", "conf": 0.814, "dec": "VERIFY", "act": "VERIFY_DIVERTER", "ver_status": "PENDING", "hours_ago": 1.8},
        {"batch": "LG-2026-001", "food": "Leafy Greens", "pred": "NORMAL", "conf": 0.954, "dec": "ACCEPTED", "act": "CONTINUE", "ver_status": "NOT_REQUIRED", "hours_ago": 3.0},
        {"batch": "LG-2026-001", "food": "Leafy Greens", "pred": "SUSPICIOUS", "conf": 0.920, "dec": "REJECTED", "act": "SERVO_REJECT", "ver_status": "NOT_REQUIRED", "hours_ago": 5.0},
        {"batch": "TOM-2026-003", "food": "Tomato", "pred": "NORMAL", "conf": 0.978, "dec": "ACCEPTED", "act": "CONTINUE", "ver_status": "NOT_REQUIRED", "hours_ago": 8.0},
        {"batch": "TOM-2026-003", "food": "Tomato", "pred": "UNCERTAIN", "conf": 0.745, "dec": "VERIFY", "act": "VERIFY_DIVERTER", "ver_status": "VERIFIED", "hours_ago": 12.0, "human": "NORMAL", "notes": "Manual microscopic test showed no cellular rot."},
        {"batch": "FISH-2026-004", "food": "Fish", "pred": "UNCERTAIN", "conf": 0.791, "dec": "VERIFY", "act": "VERIFY_DIVERTER", "ver_status": "VERIFIED", "hours_ago": 24.0, "human": "SUSPICIOUS", "notes": "Discoloration confirmed on secondary inspection."},
    ]

    for item in sample_records:
        b_obj = batch_objs[item["batch"]]
        ins = Inspection(
            inspection_code=f"INS-{inspection_counter:05d}",
            batch_id=b_obj.id,
            food_type=item["food"],
            timestamp=now - timedelta(hours=item["hours_ago"]),
            prediction_raw=item["pred"],
            confidence=item["conf"],
            decision=item["dec"],
            action_taken=item["act"],
            model_version_id=active_model.id,
            device_id=rpi_device.id,
            image_url=img_map.get(item["food"], chicken_img),
            nir_spectrum_data={
                "wavelengths": [750, 850, 970, 1100, 1200, 1300, 1450, 1600, 1700],
                "data_points": [
                    {"wavelength_nm": 750, "reflectance": 0.65},
                    {"wavelength_nm": 850, "reflectance": 0.72},
                    {"wavelength_nm": 970, "reflectance": 0.55},
                    {"wavelength_nm": 1100, "reflectance": 0.68},
                    {"wavelength_nm": 1200, "reflectance": 0.58},
                    {"wavelength_nm": 1300, "reflectance": 0.70},
                    {"wavelength_nm": 1450, "reflectance": 0.42 if item["dec"] == "REJECTED" else 0.62},
                    {"wavelength_nm": 1600, "reflectance": 0.67},
                    {"wavelength_nm": 1700, "reflectance": 0.69}
                ],
                "absorption_peak_nm": 1450 if item["dec"] == "REJECTED" else 970
            },
            verification_status=item["ver_status"]
        )
        db.add(ins)
        db.flush()

        if item["dec"] == "REJECTED":
            rej = RejectionEvent(
                inspection_id=ins.id,
                batch_id=b_obj.id,
                timestamp=ins.timestamp,
                servo_response_ms=115,
                status="COMPLETED"
            )
            db.add(rej)

        if item.get("human"):
            ver_rec = VerificationRecord(
                inspection_id=ins.id,
                ai_prediction=item["pred"],
                ai_confidence=item["conf"],
                human_verification=item["human"],
                verifier_name="Dr. Sarah Chen",
                notes=item.get("notes"),
                created_at=ins.timestamp + timedelta(minutes=15)
            )
            db.add(ver_rec)
            db.flush()

            fb = FeedbackSample(
                sample_code=f"FB-{inspection_counter:03d}",
                verification_id=ver_rec.id,
                inspection_id=ins.id,
                original_prediction=item["pred"],
                confidence=item["conf"],
                verified_result=item["human"],
                verifier_name="Dr. Sarah Chen",
                status="READY_FOR_TRAINING",
                dataset_version="v1.2-feedback-subset"
            )
            db.add(fb)

        inspection_counter += 1

    # 7. Alerts
    alert1 = Alert(
        alert_code="ALT-CHK-017-SPIKE",
        severity="WARNING",
        title="Suspicious Event Frequency Trend Detected",
        message="Inspection anomaly trend detected in batch CHK-2026-017. Rejection rate reached 2.4%. Consider verification or laboratory testing.",
        batch_id=batch_objs["CHK-2026-017"].id,
        is_resolved=False,
        created_at=now - timedelta(hours=2)
    )
    alert2 = Alert(
        alert_code="ALT-CAM-CALIB",
        severity="INFO",
        title="NIR Illumination Routine Calibration",
        message="NIR camera matrix completed automated self-calibration successfully.",
        batch_id=None,
        is_resolved=True,
        created_at=now - timedelta(hours=10),
        resolved_at=now - timedelta(hours=9)
    )
    db.add(alert1)
    db.add(alert2)

    # 8. Reports
    rep1 = Report(
        title="Batch CHK-2026-017 Quality & Traceability Report",
        report_type="BATCH_INSPECTION",
        batch_id=batch_objs["CHK-2026-017"].id,
        generated_by="quality@foodsafe.ai",
        file_path="/reports/CHK-2026-017_report.pdf",
        file_url="/api/reports/download/CHK-2026-017",
        created_at=now - timedelta(hours=1)
    )
    db.add(rep1)

    # 9. Audit Logs
    audit1 = AuditLog(
        timestamp=now - timedelta(hours=4),
        user_email="admin@foodsafe.ai",
        action="SYSTEM_INIT",
        details="FOODSAFE AI inline inspection platform initialized in Demo Mode.",
        ip_address="127.0.0.1"
    )
    audit2 = AuditLog(
        timestamp=now - timedelta(hours=2),
        user_email="quality@foodsafe.ai",
        action="VERIFICATION_COMPLETED",
        details="Verified sample INS-00009 as NORMAL. Feedback saved to dataset.",
        ip_address="192.168.1.45"
    )
    db.add(audit1)
    db.add(audit2)

    # 10. System Configs
    cfg1 = SystemConfig(key="NORMAL_CONFIDENCE_THRESHOLD", value="0.90", description="Threshold above which NORMAL is ACCEPTED.")
    cfg2 = SystemConfig(key="SUSPICIOUS_CONFIDENCE_THRESHOLD", value="0.70", description="Threshold for SUSPICIOUS classification.")
    cfg3 = SystemConfig(key="SIMULATOR_SPEED_MS", value="2000", description="Simulated conveyor step delay in milliseconds.")
    db.add(cfg1)
    db.add(cfg2)
    db.add(cfg3)

    db.commit()
    print("FOODSAFE AI Database successfully seeded with demo data!")
