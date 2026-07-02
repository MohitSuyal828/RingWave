import { axiosInstance } from "@/services/axios";
import type {
  ApiEnvelope,
  BackendUser,
  LoginResponseData,
  RefreshResponseData,
} from "@/types";

// ─── Auth API ──────────────────────────────────────────────────────────────
// Thin wrappers around the real backend contract (see authController.js /
// authRoutes.js). Every call unwraps axios's response.data, which is always
// the { success, message, data } envelope the backend's success()/fail()
// helpers produce.

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  name?: string;
  password?: string;
  current_password?: string;
}

export const registerRequest = async (
  payload: RegisterPayload
): Promise<BackendUser> => {
  const { data } = await axiosInstance.post<ApiEnvelope<{ user: BackendUser }>>(
    "/auth/register",
    payload
  );
  return data.data.user;
};

export const loginRequest = async (
  payload: LoginPayload
): Promise<LoginResponseData> => {
  const { data } = await axiosInstance.post<ApiEnvelope<LoginResponseData>>(
    "/auth/login",
    payload
  );
  return data.data;
};

export const refreshRequest = async (
  refreshToken: string
): Promise<RefreshResponseData> => {
  const { data } = await axiosInstance.post<ApiEnvelope<RefreshResponseData>>(
    "/auth/refresh",
    { refreshToken }
  );
  return data.data;
};

export const logoutRequest = async (refreshToken: string): Promise<void> => {
  await axiosInstance.post("/auth/logout", { refreshToken });
};

export const getProfileRequest = async (): Promise<BackendUser> => {
  const { data } = await axiosInstance.get<ApiEnvelope<{ user: BackendUser }>>(
    "/auth/profile"
  );
  return data.data.user;
};

export const updateProfileRequest = async (
  payload: UpdateProfilePayload
): Promise<BackendUser> => {
  const { data } = await axiosInstance.patch<ApiEnvelope<{ user: BackendUser }>>(
    "/auth/profile",
    payload
  );
  return data.data.user;
};
