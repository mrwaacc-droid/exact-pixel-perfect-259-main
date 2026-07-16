import { PenTool } from "lucide-react";

interface LearningWhiteboardPreviewProps {
  title?: string;
  content?: string;
  step?: string;
  className?: string;
}

export function LearningWhiteboardPreview({
  title = "Current Goal",
  content = "Carbon has 4 valence electrons in its outer shell.",
  step = "Step 2 of 5",
  className = "",
}: LearningWhiteboardPreviewProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Whiteboard surface */}
      <div className="bg-white rounded-[1.5rem] border border-border shadow-[0_24px_60px_rgba(34,27,28,0.08)] overflow-hidden">
        {/* Board header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <PenTool size={14} className="text-crimson" />
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Live Board</span>
          </div>
          <span className="text-[11px] font-bold text-crimson">{step}</span>
        </div>

        {/* Paper texture */}
        <div className="relative p-6 min-h-[200px] notebook-pattern">
          {/* Goal */}
          <div className="mb-4">
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">{title}</p>
            <p className="text-sm font-semibold text-heading">{content}</p>
          </div>

          {/* Handwritten content */}
          <div className="font-[Patrick_Hand,cursive] text-2xl text-ink leading-relaxed">
            C → 2, 4
          </div>

          {/* Annotation arrow */}
          <svg className="absolute right-8 top-16 w-20 h-20 text-crimson" viewBox="0 0 80 80" fill="none">
            <path d="M60 10 C40 20, 30 40, 20 60" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="20" cy="60" r="4" fill="currentColor" />
          </svg>

          {/* Sticky note */}
          <div className="absolute bottom-4 right-4 bg-amber-100 border border-amber-200 rounded-lg p-3 shadow-sm rotate-2">
            <p className="text-[11px] font-bold text-amber-800">Remember:</p>
            <p className="text-[10px] text-amber-700">Outer shell = bonding electrons</p>
          </div>
        </div>
      </div>

      {/* Writing indicator */}
      <div className="absolute -bottom-2 left-6 bg-crimson text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
        Writing now
      </div>
    </div>
  );
}
