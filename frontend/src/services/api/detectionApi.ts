import { axiosInstance } from "@/services/axios";
import type {
  ApiEnvelope,
  BackendDetection,
  BackendPagination,
  BackendPrediction,
} from "@/types";

export interface DetectionHistoryResult {
  detections: BackendDetection[];
  pagination: BackendPagination;
}

export const getDetectionHistoryRequest = async (
  page = 1,
  limit = 20
): Promise<DetectionHistoryResult> => {
  const { data } = await axiosInstance.get<ApiEnvelope<DetectionHistoryResult>>(
    "/detections/history",
    { params: { page, limit } }
  );
  // Postgres DECIMAL(5,2) columns come back through `pg` as strings (e.g.
  // "92.50") to avoid floating-point rounding surprises — coerce to a real
  // number here so every consumer downstream can rely on the declared type.
  return {
    ...data.data,
    detections: data.data.detections.map((d) => ({
      ...d,
      confidence_score: Number(d.confidence_score),
    })),
  };
};

export interface LogDetectionPayload {
  prediction: BackendPrediction;
  confidence_score: number;
}

export const logDetectionRequest = async (
  payload: LogDetectionPayload
): Promise<BackendDetection> => {
  const { data } = await axiosInstance.post<
    ApiEnvelope<{ detection: BackendDetection }>
  >("/detections", payload);
  return {
    ...data.data.detection,
    confidence_score: Number(data.data.detection.confidence_score),
  };
};
