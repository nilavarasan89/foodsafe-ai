import random
import math
from typing import Dict, Any
from app.ml.base import BaseMLService

class MockMLService(BaseMLService):
    def __init__(self, model_version: str = "FoodSafe-AI-v1.2"):
        self.model_version = model_version

    def generate_nir_spectrum(self, is_suspicious: bool = False, is_uncertain: bool = False) -> Dict[str, Any]:
        """
        Generates simulated NIR spectral reflectance curves across 750nm - 1700nm wavelengths.
        Specific spectral dips at 970nm (water), 1200nm (fat/protein), 1450nm (moisture/organic anomalies).
        """
        wavelengths = [750, 850, 970, 1100, 1200, 1300, 1450, 1600, 1700]
        spectrum = []

        for wave in wavelengths:
            base_reflectance = 0.65 + 0.2 * math.sin(wave / 200.0)
            if wave == 970: # Water absorption band
                base_reflectance -= 0.15
            elif wave == 1200: # Fat/protein band
                base_reflectance -= 0.10
            elif wave == 1450: # Moisture / contamination indicator band
                if is_suspicious:
                    base_reflectance -= 0.28 # Significant anomaly dip
                elif is_uncertain:
                    base_reflectance -= 0.16 # Moderate dip
                else:
                    base_reflectance -= 0.05 # Normal baseline
            
            # Add subtle sensor noise
            noise = random.uniform(-0.02, 0.02)
            value = max(0.05, min(0.98, base_reflectance + noise))
            spectrum.append({"wavelength_nm": wave, "reflectance": round(value, 4)})

        return {
            "wavelengths": wavelengths,
            "data_points": spectrum,
            "absorption_peak_nm": 1450 if (is_suspicious or is_uncertain) else 970
        }

    def predict(self, food_type: str, image_url: str = None, sensor_data: Dict[str, Any] = None, forced_outcome: str = None) -> Dict[str, Any]:
        """
        Calculates prediction:
        outcome options: "NORMAL", "UNCERTAIN", "SUSPICIOUS"
        """
        if forced_outcome:
            outcome = forced_outcome
        else:
            rand = random.random()
            if rand < 0.78:
                outcome = "NORMAL"
            elif rand < 0.90:
                outcome = "UNCERTAIN"
            else:
                outcome = "SUSPICIOUS"

        if outcome == "NORMAL":
            confidence = round(random.uniform(0.910, 0.995), 3)
            is_suspicious = False
            is_uncertain = False
        elif outcome == "UNCERTAIN":
            confidence = round(random.uniform(0.720, 0.885), 3)
            is_suspicious = False
            is_uncertain = True
        else: # SUSPICIOUS
            confidence = round(random.uniform(0.910, 0.988), 3)
            is_suspicious = True
            is_uncertain = False

        nir_spectrum = self.generate_nir_spectrum(is_suspicious, is_uncertain)

        return {
            "prediction": outcome,
            "confidence": confidence,
            "model_version": self.model_version,
            "food_type": food_type,
            "nir_spectrum": nir_spectrum,
            "scientific_note": "Spectral anomaly screening output. High risk flags require physical laboratory verification."
        }
