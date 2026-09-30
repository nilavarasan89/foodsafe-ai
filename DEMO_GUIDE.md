# FOODSAFE AI Smart India Hackathon (SIH26233) Jury Presentation Demo Guide

This step-by-step guide explains how to present the FOODSAFE AI prototype to the hackathon jury.

---

## 🎯 Jury Demonstration Sequence (5-Minute Walkthrough)

### Step 1: Login & Dashboard Telemetry Overview (0:00 - 1:00)
1. Open `http://localhost:5173`.
2. On the industrial login screen, select **Admin Supervisor** demo account (`admin@foodsafe.ai` / `admin123`).
3. Point out:
   - Real-time KPI summary cards (**Total Inspected**, **Accepted**, **Verification Required**, **Rejected**, **Reject Rate**).
   - Decision Distribution Donut Chart (Three-Way sorting breakdown).
   - Early Warning System Alert banner.

### Step 2: Live Inspection & Presentation Scenario Flow (1:00 - 2:30)
1. Navigate to **Live Inspection** via the sidebar.
2. Highlight the hardware status bar (**Raspberry Pi**, **NIR Camera**, **IR Object Sensor**, **Conveyor**, **Servo**).
3. Showcase the **AI THREE-WAY DECISION ENGINE** visual diagram at the bottom of the page.
4. Click the presentation flow buttons at the top right:
   - **Click `Product #1 (Pass)`:** Watch the camera feed flash green, ML model output `NORMAL` (96.5% confidence), Decision: `ACCEPTED`, Action: `CONTINUE`.
   - **Click `Product #2 (Verify)`:** Watch the system output `UNCERTAIN` (78.2% confidence), Decision: `VERIFY`, Action: `VERIFY_DIVERTER`.
   - **Click `Product #3 (Reject)`:** Watch the system output `SUSPICIOUS` (94.7% confidence), Decision: `REJECTED`, Action: `SERVO_REJECT`.

### Step 3: Human Verification Center (Key Novelty) (2:30 - 3:30)
1. Navigate to **Verification Center**.
2. Point out Product #2 in the **Pending Verification** queue.
3. Click **Audit & Verify**.
4. Show the operator audit modal. Select **MARK NORMAL**, type note: *"Manual operator inspection confirmed no visible defect"*, and click **Submit Verification**.
5. Explain: *"This record is instantly transferred to the Feedback Dataset for controlled ML model improvement without unvalidated automatic retraining."*

### Step 4: Digital Food Passport & QR Traceability (3:30 - 4:30)
1. Navigate to **Batches** $\rightarrow$ Click **CHK-2026-017**.
2. Click **Generate Batch QR**.
3. Click **Open Public Digital Passport Link** (opens `/verify/batch/CHK-2026-017`).
4. Explain: *"Consumers and retailers can scan the physical QR code on the packaging to view the verified digital inspection passport."*

### Step 5: PDF Audit Report Download (4:30 - 5:00)
1. Navigate to **Reports**.
2. Select Batch **CHK-2026-017** and click **Generate PDF Report**.
3. Click **Download PDF** to open the generated ReportLab document.
