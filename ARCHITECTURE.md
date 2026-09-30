# FOODSAFE AI Architecture Document

## System Architecture Overview

```
 [ Physical Inline Conveyor Hardware ]
   - IR Photoelectric Sensor
   - Specim FX10 NIR Hyperspectral Camera
   - Halogen-NIR Illumination Matrix
   - High-Speed Servo Rejection Mechanism
                  │
                  ▼
 [ Edge Computer: Raspberry Pi 4 ]
   - Local Edge Gateway Client
   - REST Ingestion (`POST /api/device/inspection`)
                  │
                  ▼
 [ FOODSAFE AI FastAPI Backend ]
   ├── Authentication & Role Security (JWT)
   ├── ML Abstraction Layer (`MockMLService` / `RealMLService`)
   ├── Confidence-Aware Decision Engine (ACCEPTED, VERIFY, REJECTED)
   ├── Physical Hardware Control Action Engine
   ├── ReportLab PDF Generator Engine
   └── WebSocket Event Broadcaster (`/ws`)
                  │
                  ▼
 [ Database Layer ]
   - PostgreSQL / SQLite (`foodsafe.db`)
   - SQLAlchemy ORM Models
                  │
                  ▼
 [ React 18 + Vite Industrial Web Frontend ]
   - 15 Specialized Pages
   - Real-Time Conveyor Stream & Telemetry HUD
   - Recharts Visualizations
   - Digital Batch Passport QR Generator
```

## Key Architectural Principles

1. **Decoupled Machine Learning & Business Logic:**
   The ML model produces screening classification (`NORMAL`, `UNCERTAIN`, `SUSPICIOUS`) and confidence score ($0.0 - 1.0$). The **Decision Engine** evaluates configurable business thresholds (`normal_confidence_threshold`, `suspicious_confidence_threshold`) to assign 3-way sorting outcomes.

2. **Human-in-the-Loop Feedback Loop:**
   Uncertain items (`VERIFY`) are routed to the **Verification Center**. Operator verdicts populate the **Feedback Dataset**, preparing data for controlled ML model updates without unvalidated automatic retraining.

3. **Digital Food Traceability Passport:**
   Every batch generates a public QR code pointing to `/verify/batch/{batchCode}` for consumer/retailer verification.
