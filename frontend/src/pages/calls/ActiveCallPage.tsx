import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Volume2, VolumeX,
  PhoneOff, Activity, Wifi, ChevronDown,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { formatDuration } from "@/lib/utils";
import {
  DETECTION_CONFIG,
  type DetectionState,
} from "@/constants/detection";

interface DetectionEvent {
  id: string;
  state: DetectionState;
  confidence: number;
  time: string;
}

const ActiveCallPage = () => {
  const navigate = useNavigate();
  const { callId } = useParams();
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [duration, setDuration] = useState(0);
  const [detectionState, setDetectionState] =
    useState<DetectionState>("analyzing");
  const [confidence, setConfidence] = useState(0);
  const [events, setEvents] = useState<DetectionEvent[]>([]);
  const [showTimeline, setShowTimeline] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const seq: { delay: number; state: DetectionState; conf: number }[] = [
      { delay: 3000, state: "genuine", conf: 96 },
      { delay: 12000, state: "suspicious", conf: 62 },
      { delay: 20000, state: "genuine", conf: 91 },
    ];
    const timers = seq.map(({ delay, state, conf }) =>
      setTimeout(() => {
        setDetectionState(state);
        setConfidence(conf);
        setEvents((prev) => [
          {
            id: Date.now().toString(),
            state,
            confidence: conf,
            time: new Date().toLocaleTimeString(),
          },
          ...prev,
        ]);
      }, delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleEndCall = () => navigate(ROUTES.DASHBOARD);
  const detection = DETECTION_CONFIG[detectionState];
  const DetIcon = detection.icon;
  const waveHeights = [6, 10, 16, 22, 28, 22, 32, 22, 28, 22, 16, 10, 6];

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col relative overflow-hidden">

      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background:
            detectionState === "synthetic"
              ? "radial-gradient(circle at 50% 40%, rgba(239,68,68,0.06) 0%, transparent 60%)"
              : detectionState === "suspicious"
              ? "radial-gradient(circle at 50% 40%, rgba(245,158,11,0.06) 0%, transparent 60%)"
              : "radial-gradient(circle at 50% 40%, rgba(6,182,212,0.05) 0%, transparent 60%)",
        }}
      />

      {/* Topbar */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#0F172A]/80 backdrop-blur border-b border-[#334155]/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#06B6D4]/10 border border-[#06B6D4]/30 flex items-center justify-center">
            <Wifi className="w-3.5 h-3.5 text-[#06B6D4]" />
          </div>
          <span className="text-[#F8FAFC] font-bold">
            Ring<span className="text-[#06B6D4]">Wave</span>
          </span>
        </div>
        <div className="flex items-center gap-2 bg-[#1E293B] border border-[#334155]/60 rounded-full px-3 py-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-[#F8FAFC] text-sm font-mono font-medium">
            {formatDuration(duration)}
          </span>
        </div>
        <div className="text-[#94A3B8] text-sm">
          ID: {callId?.slice(0, 8)}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">

        {/* Caller */}
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative">
            {[1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full"
                style={{
                  border: `1px solid ${
                    detectionState === "synthetic"
                      ? "rgba(239,68,68,0.3)"
                      : detectionState === "suspicious"
                      ? "rgba(245,158,11,0.3)"
                      : "rgba(34,197,94,0.2)"
                  }`,
                }}
                animate={{ scale: [1, 1.4 + i * 0.2, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
              />
            ))}
            <div className="w-24 h-24 rounded-full bg-[#1E293B] border-2 border-[#334155] flex items-center justify-center">
              <span className="text-[#F8FAFC] text-3xl font-bold">AM</span>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#F8FAFC]">Arjun Mehta</h1>
            <p className="text-[#94A3B8] text-sm mt-1">@arjun_m · In call</p>
          </div>
        </motion.div>

        {/* Detection badge */}
        <AnimatePresence mode="wait">
          <motion.div
            key={detectionState}
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl border ${detection.bg} ${detection.border}`}
          >
            {detectionState === "analyzing" ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              >
                <DetIcon className={`w-5 h-5 ${detection.color}`} />
              </motion.div>
            ) : (
              <DetIcon className={`w-5 h-5 ${detection.color}`} />
            )}
            <div>
              <p className={`text-sm font-semibold ${detection.color}`}>
                {detection.label}
              </p>
              {confidence > 0 && (
                <p className="text-[#94A3B8] text-xs mt-0.5">
                  Confidence: {confidence}%
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Confidence meter */}
        {confidence > 0 && (
          <motion.div
            className="w-full max-w-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[#94A3B8] flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Authenticity Score
              </span>
              <span className={`font-bold ${detection.color}`}>
                {confidence}%
              </span>
            </div>
            <div className="h-2 bg-[#1E293B] rounded-full overflow-hidden border border-[#334155]/60">
              <motion.div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  background:
                    confidence >= 80
                      ? "#22C55E"
                      : confidence >= 50
                      ? "#F59E0B"
                      : "#EF4444",
                }}
                initial={{ width: "0%" }}
                animate={{ width: `${confidence}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </motion.div>
        )}

        {/* Waveform */}
        <div className="flex items-end gap-[3px] h-12">
          {waveHeights.map((h, i) => (
            <motion.div
              key={i}
              className={`w-[4px] rounded-full ${
                isMuted ? "bg-[#334155]" : "bg-[#06B6D4]"
              }`}
              style={{ height: h }}
              animate={isMuted ? { scaleY: 1 } : { scaleY: [1, 1.8, 0.6, 1.5, 1] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.06,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <motion.div className="flex flex-col items-center gap-2">
            <motion.button
              onClick={() => setIsMuted((m) => !m)}
              className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-colors ${
                isMuted
                  ? "bg-[#F59E0B]/10 border-[#F59E0B]/60 text-[#F59E0B]"
                  : "bg-[#1E293B] border-[#334155] text-[#94A3B8] hover:text-[#F8FAFC]"
              }`}
              whileTap={{ scale: 0.92 }}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </motion.button>
            <span className="text-[#94A3B8] text-xs">
              {isMuted ? "Unmute" : "Mute"}
            </span>
          </motion.div>

          <motion.div className="flex flex-col items-center gap-2">
            <motion.button
              onClick={handleEndCall}
              className="w-16 h-16 rounded-full bg-[#EF4444] flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              style={{ boxShadow: "0 0 28px rgba(239,68,68,0.35)" }}
            >
              <PhoneOff className="w-7 h-7 text-white" />
            </motion.button>
            <span className="text-[#94A3B8] text-sm">End Call</span>
          </motion.div>

          <motion.div className="flex flex-col items-center gap-2">
            <motion.button
              onClick={() => setIsSpeakerOn((s) => !s)}
              className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-colors ${
                isSpeakerOn
                  ? "bg-[#06B6D4]/10 border-[#06B6D4]/60 text-[#06B6D4]"
                  : "bg-[#1E293B] border-[#334155] text-[#94A3B8] hover:text-[#F8FAFC]"
              }`}
              whileTap={{ scale: 0.92 }}
            >
              {isSpeakerOn ? (
                <Volume2 className="w-6 h-6" />
              ) : (
                <VolumeX className="w-6 h-6" />
              )}
            </motion.button>
            <span className="text-[#94A3B8] text-xs">
              {isSpeakerOn ? "Speaker" : "Earpiece"}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Timeline panel */}
      <div className="border-t border-[#334155]/60 bg-[#0F172A]/80 backdrop-blur">
        <button
          onClick={() => setShowTimeline((s) => !s)}
          className="w-full flex items-center justify-between px-6 py-3 text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#06B6D4]" />
            <span className="text-sm font-medium">Detection Timeline</span>
            {events.length > 0 && (
              <span className="text-xs px-2 py-0.5 bg-[#06B6D4]/10 text-[#06B6D4] rounded-full">
                {events.length} event{events.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              showTimeline ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence>
          {showTimeline && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-4 space-y-2 max-h-48 overflow-y-auto">
                {events.length === 0 ? (
                  <p className="text-[#94A3B8] text-sm text-center py-4">
                    No events yet
                  </p>
                ) : (
                  events.map((ev) => {
                    const cfg = DETECTION_CONFIG[ev.state];
                    const EIcon = cfg.icon;
                    return (
                      <div
                        key={ev.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border ${cfg.bg} ${cfg.border}`}
                      >
                        <EIcon className={`w-4 h-4 ${cfg.color} shrink-0`} />
                        <div className="flex-1">
                          <p className={`text-xs font-medium ${cfg.color}`}>
                            {cfg.label}
                          </p>
                          <p className="text-[#94A3B8] text-xs">
                            Confidence: {ev.confidence}%
                          </p>
                        </div>
                        <span className="text-[#94A3B8] text-xs shrink-0">
                          {ev.time}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ActiveCallPage;