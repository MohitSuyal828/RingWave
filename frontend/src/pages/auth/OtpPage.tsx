import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Shield, Wifi, MailCheck, ArrowLeft } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import UnsupportedFeatureBanner from "@/components/UnsupportedFeatureBanner";

// NOTE: The backend has no OTP/email-verification endpoints. This page is
// intentionally unreachable from the real registration flow (Register now
// navigates straight to Login) and stays on mock behavior if visited
// directly — see integration audit.

const OTP_LENGTH = 6;

const OtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email ?? "your email";

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Auto focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const updateOtp = (index: number, value: string) => {
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    setServerError(null);
  };

  const handleChange = (index: number, value: string) => {
    // Only allow single digit
    const digit = value.replace(/\D/g, "").slice(-1);
    updateOtp(index, digit);

    // Move to next input
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        updateOtp(index, "");
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        updateOtp(index - 1, "");
      }
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    const updated = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((char, i) => {
      updated[i] = char;
    });
    setOtp(updated);

    // Focus the next empty or last input
    const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const isComplete = otp.every((d) => d !== "");

  const handleVerify = async () => {
    if (!isComplete) return;
    setIsLoading(true);
    setServerError(null);
    try {
      const code = otp.join("");
      // TODO: Replace with real API call
      // await axiosInstance.post("/auth/verify-otp", { email, otp: code });
      console.log("OTP submitted:", code, "for", email);
      await new Promise((r) => setTimeout(r, 1500));
      navigate(ROUTES.LOGIN);
    } catch {
      setServerError("Invalid or expired code. Please try again.");
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setIsResending(true);
    setServerError(null);
    setSuccessMessage(null);
    try {
      // TODO: Replace with real API call
      // await axiosInstance.post("/auth/resend-otp", { email });
      await new Promise((r) => setTimeout(r, 1000));
      setSuccessMessage("A new code has been sent to your email.");
      setCountdown(60);
      setCanResend(false);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch {
      setServerError("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#06B6D4]/5 blur-[100px] pointer-events-none" />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#06B6D4 1px, transparent 1px), linear-gradient(90deg, #06B6D4 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Back button */}
        <motion.button
          onClick={() => navigate(ROUTES.REGISTER)}
          className="flex items-center gap-2 text-[#94A3B8] hover:text-[#F8FAFC] transition-colors mb-8 group"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Back to register</span>
        </motion.button>

        <div className="mb-6">
          <UnsupportedFeatureBanner message="Email/OTP verification isn't implemented by the current backend — this screen is non-functional until that endpoint exists." />
        </div>

        {/* Header */}
        <motion.div
          className="flex flex-col items-center mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {/* Animated mail icon */}
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-2xl bg-[#06B6D4]/10 border border-[#06B6D4]/30 flex items-center justify-center">
              <MailCheck className="w-8 h-8 text-[#06B6D4]" />
            </div>
            {/* Ping ring */}
            <motion.div
              className="absolute inset-0 rounded-2xl border border-[#06B6D4]/30"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
            />
          </div>

          <h1 className="text-2xl font-bold text-[#F8FAFC]">
            Verify your email
          </h1>
          <p className="text-[#94A3B8] text-sm mt-2 text-center max-w-xs leading-relaxed">
            We sent a 6-digit verification code to{" "}
            <span className="text-[#06B6D4] font-medium">{email}</span>
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          className="bg-[#1E293B]/60 backdrop-blur-xl border border-[#334155]/60 rounded-2xl p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Server error */}
          {serverError && (
            <motion.div
              className="mb-5 px-4 py-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl flex items-start gap-3"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Shield className="w-4 h-4 text-[#EF4444] mt-0.5 shrink-0" />
              <p className="text-[#EF4444] text-sm">{serverError}</p>
            </motion.div>
          )}

          {/* Success message */}
          {successMessage && (
            <motion.div
              className="mb-5 px-4 py-3 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-xl flex items-start gap-3"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Wifi className="w-4 h-4 text-[#22C55E] mt-0.5 shrink-0" />
              <p className="text-[#22C55E] text-sm">{successMessage}</p>
            </motion.div>
          )}

          {/* OTP inputs */}
          <div className="flex items-center justify-center gap-3 mb-6">
            {otp.map((digit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + index * 0.05 }}
              >
                <input
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`
                    w-11 h-14 text-center text-xl font-bold rounded-xl border outline-none
                    transition-all duration-200 bg-[#0F172A] text-[#F8FAFC]
                    caret-[#06B6D4]
                    ${digit
                      ? "border-[#06B6D4] bg-[#06B6D4]/5 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                      : "border-[#334155] focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4]/30"
                    }
                    ${serverError ? "border-[#EF4444]/60 shake" : ""}
                  `}
                />
              </motion.div>
            ))}
          </div>

          {/* Separator dots between groups of 3 */}
          <div className="flex justify-center mb-2">
            <div className="flex items-center gap-1">
              {Array(OTP_LENGTH).fill(0).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-1 rounded-full transition-colors duration-200 ${
                    otp[i] ? "bg-[#06B6D4]" : "bg-[#334155]"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Verify button */}
          <motion.button
            onClick={handleVerify}
            disabled={!isComplete || isLoading}
            className="w-full mt-4 bg-[#06B6D4] hover:bg-[#06B6D4]/90 disabled:bg-[#06B6D4]/30 disabled:cursor-not-allowed text-[#020617] font-semibold py-3 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2"
            whileTap={{ scale: isComplete ? 0.98 : 1 }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify email"
            )}
          </motion.button>

          {/* Resend */}
          <div className="flex items-center justify-center gap-1.5 mt-5">
            <p className="text-sm text-[#94A3B8]">Didn't receive a code?</p>
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="text-sm text-[#06B6D4] font-medium hover:text-[#06B6D4]/80 transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Resend code"
                )}
              </button>
            ) : (
              <span className="text-sm text-[#334155] font-medium tabular-nums">
                Resend in {countdown}s
              </span>
            )}
          </div>
        </motion.div>

        {/* Security note */}
        <motion.div
          className="flex items-center justify-center gap-2 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Shield className="w-3.5 h-3.5 text-[#94A3B8]" />
          <p className="text-[#94A3B8] text-xs">
            Code expires in 10 minutes
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OtpPage;