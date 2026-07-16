import { Volume2, Captions } from "lucide-react";

interface CaptionRibbonProps {
  speaker?: string;
  text?: string;
  isLive?: boolean;
  className?: string;
}

export function CaptionRibbon({
  speaker = "Dr. Arthur",
  text = "The green chlorophyll inside the leaf absorbs light energy to convert carbon dioxide and water into glucose.",
  isLive = true,
  className = "",
}: CaptionRibbonProps) {
  return (
    <div className={`bg-white rounded-xl overflow-hidden ${className}`}>
      <div className="px-5 py-4 flex items-start gap-4">
        {/* Speaker indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-full bg-crimson/20 flex items-center justify-center">
            <Volume2 size={14} className="text-crimson" />
          </div>
          {isLive && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Live</span>
            </div>
          )}
        </div>

        {/* Caption content */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1">
            {speaker}
          </p>
          <p className="text-[15px] leading-relaxed text-white font-medium">
            {text}
          </p>
        </div>

        {/* Caption icon */}
        <Captions size={18} className="text-white/30 shrink-0 mt-1" />
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/10">
        <div className="h-full bg-crimson rounded-full" style={{ width: "68%" }} />
      </div>
    </div>
  );
}
