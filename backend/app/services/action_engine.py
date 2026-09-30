from typing import Dict, Any

class ActionEngine:
    def execute_action(self, decision: str) -> Dict[str, Any]:
        """
        Executes physical or simulated hardware control based on Decision Engine output.
        - ACCEPTED -> Continue on main conveyor path
        - VERIFY -> Activate divert valve to Verification Bin
        - REJECTED -> Activate high-speed Servo Rejection Mechanism
        """
        if decision == "ACCEPTED":
            return {
                "action_taken": "CONTINUE",
                "hardware_signal": "SERVO_IDLE",
                "conveyor_status": "RUNNING",
                "destination": "ACCEPTED_PRODUCT_BIN",
                "response_time_ms": 15
            }
        elif decision == "VERIFY":
            return {
                "action_taken": "VERIFY_DIVERTER",
                "hardware_signal": "DIVERTER_ARM_EXTEND",
                "conveyor_status": "RUNNING",
                "destination": "VERIFICATION_BIN",
                "response_time_ms": 85
            }
        elif decision == "REJECTED":
            return {
                "action_taken": "SERVO_REJECT",
                "hardware_signal": "HIGH_SPEED_SERVO_PULSE",
                "conveyor_status": "RUNNING",
                "destination": "REJECTION_BIN",
                "response_time_ms": 120
            }
        else:
            return {
                "action_taken": "CONTINUE",
                "hardware_signal": "SERVO_IDLE",
                "conveyor_status": "RUNNING",
                "destination": "UNKNOWN",
                "response_time_ms": 10
            }

action_engine = ActionEngine()
