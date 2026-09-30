from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field

# Auth & User
class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Dashboard
class DashboardSummaryResponse(BaseModel):
    total_inspected: int
    accepted_count: int
    verify_count: int
    rejected_count: int
    reject_rate: float
    system_status: str
    active_batch_code: Optional[str] = None

class DashboardTrendItem(BaseModel):
    timestamp: str
    accepted: int
    verify: int
    rejected: int
    total: int

class DecisionDistribution(BaseModel):
    accepted: int
    verify: int
    rejected: int

class BatchRejectionTrend(BaseModel):
    batch_code: str
    food_type: str
    reject_rate: float

# Food Product
class FoodProductResponse(BaseModel):
    id: str
    name: str
    category: str
    default_normal_threshold: float
    default_suspicious_threshold: float
    description: Optional[str] = None

    class Config:
        from_attributes = True

# Batch
class BatchCreate(BaseModel):
    batch_code: str
    food_type: str
    supplier: str = "AgriSafe Farms Ltd"
    total_quantity: int = 2000

class BatchResponse(BaseModel):
    id: str
    batch_code: str
    food_type: str
    production_date: datetime
    supplier: str
    total_quantity: int
    inspected_count: int
    accepted_count: int
    verify_count: int
    rejected_count: int
    reject_rate: float
    status: str
    qr_code_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class BatchPassportResponse(BaseModel):
    batch_code: str
    food_type: str
    production_date: datetime
    supplier: str
    total_quantity: int
    inspected_count: int
    accepted_count: int
    verify_count: int
    rejected_count: int
    reject_rate: float
    status: str
    inspection_summary: str
    verified_passport: bool = True

# Inspection
class InspectionCreate(BaseModel):
    batch_code: str
    food_type: str
    device_id: Optional[str] = "RPI-001"
    image_url: Optional[str] = None
    sensor_data: Optional[Dict[str, Any]] = None

class InspectionResponse(BaseModel):
    id: str
    inspection_code: str
    batch_id: str
    food_type: str
    timestamp: datetime
    prediction_raw: str
    confidence: float
    decision: str
    action_taken: str
    model_version_id: Optional[str] = None
    device_id: Optional[str] = None
    verification_status: str
    image_url: Optional[str] = None

    class Config:
        from_attributes = True

class InspectionDetailTimelineStep(BaseModel):
    time_offset: str
    step: str
    detail: str
    status: str # success, warning, info

class InspectionDetailResponse(InspectionResponse):
    camera_id: str
    sensor_id: str
    nir_spectrum_data: Optional[Dict[str, Any]] = None
    timeline: List[InspectionDetailTimelineStep] = []
    verification_record: Optional[Dict[str, Any]] = None

# Verification
class VerificationCreate(BaseModel):
    human_verification: str # NORMAL or SUSPICIOUS
    notes: Optional[str] = ""

class VerificationResponse(BaseModel):
    id: str
    inspection_id: str
    ai_prediction: str
    ai_confidence: float
    human_verification: str
    verifier_name: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Feedback Dataset
class FeedbackSampleResponse(BaseModel):
    id: str
    sample_code: str
    verification_id: str
    inspection_id: str
    original_prediction: str
    confidence: float
    verified_result: str
    verifier_name: str
    status: str
    dataset_version: str
    created_at: datetime

    class Config:
        from_attributes = True

# Devices & Hardware
class DeviceStatusResponse(BaseModel):
    id: str
    device_code: str
    name: str
    type: str
    ip_address: str
    firmware_version: str
    status: str
    last_heartbeat: datetime

    class Config:
        from_attributes = True

# Model Version
class ModelVersionResponse(BaseModel):
    id: str
    version_code: str
    model_name: str
    type: str
    deployment_target: str
    status: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    training_samples_count: int
    validation_samples_count: int
    is_demo: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Alert
class AlertResponse(BaseModel):
    id: str
    alert_code: str
    severity: str
    title: str
    message: str
    batch_id: Optional[str] = None
    is_resolved: bool
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Reports
class ReportGenerateRequest(BaseModel):
    report_type: str = "BATCH_INSPECTION" # BATCH_INSPECTION, DAILY_SUMMARY, QUALITY_AUDIT
    batch_id: Optional[str] = None
    title: Optional[str] = "FOODSAFE AI Inspection & Traceability Report"

class ReportResponse(BaseModel):
    id: str
    title: str
    report_type: str
    batch_id: Optional[str] = None
    generated_by: str
    file_url: str
    created_at: datetime

    class Config:
        from_attributes = True

# Settings
class SystemSettingsUpdate(BaseModel):
    normal_confidence_threshold: float = Field(ge=0.5, le=1.0)
    suspicious_confidence_threshold: float = Field(ge=0.1, le=0.95)
    simulator_speed_ms: int = Field(ge=500, le=10000)

class SystemSettingsResponse(BaseModel):
    normal_confidence_threshold: float
    suspicious_confidence_threshold: float
    simulator_speed_ms: int
    disclaimer: str
