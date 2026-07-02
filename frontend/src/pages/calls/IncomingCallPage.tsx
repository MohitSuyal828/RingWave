import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, PhoneOff, Volume2, VolumeX,
  Shield, ShieldAlert, Wifi,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import {
  DETECTION_CONFIG,
  type DetectionState,
} from "@/constants/detection";

const IncomingCallPage = () => {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [detectionState, setDetectionState] =
    useState<DetectionState>("analyzing");

  // Simulate detection result after 4s
  useEffect(() => {
    const timer = setTimeout(() => setDetectionState("genuine"), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    navigate(ROUTES.ACTIVE_CALL.replace(":callId", "demo-call-001"));
  };

  const handleReject = () => {
    navigate(ROUTES.DASHBOARD);
  };

  const detection = DETECTION_CONFIG[detectionState];
  const DetectionIcon = detection.icon;

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center relative overflow-hidden">

      {/* Background rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-[#22C55E]/10"
            style={{ width: i * 160, height: i * 160 }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Glow */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-[#22C55E]/5 blur-[100px] pointer-events-none" />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Caller info */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[#22C55E]/40"
              animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[#22C55E]/20"
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            />
            <div className="relative w-28 h-28 rounded-full bg-[#1E293B] border-2 border-[#334155] flex items-center justify-center">
              <span className="text-[#F8FAFC] text-4xl font-bold">AM</span>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#F8FAFC]">Arjun Mehta</h1>
            <p className="text-[#94A3B8] text-base mt-1">@arjun_m · RingWave</p>
            <motion.div
              className="flex items-center gap-2 justify-center mt-3"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
              <span className="text-[#22C55E] text-sm font-medium">
                Incoming call...
              </span>
            </motion.div>
          </div>
        </div>

        {/* Detection badge */}
        <AnimatePresence mode="wait">
          <motion.div
            key={detectionState}
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full border ${detection.bg} ${detection.border}`}
          >
            {detectionState === "analyzing" ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              >
                <DetectionIcon className={`w-4 h-4 ${detection.color}`} />
              </motion.div>
            ) : (
              <DetectionIcon className={`w-4 h-4 ${detection.color}`} />
            )}
            <span className={`text-sm font-medium ${detection.color}`}>
              {detection.label}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Waveform */}
        <div className="flex items-end gap-[3px] h-10">
          {[4, 8, 12, 16, 20, 16, 24, 16, 20, 16, 12, 8, 4].map((h, i) => (
            <motion.div
              key={i}
              className="w-[3px] bg-[#06B6D4]/60 rounded-full"
              style={{ height: h }}
              animate={{ scaleY: [1, 1.6, 0.7, 1.3, 1] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                delay: i * 0.07,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-16 mt-4">
          {/* Reject */}
          <motion.div className="flex flex-col items-center gap-3">
            <motion.button
              onClick={handleReject}
              aria-label="Decline call"
              className="w-16 h-16 rounded-full bg-[#EF4444] flex items-center justify-center shadow-lg"
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.05 }}
              style={{ boxShadow: "0 0 24px rgba(239,68,68,0.35)" }}
            >
              <PhoneOff className="w-7 h-7 text-white" />
            </motion.button>
            <span className="text-[#94A3B8] text-sm">Decline</span>
          </motion.div>

          {/* Mute toggle */}
          <motion.div className="flex flex-col items-center gap-3">
            <motion.button
              onClick={() => setIsMuted((m) => !m)}
              aria-label={isMuted ? "Unmute" : "Mute"}
              className={`w-12 h-12 rounded-full border flex items-center justify-center transition-colors ${
                isMuted
                  ? "bg-[#F59E0B]/10 border-[#F59E0B]/40 text-[#F59E0B]"
                  : "bg-[#1E293B] border-[#334155] text-[#94A3B8]"
              }`}
              whileTap={{ scale: 0.92 }}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </motion.button>
            <span className="text-[#94A3B8] text-xs">
              {isMuted ? "Unmute" : "Mute"}
            </span>
          </motion.div>

          {/* Accept */}
          <motion.div className="flex flex-col items-center gap-3">
            <motion.button
              onClick={handleAccept}
              aria-label="Accept call"
              className="w-16 h-16 rounded-full bg-[#22C55E] flex items-center justify-center shadow-lg"
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.05 }}
              style={{ boxShadow: "0 0 24px rgba(34,197,94,0.35)" }}
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <Phone className="w-7 h-7 text-white" />
            </motion.button>
            <span className="text-[#94A3B8] text-sm">Accept</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Top bar */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#06B6D4]/10 border border-[#06B6D4]/30 flex items-center justify-center">
          <Wifi className="w-4 h-4 text-[#06B6D4]" />
        </div>
        <span className="text-[#F8FAFC] font-bold text-lg">
          Ring<span className="text-[#06B6D4]">Wave</span>
        </span>
      </div>
    </div>
  );
};

export default IncomingCallPage;