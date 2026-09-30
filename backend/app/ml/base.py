from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseMLService(ABC):
    @abstractmethod
    def predict(self, food_type: str, image_url: str = None, sensor_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Analyzes NIR spectral image / sensor data and produces a screening classification.
        Terminology follows scientific guidelines:
        - "NORMAL": No spectral anomaly detected
        - "UNCERTAIN": Borderline spectral profile requiring human verification
        - "SUSPICIOUS": Spectral anomaly pattern detected (potential contamination)
        """
        pass
