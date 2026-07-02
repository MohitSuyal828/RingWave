import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Volume2, VolumeX,
  PhoneOff, UserPlus, ShieldAlert,
  Activity, Wifi,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { formatDuration } from "@/lib/utils";
import {
  DETECTION_CONFIG,
  type DetectionState,
} from "@/constants/detection";

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isMuted: boolean;
  isSpeaking: boolean;
  detection: DetectionState;
  confidence: number;
}

const INITIAL_PARTICIPANTS: Participant[] = [
  { id: "1", name: "Arjun Mehta", avatar: "AM", isMuted: false, isSpeaking: true, detection: "genuine", confidence: 96 },
  { id: "2", name: "Priya Sharma", avatar: "PS", isMuted: false, isSpeaking: false, detection: "analyzing", confidence: 0 },
  { id: "3", name: "Rahul Verma", avatar: "RV", isMuted: true, isSpeaking: false, detection: "genuine", confidence: 89 },
  { id: "4", name: "You", avatar: "ME", isMuted: false, isSpeaking: false, detection: "genuine", confidence: 98 },
];

const GroupCallPage = () => {
  const navigate = useNavigate();
  const { callId } = useParams();
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [duration, setDuration] = useState(0);
  const [participants, setParticipants] =
    useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === "2"
            ? { ...p, detection: "suspicious" as DetectionState, confidence: 61, isSpeaking: true }
            : p
        )
      );
    }, 8000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setParticipants((prev) =>
        prev.map((p) => ({
          ...p,
          isSpeaking: Math.random() > 0.6 && !p.isMuted,
        }))
      );
    }, 2500);
    return () => clearInterval(t);
  }, []);

  const handleEnd = () => navigate(ROUTES.DASHBOARD);

  const hasThreat = participants.some(
    (p) => p.detection === "suspicious" || p.detection === "synthetic"
  );

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col relative overflow-hidden">

      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: hasThreat
            ? "radial-gradient(circle at 50% 30%, rgba(245,158,11,0.05) 0%, transparent 55%)"
            : "radial-gradient(circle at 50% 30%, rgba(6,182,212,0.04) 0%, transparent 55%)",
        }}
      />

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#0F172A]/80 backdrop-blur border-b border-[#334155]/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#06B6D4]/10 border border-[#06B6D4]/30 flex items-center justify-center">
            <Wifi className="w-3.5 h-3.5 text-[#06B6D4]" />
          </div>
          <span className="text-[#F8FAFC] font-bold">
            Ring<span className="text-[#06B6D4]">Wave</span>
          </span>
          <span className="ml-2 text-xs px-2 py-0.5 bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/20 rounded-full">
            Group
          </span>
        </div>
        <div className="flex items-center gap-2 bg-[#1E293B] border border-[#334155]/60 rounded-full px-3 py-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-[#F8FAFC] text-sm font-mono font-medium">
            {formatDuration(duration)}
          </span>
        </div>
        <span className="text-[#94A3B8] text-sm">
          {participants.length} participants
        </span>
      </div>

      {/* Threat banner */}
      <AnimatePresence>
        {hasThreat && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[#F59E0B]/10 border-b border-[#F59E0B]/30 px-6 py-3 flex items-center gap-3"
          >
            <ShieldAlert className="w-4 h-4 text-[#F59E0B] shrink-0" />
            <p className="text-[#F59E0B] text-sm font-medium">
              Suspicious voice pattern detected from a participant
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Participant grid */}
      <div className="flex-1 p-6 grid grid-cols-2 gap-4 content-start">
        {participants.map((p) => {
          const det = DETECTION_CONFIG[p.detection];
          const DIcon = det.icon;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative bg-[#1E293B]/60 backdrop-blur border rounded-2xl p-5 flex flex-col items-center gap-3 transition-all duration-500 ${
                p.isSpeaking
                  ? "border-[#06B6D4]/50 shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                  : "border-[#334155]/60"
              }`}
            >
              {p.isSpeaking && (
                <motion.div
                  className="absolute inset-0 rounded-2xl border border-[#06B6D4]/30"
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}

              <div className="relative">
                <div
                  className={`w-16 h-16 rounded-full bg-[#0F172A] border-2 flex items-center justify-center transition-colors ${
                    p.isSpeaking ? "border-[#06B6D4]" : "border-[#334155]"
                  }`}
                >
                  <span className="text-[#F8FAFC] text-xl font-bold">
                    {p.avatar}
                  </span>
                </div>
                {p.isMuted && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#EF4444] rounded-full flex items-center justify-center border-2 border-[#1E293B]">
                    <MicOff className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>

              <div className="text-center">
                <p className="text-[#F8FAFC] text-sm font-semibold">{p.name}</p>
                {p.isSpeaking && (
                  <p className="text-[#06B6D4] text-xs mt-0.5">Speaking...</p>
                )}
              </div>

              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${det.bg} ${det.border} ${det.color}`}
              >
                <DIcon className="w-3 h-3" />
                <span className="capitalize">{p.detection}</span>
                {p.confidence > 0 && (
                  <span className="opacity-70">· {p.confidence}%</span>
                )}
              </div>

              {p.isSpeaking && !p.isMuted && (
                <div className="flex items-end gap-[2px] h-5">
                  {[3, 5, 8, 5, 10, 5, 8, 5, 3].map((h, i) => (
                    <motion.div
                      key={i}
                      className="w-[2px] bg-[#06B6D4]/70 rounded-full"
                      style={{ height: h }}
                      animate={{ scaleY: [1, 1.6, 0.7, 1.3, 1] }}
                      transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.07 }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="px-6 py-5 bg-[#0F172A]/80 backdrop-blur border-t border-[#334155]/60">
        <div className="flex items-center justify-center gap-5">
          <motion.div className="flex flex-col items-center gap-1.5">
            <motion.button
              onClick={() => setIsMuted((m) => !m)}
              aria-label={isMuted ? "Unmute" : "Mute"}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors ${
                isMuted
                  ? "bg-[#F59E0B]/10 border-[#F59E0B]/60 text-[#F59E0B]"
                  : "bg-[#1E293B] border-[#334155] text-[#94A3B8]"
              }`}
              whileTap={{ scale: 0.9 }}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </motion.button>
            <span className="text-[#94A3B8] text-xs">
              {isMuted ? "Unmute" : "Mute"}
            </span>
          </motion.div>

          <motion.div className="flex flex-col items-center gap-1.5">
            <motion.button
              aria-label="Add participant"
              className="w-12 h-12 rounded-full bg-[#1E293B] border-2 border-[#334155] text-[#94A3B8] flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
            >
              <UserPlus className="w-5 h-5" />
            </motion.button>
            <span className="text-[#94A3B8] text-xs">Add</span>
          </motion.div>

          <motion.div className="flex flex-col items-center gap-1.5">
            <motion.button
              onClick={handleEnd}
              aria-label="End call"
              className="w-14 h-14 rounded-full bg-[#EF4444] flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              style={{ boxShadow: "0 0 24px rgba(239,68,68,0.3)" }}
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </motion.button>
            <span className="text-[#94A3B8] text-sm">End</span>
          </motion.div>

          <motion.div className="flex flex-col items-center gap-1.5">
            <motion.button
              onClick={() => setIsSpeakerOn((s) => !s)}
              aria-label={isSpeakerOn ? "Switch to earpiece" : "Switch to speaker"}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors ${
                isSpeakerOn
                  ? "bg-[#06B6D4]/10 border-[#06B6D4]/60 text-[#06B6D4]"
                  : "bg-[#1E293B] border-[#334155] text-[#94A3B8]"
              }`}
              whileTap={{ scale: 0.9 }}
            >
              {isSpeakerOn ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </motion.button>
            <span className="text-[#94A3B8] text-xs">Speaker</span>
          </motion.div>

          <motion.div className="flex flex-col items-center gap-1.5">
            <motion.button
              onClick={() => setShowPanel((s) => !s)}
              aria-label="Toggle analysis panel"
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors ${
                showPanel
                  ? "bg-[#06B6D4]/10 border-[#06B6D4]/60 text-[#06B6D4]"
                  : "bg-[#1E293B] border-[#334155] text-[#94A3B8]"
              }`}
              whileTap={{ scale: 0.9 }}
            >
              <Activity className="w-5 h-5" />
            </motion.button>
            <span className="text-[#94A3B8] text-xs">Analysis</span>
          </motion.div>
        </div>

        {/* Detection summary panel */}
        <AnimatePresence>
          {showPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-4"
            >
              <div className="bg-[#1E293B]/60 border border-[#334155]/60 rounded-2xl p-4 space-y-2">
                <p className="text-[#94A3B8] text-xs font-medium uppercase tracking-wide mb-3">
                  Live Detection Summary
                </p>
                {participants.map((p) => {
                  const det = DETECTION_CONFIG[p.detection];
                  return (
                    <div key={p.id} className="flex items-center gap-3">
                      <span className="text-[#F8FAFC] text-sm w-28 truncate">
                        {p.name}
                      </span>
                      <div className="flex-1 h-1.5 bg-[#0F172A] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            width: `${p.confidence || 10}%`,
                            background:
                              p.detection === "genuine"
                                ? "#22C55E"
                                : p.detection === "suspicious"
                                ? "#F59E0B"
                                : p.detection === "synthetic"
                                ? "#EF4444"
                                : "#06B6D4",
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${p.confidence || 10}%` }}
                          transition={{ duration: 0.6 }}
                        />
                      </div>
                      <span className={`text-xs font-medium w-16 text-right ${det.color}`}>
                        {p.confidence > 0 ? `${p.confidence}%` : "..."}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GroupCallPage;