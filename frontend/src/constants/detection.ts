import {
  Wifi, Shield, ShieldAlert, ShieldX,
} from "lucide-react";

export type DetectionState =
  | "analyzing"
  | "genuine"
  | "suspicious"
  | "synthetic";

export interface DetectionConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ElementType;
}

export const DETECTION_CONFIG: Record<DetectionState, DetectionConfig> = {
  analyzing: {
    label: "Analyzing voice...",
    color: "text-[#06B6D4]",
    bg: "bg-[#06B6D4]/10",
    border: "border-[#06B6D4]/30",
    icon: Wifi,
  },
  genuine: {
    label: "Voice Genuine",
    color: "text-[#22C55E]",
    bg: "bg-[#22C55E]/10",
    border: "border-[#22C55E]/30",
    icon: Shield,
  },
  suspicious: {
    label: "Suspicious Pattern",
    color: "text-[#F59E0B]",
    bg: "bg-[#F59E0B]/10",
    border: "border-[#F59E0B]/30",
    icon: ShieldAlert,
  },
  synthetic: {
    label: "⚠ Synthetic Voice",
    color: "text-[#EF4444]",
    bg: "bg-[#EF4444]/10",
    border: "border-[#EF4444]/30",
    icon: ShieldX,
  },
};