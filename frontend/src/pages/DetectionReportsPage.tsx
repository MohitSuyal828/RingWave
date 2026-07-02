import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, ShieldX, Activity, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { getDetectionHistoryRequest } from "@/services/api/detectionApi";
import { predictionToUiState } from "@/lib/backendMappers";
import type { BackendDetection } from "@/types";

const VERDICT_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; icon: React.ElementType }
> = {
  genuine: { label: "Genuine", color: "text-[#22C55E]", bg: "bg-[#22C55E]/10", border: "border-[#22C55E]/20", icon: ShieldCheck },
  suspicious: { label: "Suspicious", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", border: "border-[#F59E0B]/20", icon: ShieldAlert },
  synthetic: { label: "Synthetic", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10", border: "border-[#EF4444]/20", icon: ShieldX },
};

const PAGE_LIMIT = 20;

const DetectionReportsPage = () => {
  const [page, setPage] = useState(1);
  const [detections, setDetections] = useState<BackendDetection[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Summary counts — the backend has no aggregate-by-prediction endpoint,
  // so this fetches up to the max page size (100) once to compute totals,
  // separately from the paginated list below.
  const [summary, setSummary] = useState({ genuine: 0, suspicious: 0, synthetic: 0 });
  const [summaryLoading, setSummaryLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setSummaryLoading(true);
      try {
        const result = await getDetectionHistoryRequest(1, 100);
        if (cancelled) return;
        const counts = { genuine: 0, suspicious: 0, synthetic: 0 };
        result.detections.forEach((d) => {
          counts[predictionToUiState(d.prediction)] += 1;
        });
        setSummary(counts);
      } catch {
        // Summary is best-effort; list below still loads independently.
      } finally {
        if (!cancelled) setSummaryLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getDetectionHistoryRequest(page, PAGE_LIMIT);
        if (cancelled) return;
        setDetections(result.detections);
        setTotalPages(result.pagination.totalPages || 1);
      } catch {
        if (!cancelled) setError("Couldn't load detection reports. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page]);

  const SUMMARY_CARDS = [
    { label: "Genuine Calls", value: summary.genuine, color: "#22C55E", icon: ShieldCheck },
    { label: "Suspicious", value: summary.suspicious, color: "#F59E0B", icon: ShieldAlert },
    { label: "Synthetic / Fake", value: summary.synthetic, color: "#EF4444", icon: ShieldX },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#F8FAFC]">Detection Reports</h2>
        <p className="text-[#94A3B8] text-sm mt-1">
          AI analysis results for your voice samples
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SUMMARY_CARDS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-[#1E293B]/60 backdrop-blur border border-[#334155]/60 rounded-2xl p-5 flex items-center gap-4"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}
            >
              <s.icon className="w-6 h-6" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-3xl font-bold text-[#F8FAFC]">
                {summaryLoading ? "—" : s.value}
              </p>
              <p className="text-[#94A3B8] text-sm">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Reports list */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-[#06B6D4] animate-spin" />
        </div>
      ) : error ? (
        <div className="py-16 text-center text-[#EF4444] text-sm">{error}</div>
      ) : detections.length === 0 ? (
        <div className="py-16 text-center text-[#94A3B8] text-sm">
          No detection reports yet
        </div>
      ) : (
        <div className="space-y-3">
          {detections.map((report, i) => {
            const verdictKey = predictionToUiState(report.prediction);
            const verdict = VERDICT_CONFIG[verdictKey];
            const VIcon = verdict.icon;
            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="bg-[#1E293B]/60 backdrop-blur border border-[#334155]/60 rounded-2xl p-5 hover:border-[#334155] transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl ${verdict.bg} border ${verdict.border} flex items-center justify-center shrink-0`}>
                    <VIcon className={`w-5 h-5 ${verdict.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        {/* The backend doesn't link detection_logs rows to a
                            specific call (no call_id column), so this shows
                            a sample identifier rather than a fabricated
                            "Call with X" — see audit notes. */}
                        <p className="text-[#F8FAFC] font-semibold">
                          Voice sample #{report.id}
                        </p>
                        <p className="text-[#94A3B8] text-xs mt-0.5">
                          {formatRelativeTime(report.created_at)}
                        </p>
                      </div>
                      <span className={`text-sm font-semibold px-3 py-1 rounded-full ${verdict.bg} ${verdict.color} border ${verdict.border}`}>
                        {verdict.label}
                      </span>
                    </div>

                    {/* Confidence bar — backend confidence_score is already 0-100 */}
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#94A3B8] flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          Confidence score
                        </span>
                        <span className={`font-semibold ${verdict.color}`}>
                          {Math.round(report.confidence_score)}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#0F172A] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: verdict.color.replace("text-[", "").replace("]", "") }}
                          initial={{ width: 0 }}
                          animate={{ width: `${report.confidence_score}%` }}
                          transition={{ duration: 0.8, delay: 0.1 + i * 0.05 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

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

export default DetectionReportsPage;
