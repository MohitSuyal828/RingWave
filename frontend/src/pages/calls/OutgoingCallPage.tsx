import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PhoneOff, Wifi } from "lucide-react";
import { ROUTES } from "@/constants/routes";

const CALLING_STATES = [
  "Connecting...",
  "Ringing...",
  "Waiting for answer...",
];

const OutgoingCallPage = () => {
  const navigate = useNavigate();
  const [stateIndex, setStateIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // Cycle through calling states
  useEffect(() => {
    const interval = setInterval(() => {
      setStateIndex((i) => (i < CALLING_STATES.length - 1 ? i + 1 : i));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Elapsed seconds
  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto connect after 7s (demo)
  useEffect(() => {
    if (elapsed >= 7) {
      navigate(ROUTES.ACTIVE_CALL.replace(":callId", "demo-call-002"));
    }
  }, [elapsed, navigate]);

  const handleCancel = () => navigate(ROUTES.DASHBOARD);

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center relative overflow-hidden">

      {/* Ambient rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-[#06B6D4]/10"
            style={{ width: i * 140, height: i * 140 }}
            animate={{ scale: [1, 1.06, 1], opacity: [0.15, 0.4, 0.15] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: i * 0.35,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="absolute w-[350px] h-[350px] rounded-full bg-[#06B6D4]/5 blur-[80px] pointer-events-none" />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-10"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Avatar */}
        <div className="relative">
          {[1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border border-[#06B6D4]/20"
              animate={{ scale: [1, 1.5 + i * 0.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
            />
          ))}
          <div className="w-28 h-28 rounded-full bg-[#1E293B] border-2 border-[#334155] flex items-center justify-center">
            <span className="text-[#F8FAFC] text-4xl font-bold">SP</span>
          </div>
        </div>

        {/* Info */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#F8FAFC]">Sneha Patel</h1>
          <p className="text-[#94A3B8] text-base mt-1">@sneha_p</p>

          {/* Animated state */}
          <motion.p
            key={stateIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#06B6D4] text-sm font-medium mt-4"
          >
            {CALLING_STATES[stateIndex]}
          </motion.p>

          {/* Dot pulse */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]"
                animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </div>

        {/* Waveform */}
        <div className="flex items-end gap-[3px] h-8">
          {[3, 6, 9, 6, 12, 8, 16, 8, 12, 6, 9, 6, 3].map((h, i) => (
            <motion.div
              key={i}
              className="w-[3px] bg-[#06B6D4]/50 rounded-full"
              style={{ height: h }}
              animate={{ scaleY: [1, 1.5, 0.7, 1.2, 1] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Cancel */}
        <motion.div className="flex flex-col items-center gap-3 mt-4">
          <motion.button
            onClick={handleCancel}
            className="w-16 h-16 rounded-full bg-[#EF4444] flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            style={{ boxShadow: "0 0 28px rgba(239,68,68,0.3)" }}
          >
            <PhoneOff className="w-7 h-7 text-white" />
          </motion.button>
          <span className="text-[#94A3B8] text-sm">Cancel</span>
        </motion.div>
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

export default OutgoingCallPage;