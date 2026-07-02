import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  PhoneIncoming, PhoneOutgoing, PhoneMissed,
  Search, Shield, Clock, Loader2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { formatRelativeTime, formatDuration } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { getCallHistoryRequest } from "@/services/api/callApi";
import { callDirection, callStatusToUiType } from "@/lib/backendMappers";
import type { BackendCall } from "@/types";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  genuine: { label: "Genuine", color: "text-[#22C55E]", bg: "bg-[#22C55E]/10" },
  suspicious: { label: "Suspicious", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
  synthetic: { label: "Synthetic", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
  unknown: { label: "Not analyzed", color: "text-[#94A3B8]", bg: "bg-[#94A3B8]/10" },
};

const CallIcon = ({ type }: { type: string }) => {
  if (type === "incoming") return <PhoneIncoming className="w-4 h-4 text-[#06B6D4]" />;
  if (type === "outgoing") return <PhoneOutgoing className="w-4 h-4 text-[#94A3B8]" />;
  return <PhoneMissed className="w-4 h-4 text-[#EF4444]" />;
};

const PAGE_LIMIT = 20;

const CallHistoryPage = () => {
  const currentUserId = useAuthStore((s) => s.user?.id);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [calls, setCalls] = useState<BackendCall[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUserId) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getCallHistoryRequest(page, PAGE_LIMIT);
        if (cancelled) return;
        setCalls(result.calls);
        setTotalPages(result.pagination.totalPages || 1);
      } catch {
        if (!cancelled) setError("Couldn't load call history. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [page, currentUserId]);

  const rows = calls.map((call) => {
    const direction = currentUserId ? callDirection(call, currentUserId) : "incoming";
    const uiType = callStatusToUiType(call.status, direction);
    const counterpartName =
      direction === "outgoing"
        ? call.receiver_name ?? "Unknown"
        : call.caller_name ?? "Unknown";
    const avatar = counterpartName
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return {
      id: String(call.id),
      name: counterpartName,
      avatar,
      type: uiType,
      duration: call.duration,
      // The backend doesn't link call_history rows to detection_logs rows,
      // so there is no real per-call detection verdict to show — "unknown"
      // is shown honestly instead of fabricating one.
      status: "unknown" as const,
      time: call.created_at,
    };
  });

  const filtered = rows.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || c.type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#F8FAFC]">Call History</h2>
        <p className="text-[#94A3B8] text-sm mt-1">Review all your past calls</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search calls..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1E293B]/60 border border-[#334155]/60 rounded-xl pl-11 pr-4 py-2.5 text-[#F8FAFC] text-sm placeholder-[#334155] outline-none focus:border-[#06B6D4]/60 transition-colors"
          />
        </div>
        <div className="flex gap-1 bg-[#0F172A] border border-[#334155]/60 rounded-xl p-1">
          {["all", "incoming", "outgoing", "missed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                filter === f
                  ? "bg-[#06B6D4] text-[#020617]"
                  : "text-[#94A3B8] hover:text-[#F8FAFC]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1E293B]/60 backdrop-blur border border-[#334155]/60 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-[#334155]/60">
          {["Type", "Contact", "Duration", "Detection", "Time"].map((h) => (
            <span key={h} className="text-[#94A3B8] text-xs font-medium uppercase tracking-wide">
              {h}
            </span>
          ))}
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-[#06B6D4] animate-spin" />
          </div>
        ) : error ? (
          <div className="py-16 text-center text-[#EF4444] text-sm flex flex-col items-center gap-2">
            <Shield className="w-5 h-5" />
            {error}
          </div>
        ) : (
          <div className="divide-y divide-[#334155]/30">
            {filtered.map((call, i) => {
              const status = STATUS_CONFIG[call.status];
              return (
                <motion.div
                  key={call.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-4 items-center hover:bg-[#334155]/20 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#0F172A] border border-[#334155]/60 flex items-center justify-center">
                    <CallIcon type={call.type} />
                  </div>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#0F172A] border border-[#334155] flex items-center justify-center shrink-0">
                      <span className="text-[#94A3B8] text-xs font-bold">{call.avatar}</span>
                    </div>
                    <span className="text-[#F8FAFC] text-sm font-medium truncate">{call.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#94A3B8] text-sm">
                    <Clock className="w-3.5 h-3.5" />
                    {call.duration > 0 ? formatDuration(call.duration) : "—"}
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.bg} ${status.color}`}>
                    {status.label}
                  </span>
                  <span className="text-[#94A3B8] text-xs whitespace-nowrap">
                    {formatRelativeTime(call.time)}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="py-16 text-center text-[#94A3B8] text-sm">
            No calls found
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-2 rounded-lg border border-[#334155]/60 text-[#94A3B8] hover:text-[#F8FAFC] disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[#94A3B8] text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-2 rounded-lg border border-[#334155]/60 text-[#94A3B8] hover:text-[#F8FAFC] disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CallHistoryPage;
