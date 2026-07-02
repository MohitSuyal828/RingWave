import { axiosInstance } from "@/services/axios";
import type { ApiEnvelope, BackendCall, BackendCallStatus, BackendPagination } from "@/types";

export interface CallHistoryResult {
  calls: BackendCall[];
  pagination: BackendPagination;
}

export const getCallHistoryRequest = async (
  page = 1,
  limit = 20
): Promise<CallHistoryResult> => {
  const { data } = await axiosInstance.get<ApiEnvelope<CallHistoryResult>>(
    "/calls/history",
    { params: { page, limit } }
  );
  return data.data;
};

export interface LogCallPayload {
  receiver_id: number;
  duration: number;
  status: BackendCallStatus;
}

export const logCallRequest = async (
  payload: LogCallPayload
): Promise<BackendCall> => {
  const { data } = await axiosInstance.post<ApiEnvelope<{ call: BackendCall }>>(
    "/calls",
    payload
  );
  return data.data.call;
};
