import { PenTool } from "lucide-react";
import { cn } from "@/lib/utils";

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
<div className={cn("relative", className)}>
    <div
        className="bg-[#fffdf8] rounded-[24px_24px_24px_48px] border border-[#E7DAD1] shadow-[0_24px_60px_rgba(34,27,28,0.08)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E7DAD1]">
            <div className="flex items-center gap-2">
                <PenTool size={14} className="text-[#A0522D]" />
                <span className="text-[11px] font-bold text-[#8A7478] uppercase tracking-wider">
                    Live Board
                </span>
            </div>
            <span className="text-[11px] font-bold text-[#B22234]">{step}</span>
        </div>
        <div className="relative p-6 min-h-[200px] paper-texture">
            <div className="mb-4">
                <p className="text-[10px] font-bold text-[#8A7478] uppercase tracking-wider mb-1">
                    {title}
                </p>
                <p className="text-sm font-semibold text-[#221B1C]">{content}</p>
            </div>
            <div className="font-[Patrick_Hand,cursive] text-2xl text-[#221B1C] leading-relaxed">
                C -> 2, 4
            </div>
            <svg className="absolute right-8 top-16 w-20 h-20 text-[#A0522D]" viewBox="0 0 80 80" fill="none">
                <path d="M60 10 C40 20, 30 40, 20 60" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                <circle cx="20" cy="60" r="4" fill="currentColor" />
            </svg>
            <div
                className="absolute bottom-4 right-4 bg-[#F4ECE4] border border-[#D9C6B2] rounded-lg p-3 shadow-sm rotate-2">
                <p className="text-[11px] font-bold text-[#A0522D]">Remember:</p>
                <p className="text-[10px] text-[#6F5C60]">Outer shell = bonding electrons</p>
            </div>
        </div>
    </div>
    <div
        className="absolute -bottom-2 left-6 bg-[#B22234] text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
        Writing now
    </div>
</div>
);
}