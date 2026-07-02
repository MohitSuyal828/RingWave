import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell, Shield, Volume2, Moon, Smartphone,
  ChevronRight,
} from "lucide-react";
import UnsupportedFeatureBanner from "@/components/UnsupportedFeatureBanner";

// NOTE: The backend has no settings/preferences storage — these toggles
// are local-only UI state and are not persisted. Logout (in Sidebar/Topbar)
// is the only part of account settings backed by a real endpoint.

const SETTINGS_GROUPS = [
  {
    title: "Notifications",
    icon: Bell,
    items: [
      { label: "Incoming call alerts", desc: "Notify on incoming calls", key: "callAlerts", value: true },
      { label: "Detection alerts", desc: "Alert when suspicious voice detected", key: "detectionAlerts", value: true },
      { label: "Contact requests", desc: "Notify on new contact requests", key: "contactAlerts", value: false },
    ],
  },
  {
    title: "Security",
    icon: Shield,
    items: [
      { label: "AI deepfake detection", desc: "Analyze all calls in real time", key: "aiDetection", value: true },
      { label: "Auto-block synthetic callers", desc: "Block flagged numbers automatically", key: "autoBlock", value: false },
      { label: "Two-factor authentication", desc: "Extra login security", key: "twoFactor", value: true },
    ],
  },
  {
    title: "Audio",
    icon: Volume2,
    items: [
      { label: "Noise cancellation", desc: "Filter background noise", key: "noiseCancellation", value: true },
      { label: "Echo reduction", desc: "Reduce echo during calls", key: "echoReduction", value: true },
    ],
  },
  {
    title: "Appearance",
    icon: Moon,
    items: [
      { label: "Dark mode", desc: "Always use dark theme", key: "darkMode", value: true },
      { label: "Compact view", desc: "Reduce spacing in lists", key: "compactView", value: false },
    ],
  },
];

const SettingsPage = () => {
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    SETTINGS_GROUPS.forEach((g) =>
      g.items.forEach((item) => { init[item.key] = item.value; })
    );
    return init;
  });

  const flip = (key: string) =>
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <UnsupportedFeatureBanner message="These preferences are local-only for now — the backend has no settings storage yet, so changes won't persist." />

      <div>
        <h2 className="text-2xl font-bold text-[#F8FAFC]">Settings</h2>
        <p className="text-[#94A3B8] text-sm mt-1">
          Manage your preferences and security
        </p>
      </div>

      {SETTINGS_GROUPS.map((group, gi) => (
        <motion.div
          key={group.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: gi * 0.08 }}
          className="bg-[#1E293B]/60 backdrop-blur border border-[#334155]/60 rounded-2xl overflow-hidden"
        >
          {/* Group header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#334155]/60">
            <div className="w-8 h-8 rounded-lg bg-[#06B6D4]/10 border border-[#06B6D4]/20 flex items-center justify-center">
              <group.icon className="w-4 h-4 text-[#06B6D4]" />
            </div>
            <h3 className="text-[#F8FAFC] font-semibold">{group.title}</h3>
          </div>

          {/* Items */}
          <div className="divide-y divide-[#334155]/30">
            {group.items.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between px-5 py-4 hover:bg-[#334155]/20 transition-colors"
              >
                <div>
                  <p className="text-[#F8FAFC] text-sm font-medium">
                    {item.label}
                  </p>
                  <p className="text-[#94A3B8] text-xs mt-0.5">{item.desc}</p>
                </div>

                {/* Toggle */}
                <button
                  onClick={() => flip(item.key)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
                    toggles[item.key] ? "bg-[#06B6D4]" : "bg-[#334155]"
                  }`}
                >
                  <motion.div
                    className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow"
                    animate={{ x: toggles[item.key] ? 20 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SettingsPage;