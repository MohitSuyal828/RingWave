import { motion } from "framer-motion";
import { Bell, Phone, ShieldAlert, UserPlus, Check } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import UnsupportedFeatureBanner from "@/components/UnsupportedFeatureBanner";

// NOTE: The backend has no notifications table/routes. This page is
// real-time/socket-only by design and intentionally stays on mock data
// for the REST integration — see integration audit.

const NOTIFICATIONS = [
  { id: "1", type: "detection_alert", title: "Synthetic voice detected", message: "Call with Unknown Caller was flagged as AI-generated speech.", time: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), read: false },
  { id: "2", type: "call_missed", title: "Missed call", message: "You missed a call from Kavya Nair.", time: new Date(Date.now() - 1000 * 60 * 30).toISOString(), read: false },
  { id: "3", type: "contact_request", title: "New contact request", message: "Vikram Singh wants to connect with you on RingWave.", time: new Date(Date.now() - 1000 * 60 * 20).toISOString(), read: false },
  { id: "4", type: "call_incoming", title: "Call ended", message: "Your call with Arjun Mehta lasted 5 minutes 12 seconds.", time: new Date(Date.now() - 1000 * 60 * 12).toISOString(), read: true },
  { id: "5", type: "detection_alert", title: "Suspicious pattern", message: "Call with Priya Sharma showed voice inconsistencies.", time: new Date(Date.now() - 1000 * 60 * 45).toISOString(), read: true },
];

const ICON_MAP: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  detection_alert: { icon: ShieldAlert, color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
  call_missed: { icon: Phone, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
  contact_request: { icon: UserPlus, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10" },
  call_incoming: { icon: Phone, color: "text-[#22C55E]", bg: "bg-[#22C55E]/10" },
};

const NotificationsPage = () => {
  const unread = NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <UnsupportedFeatureBanner message="Notifications aren't backed by a REST endpoint yet (no notifications table/routes) — showing sample data." />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#F8FAFC]">Notifications</h2>
          <p className="text-[#94A3B8] text-sm mt-1">
            {unread} unread notification{unread !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="flex items-center gap-2 text-sm text-[#06B6D4] hover:text-[#06B6D4]/80 transition-colors">
          <Check className="w-4 h-4" />
          Mark all read
        </button>
      </div>

      <div className="space-y-2">
        {NOTIFICATIONS.map((n, i) => {
          const config = ICON_MAP[n.type];
          const Icon = config.icon;
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`flex items-start gap-4 p-4 rounded-2xl border transition-colors cursor-pointer
                ${!n.read
                  ? "bg-[#1E293B]/80 border-[#334155]/80"
                  : "bg-[#1E293B]/30 border-[#334155]/30"
                } hover:border-[#334155]`}
            >
              <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium ${!n.read ? "text-[#F8FAFC]" : "text-[#94A3B8]"}`}>
                    {n.title}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-[#06B6D4]" />
                    )}
                    <span className="text-[#94A3B8] text-xs">
                      {formatRelativeTime(n.time)}
                    </span>
                  </div>
                </div>
                <p className="text-[#94A3B8] text-xs mt-1 leading-relaxed">
                  {n.message}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationsPage;