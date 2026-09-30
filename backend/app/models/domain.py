import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Boolean, Text, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="OPERATOR") # ADMIN, OPERATOR, QUALITY_MANAGER
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    verifications = relationship("VerificationRecord", back_populates="verifier")

class Role(Base):
    __tablename__ = "roles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(50), unique=True, nullable=False) # ADMIN, OPERATOR, QUALITY_MANAGER
    description = Column(String(255), nullable=True)
    permissions = Column(JSON, default=list)

class FoodProduct(Base):
    __tablename__ = "food_products"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False) # e.g. Chicken, Leafy Greens, Tomato, Fish
    category = Column(String(100), nullable=False) # Poultry, Produce, Seafood
    default_normal_threshold = Column(Float, default=0.90)
    default_suspicious_threshold = Column(Float, default=0.70)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Batch(Base):
    __tablename__ = "batches"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    batch_code = Column(String(100), unique=True, index=True, nullable=False) # e.g. CHK-2026-017
    food_type = Column(String(100), nullable=False) # e.g. Chicken
    food_product_id = Column(String(36), ForeignKey("food_products.id"), nullable=True)
    production_date = Column(DateTime, default=datetime.utcnow)
    supplier = Column(String(255), nullable=False, default="AgriSafe Farms Ltd")
    total_quantity = Column(Integer, default=2000)
    inspected_count = Column(Integer, default=0)
    accepted_count = Column(Integer, default=0)
    verify_count = Column(Integer, default=0)
    rejected_count = Column(Integer, default=0)
    reject_rate = Column(Float, default=0.0) # percentage
    status = Column(String(50), default="MONITORING") # MONITORING, COMPLETED, QUARANTINED, ARCHIVED
    qr_code_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    inspections = relationship("Inspection", back_populates="batch", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="batch")

class Device(Base):
    __tablename__ = "devices"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    device_code = Column(String(100), unique=True, nullable=False) # RPI-001, NIR-CAM-01, IR-SENS-01
    name = Column(String(255), nullable=False)
    type = Column(String(100), nullable=False) # EDGE_COMPUTER, NIR_CAMERA, IR_SENSOR, ILLUMINATION, SERVO, CONVEYOR
    ip_address = Column(String(50), default="192.168.1.105")
    firmware_version = Column(String(50), default="v2.4.1")
    status = Column(String(50), default="ONLINE") # ONLINE, OFFLINE, WARNING
    last_heartbeat = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    events = relationship("DeviceEvent", back_populates="device")

