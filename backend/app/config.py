import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "FOODSAFE AI"
    TAGLINE: str = "AI-Powered Inline Food Inspection & Intelligent Traceability"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "foodsafe-ai-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours

    DATABASE_URL: str = "sqlite:///./foodsafe.db"

    ML_MODE: str = "mock"
    REAL_ML_ENDPOINT: str = "http://localhost:9000/predict"

    # Default configurable decision thresholds
    NORMAL_CONFIDENCE_THRESHOLD: float = 0.90
    SUSPICIOUS_CONFIDENCE_THRESHOLD: float = 0.70

    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
