# FOODSAFE AI REST & WebSocket API Specification

## Base URL
- REST Base: `http://localhost:8000/api`
- WebSocket Base: `ws://localhost:8000/ws`
- Swagger UI: `http://localhost:8000/docs`

---

## Endpoint Reference

### Authentication
- `POST /api/auth/login` - Authenticate user credentials and issue Bearer JWT token.

### Dashboard
- `GET /api/dashboard/summary` - Total inspected, accepted, verify, rejected, reject rate.
- `GET /api/dashboard/trends` - Weekly throughput trend lines.
- `GET /api/dashboard/batch-rejection-trends` - Rejection percentage by batch.

### Inspections
- `GET /api/inspections` - Query inspections with filters (`food_type`, `decision`, `search`).
- `GET /api/inspections/{id}` - Detailed inspection metadata, timeline steps, and NIR spectral curve.
- `POST /api/inspections` - Submit new inspection event manually or via edge gateway.

### Verification Center
- `GET /api/verification/pending` - Pending diverted samples awaiting operator audit.
- `GET /api/verification/summary` - Pending, verified today, normal vs suspicious breakdown.
- `POST /api/verification/{id}/verify` - Human operator verdict submission (`NORMAL` / `SUSPICIOUS`).

### Batches
- `GET /api/batches` - List all registered food batches.
- `GET /api/batches/{id}` - Detailed batch statistics, inspection logs, and QR passport URL.
- `POST /api/batches` - Register a new food batch.

### Digital Passport & QR
- `GET /api/verify/batch/{batch_code}` - Public read-only batch passport.
- `GET /api/verify/batch/{batch_code}/qr` - Dynamic PNG QR Code generator.

### Analytics
- `GET /api/analytics/overview` - 3-way distribution, food product comparison, confidence buckets.

### Model Monitoring
- `GET /api/models` - List model version history.
- `GET /api/models/active` - Active edge model metrics (Accuracy, Precision, Recall, F1).

### Feedback Dataset
- `GET /api/feedback` - Verified feedback dataset samples.
- `POST /api/feedback/export` - Download JSON retraining dataset file.

### Early Warning Alerts
- `GET /api/alerts` - System alerts list.
- `POST /api/alerts/{id}/resolve` - Mark alert as resolved.

### PDF Reports
- `POST /api/reports/generate` - Generate executive PDF report.
- `GET /api/reports/download/{id}` - Download ReportLab PDF file.

### Hardware API & Presentation Simulator
- `POST /api/device/inspection` - Endpoint for Raspberry Pi REST client.
- `POST /api/simulator/demo-step` - Trigger jury presentation step (`ACCEPTED`, `VERIFY`, `REJECTED`).