class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    version_code = Column(String(100), unique=True, nullable=False) # FoodSafe-AI-v1.2
    model_name = Column(String(255), default="SpectralNet-FoodScreen")
    type = Column(String(255), default="NIR Hyperspectral Classification")
    deployment_target = Column(String(255), default="Raspberry Pi Edge")
    status = Column(String(50), default="ACTIVE") # ACTIVE, ARCHIVED, DEPRECATED
    accuracy = Column(Float, default=98.4)
    precision = Column(Float, default=97.8)
    recall = Column(Float, default=98.1)
    f1_score = Column(Float, default=97.9)
    training_samples_count = Column(Integer, default=45000)
    validation_samples_count = Column(Integer, default=5000)
    is_demo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    inspection_code = Column(String(100), unique=True, index=True, nullable=False) # INS-00421
    batch_id = Column(String(36), ForeignKey("batches.id"), nullable=False)
    food_type = Column(String(100), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    # ML Output
    prediction_raw = Column(String(50), nullable=False) # NORMAL, UNCERTAIN, SUSPICIOUS
    confidence = Column(Float, nullable=False) # 0.0 to 1.0 (e.g. 0.947)

    # Decision Engine Output
    decision = Column(String(50), nullable=False) # ACCEPTED, VERIFY, REJECTED
    action_taken = Column(String(100), nullable=False) # CONTINUE, VERIFY_DIVERTER, SERVO_REJECT

    # Metadata & Hardware
    model_version_id = Column(String(36), ForeignKey("model_versions.id"), nullable=True)
    device_id = Column(String(36), ForeignKey("devices.id"), nullable=True)
    camera_id = Column(String(100), default="NIR-CAM-01")
    sensor_id = Column(String(100), default="IR-SENS-01")

    image_url = Column(String(500), nullable=True)
    nir_spectrum_data = Column(JSON, nullable=True) # simulated wavelengths 750nm-1700nm

    verification_status = Column(String(50), default="NOT_REQUIRED") # NOT_REQUIRED, PENDING, VERIFIED
    created_at = Column(DateTime, default=datetime.utcnow)

    batch = relationship("Batch", back_populates="inspections")
    verification_record = relationship("VerificationRecord", back_populates="inspection", uselist=False)
    rejection_event = relationship("RejectionEvent", back_populates="inspection", uselist=False)

class VerificationRecord(Base):
    __tablename__ = "verification_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    inspection_id = Column(String(36), ForeignKey("inspections.id"), nullable=False)
    ai_prediction = Column(String(50), nullable=False)
    ai_confidence = Column(Float, nullable=False)

    human_verification = Column(String(50), nullable=False) # NORMAL, SUSPICIOUS
    verifier_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    verifier_name = Column(String(255), default="Quality Operator")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    inspection = relationship("Inspection", back_populates="verification_record")
    verifier = relationship("User", back_populates="verifications")
    feedback_sample = relationship("FeedbackSample", back_populates="verification_record", uselist=False)

class FeedbackSample(Base):
    __tablename__ = "feedback_samples"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    sample_code = Column(String(100), unique=True, nullable=False) # FB-001
    verification_id = Column(String(36), ForeignKey("verification_records.id"), nullable=False)
    inspection_id = Column(String(36), ForeignKey("inspections.id"), nullable=False)

    original_prediction = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=False)
    verified_result = Column(String(50), nullable=False) # NORMAL or SUSPICIOUS
    verifier_name = Column(String(255), nullable=False)

    status = Column(String(50), default="READY_FOR_TRAINING") # PENDING, VERIFIED, READY_FOR_TRAINING, USED_IN_MODEL
    dataset_version = Column(String(100), default="v1.2-feedback-subset")
    created_at = Column(DateTime, default=datetime.utcnow)

    verification_record = relationship("VerificationRecord", back_populates="feedback_sample")

class RejectionEvent(Base):
    __tablename__ = "rejection_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    inspection_id = Column(String(36), ForeignKey("inspections.id"), nullable=False)
    batch_id = Column(String(36), ForeignKey("batches.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    servo_response_ms = Column(Integer, default=120) # hardware response time
    status = Column(String(50), default="COMPLETED") # COMPLETED, FAILED

    inspection = relationship("Inspection", back_populates="rejection_event")

class DeviceEvent(Base):
    __tablename__ = "device_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    device_id = Column(String(36), ForeignKey("devices.id"), nullable=False)
    event_type = Column(String(100), nullable=False) # HEARTBEAT, CALIBRATION, OVERHEAT, TRIGGER
    status = Column(String(50), default="INFO") # INFO, WARNING, ERROR
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    device = relationship("Device", back_populates="events")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    alert_code = Column(String(100), unique=True, nullable=False)
    severity = Column(String(50), nullable=False) # INFO, WARNING, CRITICAL
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    batch_id = Column(String(36), ForeignKey("batches.id"), nullable=True)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    batch = relationship("Batch", back_populates="alerts")

class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    report_type = Column(String(100), default="BATCH_INSPECTION") # BATCH_INSPECTION, DAILY_SUMMARY, QUALITY_AUDIT
    batch_id = Column(String(36), ForeignKey("batches.id"), nullable=True)
    generated_by = Column(String(255), default="admin@foodsafe.ai")
    file_path = Column(String(255), nullable=True)
    file_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_email = Column(String(255), nullable=False)
    action = Column(String(100), nullable=False) # LOGIN, VERIFICATION_ADDED, THRESHOLD_UPDATED, REPORT_GENERATED
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), default="127.0.0.1")

class SystemConfig(Base):
    __tablename__ = "system_configs"

    key = Column(String(100), primary_key=True)
    value = Column(String(255), nullable=False)
    description = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
