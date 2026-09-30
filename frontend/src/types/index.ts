export type DecisionType = 'ACCEPTED' | 'VERIFY' | 'REJECTED';
export type PredictionType = 'NORMAL' | 'UNCERTAIN' | 'SUSPICIOUS';
export type ActionType = 'CONTINUE' | 'VERIFY_DIVERTER' | 'SERVO_REJECT';
export type DeviceStatusType = 'ONLINE' | 'OFFLINE' | 'WARNING';
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type UserRole = 'ADMIN' | 'OPERATOR' | 'QUALITY_MANAGER';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
}

export interface DashboardSummary {
  total_inspected: number;
  accepted_count: number;
  verify_count: number;
  rejected_count: number;
  reject_rate: number;
  system_status: string;
  active_batch_code?: string;
}

export interface DashboardTrend {
  timestamp: string;
  accepted: number;
  verify: number;
  rejected: number;
  total: number;
}

export interface Inspection {
  id: string;
  inspection_code: string;
  batch_id: string;
  food_type: string;
  timestamp: string;
  prediction_raw: PredictionType;
  confidence: number;
  decision: DecisionType;
  action_taken: ActionType;
  model_version_id?: string;
  device_id?: string;
  verification_status: 'NOT_REQUIRED' | 'PENDING' | 'VERIFIED';
  image_url?: string;
}

export interface TimelineStep {
  time_offset: string;
  step: string;
  detail: string;
  status: 'success' | 'warning' | 'danger' | 'info';
}

export interface NirDataPoint {
  wavelength_nm: number;
  reflectance: number;
}

export interface NirSpectrumData {
  wavelengths: number[];
  data_points: NirDataPoint[];
  absorption_peak_nm: number;
}

export interface InspectionDetail extends Inspection {
  camera_id: string;
  sensor_id: string;
  nir_spectrum_data?: NirSpectrumData;
  timeline: TimelineStep[];
  verification_record?: {
    human_verification: 'NORMAL' | 'SUSPICIOUS';
    verifier_name: string;
    notes?: string;
    created_at: string;
  };
}

export interface PendingVerification {
  id: string;
  inspection_code: string;
  food_type: string;
  batch_code: string;
  prediction_raw: PredictionType;
  confidence: number;
  image_url?: string;
  timestamp: string;
  verification_status: string;
}

export interface Batch {
  id: string;
  batch_code: string;
  food_type: string;
  production_date: string;
  supplier: string;
  total_quantity: number;
  inspected_count: number;
  accepted_count: number;
  verify_count: number;
  rejected_count: number;
  reject_rate: number;
  status: string;
  qr_code_url?: string;
  created_at: string;
}

export interface BatchPassport {
  batch_code: string;
  food_type: string;
  production_date: string;
  supplier: string;
  total_quantity: number;
  inspected_count: number;
  accepted_count: number;
  verify_count: number;
  rejected_count: number;
  reject_rate: number;
  status: string;
  inspection_summary: string;
  verified_passport: boolean;
}

export interface FeedbackSample {
  id: string;
  sample_code: string;
  verification_id: string;
  inspection_id: string;
  original_prediction: string;
  confidence: number;
  verified_result: 'NORMAL' | 'SUSPICIOUS';
  verifier_name: string;
  status: string;
  dataset_version: string;
  created_at: string;
}

export interface DeviceStatus {
  id: string;
  device_code: string;
  name: string;
  type: string;
  ip_address: string;
  firmware_version: string;
  status: DeviceStatusType;
  last_heartbeat: string;
}

export interface ModelVersion {
  id: string;
  version_code: string;
  model_name: string;
  type: string;
  deployment_target: string;
  status: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  training_samples_count: number;
  validation_samples_count: number;
  is_demo: boolean;
  created_at: string;
}

export interface Alert {
  id: string;
  alert_code: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  batch_id?: string;
  is_resolved: boolean;
  created_at: string;
  resolved_at?: string;
}

export interface SystemSettings {
  normal_confidence_threshold: number;
  suspicious_confidence_threshold: number;
  simulator_speed_ms: number;
  disclaimer: string;
}

export interface Report {
  id: string;
  title: string;
  report_type: string;
  batch_id?: string;
  generated_by: string;
  file_url: string;
  created_at: string;
}
