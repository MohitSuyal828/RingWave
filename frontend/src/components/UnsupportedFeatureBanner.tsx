import { Info } from "lucide-react";

interface UnsupportedFeatureBannerProps {
  message?: string;
}

/**
 * Visual + code marker that a page's data/actions are NOT backed by the
 * current RingWave backend (no matching table/route exists). Used on pages
 * left intentionally on mock data per the integration scope: Contacts,
 * Notifications, OTP, Forgot Password, Reset Password.
 */
const UnsupportedFeatureBanner = ({
  message = "This feature isn't implemented by the current backend yet — the data shown below is sample/mock data.",
}: UnsupportedFeatureBannerProps) => (
  <div className="flex items-start gap-3 px-4 py-3 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl">
    <Info className="w-4 h-4 text-[#F59E0B] mt-0.5 shrink-0" />
    <p className="text-[#F59E0B] text-sm">{message}</p>
  </div>
);

export default UnsupportedFeatureBanner;
