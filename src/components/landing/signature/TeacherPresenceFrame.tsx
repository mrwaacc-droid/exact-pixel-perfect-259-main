import { Mic, Volume2 } from "lucide-react";

interface TeacherPresenceFrameProps {
  name?: string;
  subject?: string;
  state?: string;
  caption?: string;
  className?: string;
}

export function TeacherPresenceFrame({
  name = "Dr. Arthur",
  subject = "Form 3 Chemistry",
  state = "Explaining covalent bonds",
  caption,
  className = "",
}: TeacherPresenceFrameProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Teacher portrait container */}
      <div className="relative overflow-hidden rounded-[1.5rem] bg-crimson shadow-[0_32px_80px_rgba(34,27,28,0.25)]">
        {/* Teacher image placeholder */}
        <div className="aspect-[4/3] bg-gradient-to-br from-[#2C2224] to-[#231F20] flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#7B1E2B] to-violet-500 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">AI</span>
          </div>
        </div>

        {/* AI Teacher label */}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold text-white uppercase tracking-wider">AI Teacher</span>
        </div>

        {/* Teacher info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-crimson flex items-center justify-center">
              <Mic size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{name}</p>
              <p className="text-[11px] text-white/70">{subject}</p>
            </div>
          </div>
        </div>

        {/* Speaking waveform */}
        <div className="absolute bottom-20 left-5 right-5">
          <div className="flex items-end gap-1 h-8">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-crimson/60 rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Caption ribbon below */}
      {caption && (
        <div className="mt-3 bg-white rounded-xl p-4 flex items-center gap-3">
          <Volume2 size={16} className="text-crimson shrink-0" />
          <p className="text-sm text-white/90 font-medium">{caption}</p>
        </div>
      )}

      {/* State badge */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg border border-border">
        <p className="text-xs font-semibold text-heading">{state}</p>
      </div>
    </div>
  );
}
