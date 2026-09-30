# FOODSAFE AI Database Schema Documentation

## Database Technology
- ORM: SQLAlchemy 2.0
- Relational Database: MySQL 8.x / MariaDB (`foodsafe_db` database via PyMySQL driver)
- Active Connection: `mysql+pymysql://root:***@localhost:3306/foodsafe_db`

## Relational Schema Diagram & Tables

### 1. `users`
- `id` (PK, UUID)
- `email` (String, Unique)
- `hashed_password` (String)
- `full_name` (String)
- `role` (ADMIN, OPERATOR, QUALITY_MANAGER)

### 2. `food_products`
- `id` (PK, UUID)
- `name` (Chicken, Leafy Greens, Tomato, Fish)
- `category` (Poultry, Produce, Seafood)
- `default_normal_threshold` (Float)
- `default_suspicious_threshold` (Float)

### 3. `batches`
- `id` (PK, UUID)
- `batch_code` (String, Unique, Index)
- `food_type` (String)
- `production_date` (DateTime)
- `supplier` (String)
- `total_quantity` (Integer)
- `inspected_count` (Integer)
- `accepted_count` (Integer)
- `verify_count` (Integer)
- `rejected_count` (Integer)
- `reject_rate` (Float)
- `status` (MONITORING, COMPLETED, QUARANTINED)

### 4. `inspections`
- `id` (PK, UUID)
- `inspection_code` (String, Unique, Index)
- `batch_id` (FK -> `batches.id`)
- `food_type` (String)
- `timestamp` (DateTime)
- `prediction_raw` (NORMAL, UNCERTAIN, SUSPICIOUS)
- `confidence` (Float)
- `decision` (ACCEPTED, VERIFY, REJECTED)
- `action_taken` (CONTINUE, VERIFY_DIVERTER, SERVO_REJECT)
- `model_version_id` (FK -> `model_versions.id`)
- `device_id` (FK -> `devices.id`)
- `image_url` (String)
- `nir_spectrum_data` (JSON)
- `verification_status` (NOT_REQUIRED, PENDING, VERIFIED)

### 5. `verification_records`
- `id` (PK, UUID)
- `inspection_id` (FK -> `inspections.id`)
- `ai_prediction` (String)
- `ai_confidence` (Float)
- `human_verification` (NORMAL, SUSPICIOUS)
- `verifier_name` (String)
- `notes` (Text)

### 6. `feedback_samples`
- `id` (PK, UUID)
- `sample_code` (String, Unique)
- `verification_id` (FK -> `verification_records.id`)
- `original_prediction` (String)
- `confidence` (Float)
- `verified_result` (String)
- `status` (READY_FOR_TRAINING)

### 7. `devices`
- `id` (PK, UUID)
- `device_code` (RPI-001, NIR-CAM-01, IR-SENS-01)
- `name` (String)
- `type` (EDGE_COMPUTER, NIR_CAMERA, IR_SENSOR, SERVO)
- `ip_address` (String)
- `status` (ONLINE, OFFLINE, WARNING)

### 8. `model_versions`
- `id` (PK, UUID)
- `version_code` (FoodSafe-AI-v1.2)
- `accuracy` (Float)
- `precision` (Float)
- `recall` (Float)
- `f1_score` (Float)

### 9. `alerts`
- `id` (PK, UUID)
- `alert_code` (String)
- `severity` (INFO, WARNING, CRITICAL)
- `title` (String)
- `message` (Text)
- `is_resolved` (Boolean)
