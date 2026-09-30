from app.config import settings
from app.ml.mock_service import MockMLService

def get_ml_service():
    # Modular architecture allowing seamless swap to RealMLService in production
    if settings.ML_MODE == "mock":
        return MockMLService()
    else:
        # Fallback to Mock if real service is not reachable
        return MockMLService()

ml_service = get_ml_service()
