import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { isAxiosError } from "axios";
import { Shield, Mail, User, Edit3, ShieldCheck, X, Loader2, Calendar } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { getInitials } from "@/lib/utils";
import { getProfileRequest, updateProfileRequest } from "@/services/api/authApi";
import { getCallHistoryRequest } from "@/services/api/callApi";
import { getDetectionHistoryRequest } from "@/services/api/detectionApi";
import { predictionToUiState } from "@/lib/backendMappers";
import type { ApiErrorEnvelope } from "@/types";

const ProfilePage = () => {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Stats — derived from real call/detection history (backend has no
  // contacts feature, so the original "Contacts"/"Verified" mock slots are
  // replaced with real, derivable numbers: total calls, missed calls,
  // genuine-voice calls, and flagged/synthetic detections).
  const [stats, setStats] = useState({
    totalCalls: 0,
    missedCalls: 0,
    genuine: 0,
    flagged: 0,
  });

  // Edit form state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [profile, callHistory, detectionHistory] = await Promise.all([
          getProfileRequest(),
          // limit=100 is the backend's max page size — there's no
          // aggregate/count-by-status endpoint, so this is the closest
          // approximation of totals the current API allows.
          getCallHistoryRequest(1, 100),
          getDetectionHistoryRequest(1, 100),
        ]);

        if (cancelled) return;

        setUser(profile);
        setName(profile.name);

        const missedCalls = callHistory.calls.filter(
          (c) => c.status === "missed" || c.status === "rejected"
        ).length;
        const genuine = detectionHistory.detections.filter(
          (d) => predictionToUiState(d.prediction) === "genuine"
        ).length;
        const flagged = detectionHistory.detections.filter(
          (d) => predictionToUiState(d.prediction) === "synthetic"
        ).length;

        setStats({
          totalCalls: callHistory.pagination.total,
          missedCalls,
          genuine,
          flagged,
        });
      } catch {
        if (!cancelled) {
          setLoadError("Couldn't load your profile. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [setUser]);

  const STATS = [
    { label: "Total Calls", value: String(stats.totalCalls) },
    { label: "Missed", value: String(stats.missedCalls) },
    { label: "Genuine", value: String(stats.genuine) },
    { label: "Flagged", value: String(stats.flagged) },
  ];

  const openEdit = () => {
    setName(user?.name ?? "");
    setPassword("");
    setCurrentPassword("");
    setSaveError(null);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaveError(null);

    const payload: { name?: string; password?: string; current_password?: string } = {};
    if (name.trim() && name.trim() !== user?.name) payload.name = name.trim();
    if (password) {
      payload.password = password;
      payload.current_password = currentPassword;
    }

    if (Object.keys(payload).length === 0) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    try {
      const updated = await updateProfileRequest(payload);
      setUser(updated);
      setIsEditing(false);
      setPassword("");
      setCurrentPassword("");
    } catch (err) {
      if (isAxiosError<ApiErrorEnvelope>(err) && err.response?.data?.message) {
        setSaveError(err.response.data.message);
      } else {
        setSaveError("Couldn't update profile. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-[#06B6D4] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {loadError && (
        <div className="px-4 py-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl text-[#EF4444] text-sm">
          {loadError}
        </div>
      )}

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1E293B]/60 backdrop-blur border border-[#334155]/60 rounded-2xl p-8"
      >
        <div className="flex items-start justify-between mb-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-[#06B6D4]/10 border-2 border-[#06B6D4]/30 flex items-center justify-center">
              <span className="text-[#06B6D4] text-2xl font-bold">
                {user ? getInitials(user.name) : "U"}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#22C55E] rounded-full border-2 border-[#1E293B] flex items-center justify-center">
              <ShieldCheck className="w-3 h-3 text-white" />
            </div>
          </div>
          <button
            onClick={openEdit}
            className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] border border-[#334155]/60 rounded-xl text-[#94A3B8] hover:text-[#F8FAFC] text-sm transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-[#F8FAFC]">
            {user?.name ?? "User Name"}
          </h2>
          <p className="text-[#06B6D4] font-medium flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Member since{" "}
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  year: "numeric",
                })
              : "—"}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Shield className="w-4 h-4 text-[#06B6D4]" />
            <span className="text-[#06B6D4] text-sm font-medium">
              Verified Account
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#334155]/60">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-[#F8FAFC]">{s.value}</p>
              <p className="text-[#94A3B8] text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Info card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#1E293B]/60 backdrop-blur border border-[#334155]/60 rounded-2xl p-6 space-y-4"
      >
        <h3 className="text-[#F8FAFC] font-semibold">Account Information</h3>
        {[
          { icon: User, label: "Full Name", value: user?.name ?? "—" },
          { icon: Mail, label: "Email", value: user?.email ?? "—" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-4 py-3 border-b border-[#334155]/40 last:border-0">
            <div className="w-9 h-9 rounded-xl bg-[#0F172A] border border-[#334155]/60 flex items-center justify-center shrink-0">
              <item.icon className="w-4 h-4 text-[#94A3B8]" />
            </div>
            <div>
              <p className="text-[#94A3B8] text-xs">{item.label}</p>
              <p className="text-[#F8FAFC] text-sm font-medium mt-0.5">{item.value}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Edit modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#1E293B] border border-[#334155]/60 rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[#F8FAFC] font-semibold text-lg">Edit Profile</h3>
              <button onClick={() => setIsEditing(false)} className="text-[#94A3B8] hover:text-[#F8FAFC]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveError && (
              <div className="px-3 py-2 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg text-[#EF4444] text-sm">
                {saveError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#94A3B8]">Full name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-[#F8FAFC] text-sm outline-none focus:border-[#06B6D4]"
              />
            </div>

            <div className="pt-2 border-t border-[#334155]/60 space-y-3">
              <p className="text-xs text-[#94A3B8]">
                Leave password fields blank to keep your current password.
              </p>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#94A3B8]">New password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-[#F8FAFC] text-sm outline-none focus:border-[#06B6D4]"
                />
              </div>
              {password && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#94A3B8]">Current password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Required to change password"
                    className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-[#F8FAFC] text-sm outline-none focus:border-[#06B6D4]"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#334155]/60 text-[#94A3B8] hover:text-[#F8FAFC] text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#06B6D4] hover:bg-[#06B6D4]/90 disabled:bg-[#06B6D4]/40 text-[#020617] font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save changes"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
