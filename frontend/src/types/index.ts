// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  createdAt: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface OtpPayload {
  email: string;
  otp: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

// ─── Contacts ─────────────────────────────────────────────────────────────────

export type ContactStatus = "accepted" | "pending" | "blocked";

export interface Contact {
  id: string;
  user: User;
  status: ContactStatus;
  createdAt: string;
}

// ─── Calls ────────────────────────────────────────────────────────────────────

export type CallType = "one-to-one" | "group";
export type CallStatus = "incoming" | "outgoing" | "active" | "ended" | "missed";

export interface Call {
  id: string;
  type: CallType;
  status: CallStatus;
  participants: User[];
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  detectionSummary?: DetectionSummary;
}

// ─── Detection ────────────────────────────────────────────────────────────────

export type DetectionState =
  | "genuine"
  | "suspicious"
  | "synthetic"
  | "analyzing"
  | "unknown";

export interface DetectionEvent {
  id: string;
  callId: string;
  userId: string;
  state: DetectionState;
  confidenceScore: number;
  timestamp: string;
  message?: string;
}

export interface DetectionSummary {
  overallState: DetectionState;
  averageConfidence: number;
  events: DetectionEvent[];
  flaggedSegments: number;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationType =
  | "call_incoming"
  | "call_missed"
  | "contact_request"
  | "detection_alert";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  meta?: Record<string, unknown>;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ─── Backend (RingWave API) — real shapes returned by the Express/Postgres
// backend. These mirror the actual API contract (controllers/schemas), and
// are intentionally separate from the richer mock types above, since the
// backend does not (yet) support contacts, notifications, OTP, or rich call
// states. Pages backed by real endpoints should use these types.

export interface BackendUser {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorEnvelope {
  success: false;
  message: string;
  errors: Array<{ field: string; message: string }>;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: { id: number; name: string; email: string };
}

export interface RefreshResponseData {
  accessToken: string;
  expiresIn: number;
}

export type BackendCallStatus = "completed" | "missed" | "rejected";

export interface BackendCall {
  id: number;
  caller_id: number;
  receiver_id: number;
  duration: number;
  status: BackendCallStatus;
  created_at: string;
  caller_name: string | null;
  caller_email: string | null;
  receiver_name: string | null;
  receiver_email: string | null;
}

export type BackendPrediction = "likely_synthetic" | "likely_real" | "uncertain";

export interface BackendDetection {
  id: number;
  user_id: number;
  prediction: BackendPrediction;
  confidence_score: number;
  created_at: string;
  user_name: string | null;
  user_email: string | null;
}

export interface BackendPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}