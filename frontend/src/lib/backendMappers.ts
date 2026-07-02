import type { BackendCallStatus, BackendPrediction } from "@/types";

// ─── Backend → UI mappers ───────────────────────────────────────────────────
// The existing UI (CallHistoryPage, DetectionReportsPage, DashboardPage) was
// built against richer mock enums than the real backend exposes. These
// helpers translate the backend's actual values into the closest existing
// UI status key, so the existing STATUS_CONFIG/VERDICT_CONFIG maps in each
// page keep working unchanged.

// Backend call status: "completed" | "missed" | "rejected"
// UI call "type" (icon) buckets: "incoming" | "outgoing" | "missed"
export const callDirection = (
  call: { caller_id: number; receiver_id: number },
  currentUserId: number
): "incoming" | "outgoing" => (call.caller_id === currentUserId ? "outgoing" : "incoming");

export const callStatusToUiType = (
  status: BackendCallStatus,
  direction: "incoming" | "outgoing"
): "incoming" | "outgoing" | "missed" => {
  if (status === "missed" || status === "rejected") return "missed";
  return direction;
};

// Backend prediction: "likely_synthetic" | "likely_real" | "uncertain"
// UI detection state keys: "genuine" | "suspicious" | "synthetic" | "unknown"
export const predictionToUiState = (
  prediction: BackendPrediction
): "genuine" | "suspicious" | "synthetic" => {
  if (prediction === "likely_real") return "genuine";
  if (prediction === "likely_synthetic") return "synthetic";
  return "suspicious"; // "uncertain"
};
