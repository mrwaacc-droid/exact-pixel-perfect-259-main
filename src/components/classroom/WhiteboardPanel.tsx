import { PencilRuler } from "lucide-react";

interface WhiteboardPanelProps {
  title: string;
  content: string[];
  highlight?: string;
  step?: string;
}

export function WhiteboardPanel({ title, content, highlight, step }: WhiteboardPanelProps) {
  return (
    <div className="card h-full flex flex-col overflow-hidden">
      <div className="flex h-10 items-center justify-between border-b border-gray-100 px-4 text-xs font-medium text-gray-500">
        <span className="flex items-center gap-2">
          <PencilRuler size={14} className="text-[#7D2233]" />
          Whiteboard
        </span>
        <span className="text-[10px] uppercase tracking-wide">{step || "Lesson"}</span>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-white relative">
        {/* Dot/grid background pattern */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, #e5e7eb 1px, transparent 1px),
              linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">{title}</h2>

          <div className="space-y-2 font-mono text-sm sm:text-base text-gray-700">
            {content.map((line, index) => {
              const isHighlight = highlight && line.includes(highlight);
              const isEmpty = !line.trim();

              return (
                <div
                  key={index}
                  className={`rounded-md px-3 py-2 transition-colors ${
                    isHighlight
                      ? "bg-[#F7E7EA] text-[#521326] font-semibold border-l-4 border-[#7D2233]"
                      : isEmpty
                        ? "text-gray-300"
                        : "text-gray-700"
                  }`}
                  style={{ fontFamily: "'Georgia', serif", fontStyle: "italic" }}
                >
                  {line || "\u00A0"}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
