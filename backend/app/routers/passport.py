from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
import qrcode
import io
from app.database.session import get_db
from app.models.domain import Batch
from app.schemas.domain import BatchPassportResponse

router = APIRouter(tags=["Digital Batch Passport"])

@router.get("/verify/batch/{batch_code}", response_model=BatchPassportResponse)
def get_public_batch_passport(batch_code: str, db: Session = Depends(get_db)):
    batch = db.query(Batch).filter(Batch.batch_code == batch_code).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch QR code invalid or batch not found")

    summary_msg = f"Batch {batch.batch_code} ({batch.food_type}) inspected via FOODSAFE AI inline spectral screening. {batch.accepted_count} items passed, {batch.verify_count} routed for human verification, {batch.rejected_count} rejected."

    return {
        "batch_code": batch.batch_code,
        "food_type": batch.food_type,
        "production_date": batch.production_date,
        "supplier": batch.supplier,
        "total_quantity": batch.total_quantity,
        "inspected_count": batch.inspected_count,
        "accepted_count": batch.accepted_count,
        "verify_count": batch.verify_count,
        "rejected_count": batch.rejected_count,
        "reject_rate": batch.reject_rate,
        "status": batch.status,
        "inspection_summary": summary_msg,
        "verified_passport": True
    }

@router.get("/verify/batch/{batch_code}/qr")
def generate_batch_qr_code(batch_code: str):
    # Generates a PNG image of the QR Code for the batch passport
    passport_url = f"http://localhost:5173/verify/batch/{batch_code}"
    img = qrcode.make(passport_url)
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return Response(content=buffer.getvalue(), media_type="image/png")
