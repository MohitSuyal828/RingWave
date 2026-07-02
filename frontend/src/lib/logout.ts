import { useAuthStore } from "@/store/authStore";
import { logoutRequest } from "@/services/api/authApi";

// ─── performLogout ───────────────────────────────────────────────────────────
// Calls the backend's POST /auth/logout to revoke the current refresh token
// server-side (logout is idempotent there — see logoutController comments),
// then clears local auth state regardless of whether the network call
// succeeds, so the user is never stuck "logged in" client-side just because
// a request failed or there's no connectivity.
export const performLogout = async (): Promise<void> => {
  const { refreshToken, logout } = useAuthStore.getState();

  if (refreshToken) {
    try {
      await logoutRequest(refreshToken);
    } catch {
      // Logout should never block on the network — proceed to clear local
      // state either way.
    }
  }

  logout();
};
