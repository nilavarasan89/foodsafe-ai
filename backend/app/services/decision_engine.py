from typing import Dict, Any
from app.config import settings

class DecisionEngine:
    def __init__(self, normal_threshold: float = None, suspicious_threshold: float = None):
        self.normal_threshold = normal_threshold if normal_threshold is not None else settings.NORMAL_CONFIDENCE_THRESHOLD
        self.suspicious_threshold = suspicious_threshold if suspicious_threshold is not None else settings.SUSPICIOUS_CONFIDENCE_THRESHOLD

    def evaluate(self, prediction_raw: str, confidence: float) -> Dict[str, Any]:
        """
        Confidence-Aware Three-Way Decision Logic:
        1. ACCEPTED: High confidence normal spectral signature (>= normal_threshold)
        2. VERIFY: Uncertain prediction OR confidence falls in human-verification band (between suspicious_threshold and normal_threshold)
        3. REJECTED: High confidence anomaly or flagged suspicious sample
        """
        outcome = "ACCEPTED"
        reason = "Normal spectral pattern with high confidence."

        if prediction_raw == "SUSPICIOUS":
            if confidence >= self.suspicious_threshold:
                outcome = "REJECTED"
                reason = f"Spectral anomaly detected with high confidence ({confidence*100:.1f}%)."
            else:
                outcome = "VERIFY"
                reason = f"Suspicious flag with lower confidence ({confidence*100:.1f}%), routed to verification bin."
        elif prediction_raw == "UNCERTAIN":
            outcome = "VERIFY"
            reason = f"Model classified prediction as UNCERTAIN ({confidence*100:.1f}%), human operator verification required."
        elif prediction_raw == "NORMAL":
            if confidence >= self.normal_threshold:
                outcome = "ACCEPTED"
                reason = f"Normal sample verified above threshold ({confidence*100:.1f}% >= {self.normal_threshold*100:.1f}%)."
            else:
                outcome = "VERIFY"
                reason = f"Normal prediction but confidence ({confidence*100:.1f}%) is below strict threshold ({self.normal_threshold*100:.1f}%)."

        return {
            "decision": outcome,
            "reason": reason,
            "normal_threshold": self.normal_threshold,
            "suspicious_threshold": self.suspicious_threshold,
            "is_configurable_claim": True
        }

decision_engine = DecisionEngine()
