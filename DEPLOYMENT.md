# FOODSAFE AI Cloud Deployment Guide

This guide provides step-by-step instructions for deploying **FOODSAFE AI** to **Render**, **Railway**, or **Vercel**.

---

## Option 1: Render Deployment (Recommended - Easiest & Free Tier Available)

Render allows you to deploy both the Python FastAPI backend and the React Vite frontend seamlessly from a single GitHub repository using `render.yaml`.

### Step-by-Step Render Deployment:
1. Push your code repository to **GitHub**.
2. Log in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** $\rightarrow$ Select **Blueprint**.
4. Connect your GitHub repository.
5. Render will automatically detect `render.yaml` and configure:
   - **Backend Web Service:** `foodsafe-ai-backend` (Python Uvicorn)
   - **Frontend Static Site:** `foodsafe-ai-frontend` (Vite SPA)
6. Click **Apply**.
7. Once deployed:
   - Your backend will be live at `https://foodsafe-ai-backend.onrender.com`
   - Your frontend will be live at `https://foodsafe-ai-frontend.onrender.com`

---

## Option 2: Vercel (Frontend) + Render/Railway (Backend)

Vercel is optimal for hosting high-performance frontend static sites.

### A. Deploy Frontend on Vercel:
1. Push your repository to **GitHub**.
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import your GitHub repository.
4. Set **Root Directory** to `frontend`.
5. Select **Framework Preset**: `Vite`.
6. Add Environment Variable:
   - `VITE_API_URL` = `https://your-backend-service-url.onrender.com` (or Railway URL)
7. Click **Deploy**.

### B. Deploy Backend on Render or Railway:
- **Render:** Create a **Web Service** $\rightarrow$ Root Directory: `backend` $\rightarrow$ Build Command: `pip install -r requirements.txt` $\rightarrow$ Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.

---

## Option 3: Railway Deployment (Single-Click Deployment)

Railway hosts full-stack apps and databases effortlessly.

### Step-by-Step Railway Deployment:
1. Log in to [Railway.app](https://railway.app/).
2. Click **New Project** $\rightarrow$ Select **Deploy from GitHub repo**.
3. Select your repository.
4. **Deploy Backend Service:**
   - Root Directory: `/backend`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Variable: `PORT=8000`
5. **Deploy Frontend Service:**
   - Click **+ New Service** in Railway $\rightarrow$ Select same GitHub Repo.
   - Root Directory: `/frontend`
   - Build Command: `npm install --legacy-peer-deps && npm run build`
   - Start Command: `npx serve -s dist -l $PORT`
   - Variable: `VITE_API_URL` = `${{Backend.RAILWAY_PUBLIC_DOMAIN}}`

---

## 🔒 Production Environment Variables Checklist

Ensure these variables are set in your cloud platform dashboard:

| Variable | Description | Example |
|---|---|---|
| `SECRET_KEY` | JWT Signing Secret | `your-production-super-secret-key` |
| `DATABASE_URL` | DB Connection String | `sqlite:///./foodsafe.db` or PostgreSQL URI |
| `CORS_ORIGINS` | Allowed Frontend URLs | `https://your-frontend.vercel.app` |
| `VITE_API_URL` | Backend URL for Frontend | `https://your-backend.onrender.com` |
