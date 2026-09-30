# FOODSAFE AI

**Tagline:** *AI-Powered Inline Food Inspection & Intelligent Traceability*  
**Problem Statement:** Smart India Hackathon **SIH26233**

---

## 🌟 Key Innovation

FOODSAFE AI is an industrial inline food inspection and digital traceability platform. It connects physical conveyor inspection hardware (NIR/hyperspectral imaging cameras, IR photoelectric object sensors, halogen illumination, Raspberry Pi edge gateways, and pneumatic rejection servos) to a modern full-stack web software platform.

### Core Workflow Innovation
`Confidence-Aware Three-Way Sorting + Digital Food Traceability + Human Verification + Controlled ML Feedback`

1. **ACCEPTED (Green):** Normal spectral reflectance pattern verified with high confidence ($\ge 90\%$). Continues on main conveyor.
2. **VERIFY (Yellow):** Borderline spectral signature or model uncertainty ($70\% - 90\%$). Diverted to Verification Bin for human operator audit.
3. **REJECTED (Red):** High-risk spectral anomaly pattern ($< 70\%$ or flagged). Pneumatic high-speed rejection servo activated.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Recharts, Lucide Icons, Axios, WebSockets.
- **Backend:** Python 3.12, FastAPI, Pydantic v2, SQLAlchemy, ReportLab (PDF Generation), PyJWT, Passlib/Bcrypt.
- **Database:** SQLite (default zero-config local run `foodsafe.db`) / PostgreSQL support via `DATABASE_URL`.
- **Real-Time:** WebSockets (`ws://localhost:8000/ws`) for live event broadcasting.
- **Hardware Integration:** Raspberry Pi REST API (`POST /api/device/inspection`) & Live Presentation Demo Scenario Simulator.

---

## 📁 Repository Structure

```
d:\project\sih26233\
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── decision_engine.py
│   │   │   ├── action_engine.py
│   │   │   ├── inspection_service.py
│   │   │   └── report_service.py
│   │   ├── ml/
│   │   │   ├── base.py
│   │   │   ├── mock_service.py
│   │   │   └── service.py
│   │   ├── websocket/
│   │   ├── routers/
│   │   └── utils/
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── types/
│   │   └── App.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── README.md
├── ARCHITECTURE.md
├── DATABASE.md
├── API.md
└── DEMO_GUIDE.md
```

---

## 🚀 Quick Start Instructions

### 1. Start the Backend Server
```bash
cd backend
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
- API Documentation available at: `http://localhost:8000/docs`

### 2. Start the Frontend Application
```bash
cd frontend
$env:npm_config_cache="d:\project\sih26233\.npm-cache" # optional if cache directory is custom
npm install --legacy-peer-deps
npm run dev
```
- Open browser at `http://localhost:5173`

---

## 🔑 Demo Credentials

- **Admin Supervisor:** `admin@foodsafe.ai` / `admin123`
- **Line Operator:** `operator@foodsafe.ai` / `operator123`
- **Quality Manager:** `quality@foodsafe.ai` / `quality123`
