import { Bot, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClassroomModeCardProps {
  mode: "ai" | "live" | "hybrid";
  title?: string;
  description?: string;
  active?: boolean;
  className?: string;
}

const modeConfig = {
  ai: { icon: Bot, label: "AI Teacher", desc: "AI delivers the lesson autonomously", color: "bg-[#7B1E2B]" },
  live: { icon: User, label: "Human Live", desc: "Real teacher leads in real-time", color: "bg-[#2E7D32]" },
  hybrid: { icon: Users, label: "Hybrid", desc: "AI assists a live human teacher", color: "bg-[#A0522D]" },
};

export function ClassroomModeCard({ mode, title, description, active = false, className = "" }: ClassroomModeCardProps) {
  const config = modeConfig[mode];
  const Icon = config.icon;
  return (
    <div className={cn("relative p-5 rounded-xl border transition-all duration-200", active ? "border-[#7B1E2B] bg-[#F7E7EA] shadow-md" : "border-[#DDD5D0] bg-white hover:shadow-sm", className)}>
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", config.color)}>
        <Icon size={18} className="text-white" />
      </div>
      <p className="text-[15px] font-semibold text-[#231F20] mb-1">{title || config.label}</p>
      <p className="text-[13px] text-[#7A7470] leading-relaxed">{description || config.desc}</p>
      {active && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#7B1E2B]" />}
    </div>
  );
}
