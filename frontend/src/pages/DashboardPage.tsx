import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  PhoneCall,
  PhoneMissed,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  TrendingUp,
  Clock,
  Activity,
  Loader2,
} from "lucide-react";
import { formatRelativeTime, formatDuration } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { getCallHistoryRequest } from "@/services/api/callApi";
import { getDetectionHistoryRequest } from "@/services/api/detectionApi";
import { callDirection, callStatusToUiType, predictionToUiState } from "@/lib/backendMappers";
import type { BackendCall, BackendDetection } from "@/types";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  genuine: { label: "Genuine", color: "text-[#22C55E]", bg: "bg-[#22C55E]/10" },
  suspicious: { label: "Suspicious", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
  synthetic: { label: "Synthetic", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
  unknown: { label: "Not analyzed", color: "text-[#94A3B8]", bg: "bg-[#94A3B8]/10" },
};

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  high: { color: "text-[#EF4444]", bg: "bg-[#EF4444]/10", border: "border-[#EF4444]/20" },
  medium: { color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", border: "border-[#F59E0B]/20" },
};

const DashboardPage = () => {
  const currentUserId = useAuthStore((s) => s.user?.id);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calls, setCalls] = useState<BackendCall[]>([]);
  const [callsTotal, setCallsTotal] = useState(0);
  const [detections, setDetections] = useState<BackendDetection[]>([]);

  useEffect(() => {
    if (!currentUserId) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        // limit=100 is the backend's max page size. There's no dashboard
        // aggregate endpoint, so the most recent 100 calls/detections are
        // used to compute every stat/chart on this page.
        const [callResult, detectionResult] = await Promise.all([
          getCallHistoryRequest(1, 100),
          getDetectionHistoryRequest(1, 100),
        ]);
        if (cancelled) return;
        setCalls(callResult.calls);
        setCallsTotal(callResult.pagination.total);
        setDetections(detectionResult.detections);
      } catch {
        if (!cancelled) setError("Couldn't load your dashboard. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  const missedCalls = calls.filter((c) => c.status === "missed" || c.status === "rejected").length;
  const genuineCount = detections.filter((d) => predictionToUiState(d.prediction) === "genuine").length;
  const suspiciousCount = detections.filter((d) => predictionToUiState(d.prediction) === "suspicious").length;
  const syntheticCount = detections.filter((d) => predictionToUiState(d.prediction) === "synthetic").length;
  const detectionTotal = detections.length;

  const STATS = [
    {
      label: "Total Calls", value: String(callsTotal), icon: PhoneCall,
      color: "#06B6D4", bg: "bg-[#06B6D4]/10", border: "border-[#06B6D4]/20",
    },
    {
      label: "Missed Calls", value: String(missedCalls), icon: PhoneMissed,
      color: "#F59E0B", bg: "bg-[#F59E0B]/10", border: "border-[#F59E0B]/20",
    },
    {
      label: "Verified Calls", value: String(genuineCount), icon: ShieldCheck,
      color: "#22C55E", bg: "bg-[#22C55E]/10", border: "border-[#22C55E]/20",
    },
    {
      label: "Synthetic / Fake", value: String(syntheticCount), icon: ShieldX,
      color: "#EF4444", bg: "bg-[#EF4444]/10", border: "border-[#EF4444]/20",
    },
  ];

  const recentCalls = calls.slice(0, 5).map((call) => {
    const direction = currentUserId ? callDirection(call, currentUserId) : "incoming";
    const uiType = callStatusToUiType(call.status, direction);
    const name = direction === "outgoing" ? call.receiver_name ?? "Unknown" : call.caller_name ?? "Unknown";
    return {
      id: call.id,
      name,
      avatar: name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2),
      type: uiType,
      duration: call.duration,
      status: "unknown" as const, // calls aren't linked to a detection verdict in this schema
      time: call.created_at,
    };
  });

  // Recent (non-genuine) detections double as "alerts" — there is no
  // separate alerts/notifications table in the backend, so this surfaces
  // the most recent flagged voice samples instead.
  const recentAlerts = detections
    .filter((d) => predictionToUiState(d.prediction) !== "genuine")
    .slice(0, 3)
    .map((d) => {
      const verdict = predictionToUiState(d.prediction);
      return {
        id: d.id,
        title: verdict === "synthetic" ? "Synthetic voice detected" : "Suspicious pattern detected",
        desc: `Confidence score: ${Math.round(d.confidence_score)}%`,
        time: d.created_at,
        severity: verdict === "synthetic" ? "high" : "medium",
      };
    });

  const recentDetections = detections.slice(0, 5);

  const authenticityPct = detectionTotal > 0 ? Math.round((genuineCount / detectionTotal) * 100) : 0;
  const suspiciousPct = detectionTotal > 0 ? Math.round((suspiciousCount / detectionTotal) * 100) : 0;
  const syntheticPct = detectionTotal > 0 ? Math.round((syntheticCount / detectionTotal) * 100) : 0;
  const circumference = 314; // 2 * pi * r(50), matches the original SVG

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-[#06B6D4] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center text-[#EF4444] text-sm">{error}</div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Welcome */}
      <motion.div {...fadeUp} transition={{ delay: 0.05 }}>
        <h2 className="text-2xl font-bold text-[#F8FAFC]">
          Good morning 👋
        </h2>
        <p className="text-[#94A3B8] text-sm mt-1">
          Here's what's happening with your calls today.
        </p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            {...fadeUp}
            transition={{ delay: 0.1 + i * 0.05 }}
            className={`bg-[#1E293B]/60 backdrop-blur border ${stat.border} rounded-2xl p-5`}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center`}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#F8FAFC]">{stat.value}</p>
            <p className="text-[#94A3B8] text-sm mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent calls */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2 bg-[#1E293B]/60 backdrop-blur border border-[#334155]/60 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#06B6D4]" />
              <h3 className="text-[#F8FAFC] font-semibold">Recent Calls</h3>
            </div>
          </div>

          {recentCalls.length === 0 ? (
            <p className="text-[#94A3B8] text-sm py-6 text-center">No calls yet</p>
          ) : (
            <div className="space-y-2">
              {recentCalls.map((call, i) => {
                const status = STATUS_CONFIG[call.status];
                return (
                  <motion.div
                    key={call.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#334155]/30 transition-colors cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#0F172A] border border-[#334155] flex items-center justify-center shrink-0">
                      <span className="text-[#94A3B8] text-xs font-bold">
                        {call.avatar}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[#F8FAFC] text-sm font-medium truncate">
                          {call.name}
                        </p>
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${status.bg} ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-xs capitalize ${
                            call.type === "incoming" ? "text-[#06B6D4]" : "text-[#94A3B8]"
                          }`}
                        >
                          {call.type}
                        </span>
                        {call.duration > 0 && (
                          <>
                            <span className="text-[#334155] text-xs">·</span>
                            <span className="text-[#94A3B8] text-xs">
                              {formatDuration(call.duration)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <span className="text-[#94A3B8] text-xs shrink-0">
                      {formatRelativeTime(call.time)}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Recent detections — replaces the old mock "Online Now" panel,
            since the backend has no contacts/presence feature. */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.3 }}
          className="bg-[#1E293B]/60 backdrop-blur border border-[#334155]/60 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#06B6D4]" />
              <h3 className="text-[#F8FAFC] font-semibold">Recent Detections</h3>
            </div>
          </div>

          {recentDetections.length === 0 ? (
            <p className="text-[#94A3B8] text-sm py-6 text-center">No detections yet</p>
          ) : (
            <div className="space-y-2">
              {recentDetections.map((d, i) => {
                const verdict = predictionToUiState(d.prediction);
                const dotColor =
                  verdict === "genuine" ? "bg-[#22C55E]" : verdict === "synthetic" ? "bg-[#EF4444]" : "bg-[#F59E0B]";
                return (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.05 }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#334155]/30 transition-colors"
                  >
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-full bg-[#0F172A] border border-[#334155] flex items-center justify-center">
                        <span className="text-[#94A3B8] text-xs font-bold">#{d.id}</span>
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#1E293B] ${dotColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#F8FAFC] text-sm font-medium truncate capitalize">
                        {verdict}
                      </p>
                      <p className="text-[#94A3B8] text-xs">
                        {Math.round(d.confidence_score)}% confidence
                      </p>
                    </div>
                    <span className="text-[#94A3B8] text-xs shrink-0">
                      {formatRelativeTime(d.created_at)}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Detection alerts */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.4 }}
          className="bg-[#1E293B]/60 backdrop-blur border border-[#334155]/60 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#EF4444]" />
              <h3 className="text-[#F8FAFC] font-semibold">Detection Alerts</h3>
            </div>
            <span className="text-xs px-2 py-0.5 bg-[#EF4444]/10 text-[#EF4444] rounded-full font-medium">
              {recentAlerts.length} new
            </span>
          </div>

          {recentAlerts.length === 0 ? (
            <p className="text-[#94A3B8] text-sm py-6 text-center">No alerts — all clear</p>
          ) : (
            <div className="space-y-3">
              {recentAlerts.map((alert, i) => {
                const sev = SEVERITY_CONFIG[alert.severity];
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 + i * 0.06 }}
                    className={`flex gap-3 p-3 rounded-xl border ${sev.bg} ${sev.border}`}
                  >
                    <div
                      className={`w-1.5 rounded-full shrink-0 mt-1 ${
                        alert.severity === "high" ? "bg-[#EF4444]" : "bg-[#F59E0B]"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${sev.color}`}>
                        {alert.title}
                      </p>
                      <p className="text-[#94A3B8] text-xs mt-0.5 truncate">
                        {alert.desc}
                      </p>
                    </div>
                    <span className="text-[#94A3B8] text-xs shrink-0">
                      {formatRelativeTime(alert.time)}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Authenticity summary */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.45 }}
          className="bg-[#1E293B]/60 backdrop-blur border border-[#334155]/60 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-[#06B6D4]" />
            <h3 className="text-[#F8FAFC] font-semibold">
              Authenticity Summary
            </h3>
          </div>

          {/* Donut-style stat */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#1E293B" strokeWidth="14" />
                <circle
                  cx="60" cy="60" r="50"
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="14"
                  strokeDasharray={`${(authenticityPct / 100) * circumference} ${circumference}`}
                  strokeLinecap="round"
                />
                <circle
                  cx="60" cy="60" r="50"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="14"
                  strokeDasharray={`${(suspiciousPct / 100) * circumference} ${circumference}`}
                  strokeDashoffset={`-${(authenticityPct / 100) * circumference}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-[#F8FAFC]">{authenticityPct}%</span>
                <span className="text-[#94A3B8] text-xs">Genuine</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2.5">
            {[
              { label: "Genuine", count: genuineCount, color: "#22C55E", pct: authenticityPct },
              { label: "Suspicious", count: suspiciousCount, color: "#F59E0B", pct: suspiciousPct },
              { label: "Synthetic", count: syntheticCount, color: "#EF4444", pct: syntheticPct },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                <span className="text-[#94A3B8] text-sm flex-1">{item.label}</span>
                <span className="text-[#F8FAFC] text-sm font-medium">{item.count}</span>
                <div className="w-20 h-1.5 bg-[#0F172A] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: item.color }} />
                </div>
                <span className="text-[#94A3B8] text-xs w-8 text-right">{item.pct}%</span>
              </div>
            ))}
          </div>

          {/* Footer note — replaces the fabricated "+4% this week" trend,
              since the backend has no historical/trend endpoint. */}
          <div className="mt-4 pt-4 border-t border-[#334155]/60 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#06B6D4]" />
            <p className="text-[#94A3B8] text-xs">
              Based on your last {detectionTotal} analyzed voice sample{detectionTotal !== 1 ? "s" : ""}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
