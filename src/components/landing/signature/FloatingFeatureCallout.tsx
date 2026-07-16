import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingFeatureCalloutProps {
  icon: LucideIcon;
  label: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  color?: "crimson" | "brown" | "green" | "amber";
  className?: string;
}

const colorMap = {
  crimson: "bg-[#7D2233] text-white",
  brown: "bg-[#A0522D] text-white",
  green: "bg-[#2F7D5A] text-white",
  amber: "bg-[#C97922] text-white",
};

export function FloatingFeatureCallout({
  icon: Icon,
  label,
  color = "crimson",
  className = "",
}: FloatingFeatureCalloutProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg border border-white/20 backdrop-blur-sm",
        colorMap[color],
        className,
      )}
    >
      <Icon size={14} />
      <span className="text-xs font-bold">{label}</span>
    </div>
  );
}