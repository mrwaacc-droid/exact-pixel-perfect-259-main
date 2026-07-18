import { cn } from "@/lib/utils";

interface LearningEvidenceTileProps {
  question?: string;
  explanation?: string;
  example?: string;
  completed?: string;
  className?: string;
}

export function LearningEvidenceTile({ question = "Why does carbon form 4 bonds?", explanation = "Adapted to use real-world analogy", example = "Replayed with visual diagram", completed = "Concept mastered", className = "" }: LearningEvidenceTileProps) {
  const items = [
    { label: "Question asked", value: question, icon: "?" },
    { label: "Explanation adapted", value: explanation, icon: "~" },
    { label: "Example replayed", value: example, icon: "=" },
    { label: "Concept completed", value: completed, icon: "v" },
  ];
  return (
    <div className={cn("bg-[#F5F2F0] rounded-xl border border-[#DDD5D0] p-4", className)}>
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-[#7B1E2B] text-white flex items-center justify-center text-[12px] font-bold shrink-0">{item.icon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A7470]">{item.label}</p>
            <p className="text-[13px] text-[#2C2224] font-medium">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
