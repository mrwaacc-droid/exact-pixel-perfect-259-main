import { cn } from "@/lib/utils";

interface TeachingMomentCardProps {
  teacherAction?: string;
  boardAction?: string;
  learnerResponse?: string;
  nextDecision?: string;
  className?: string;
}

export function TeachingMomentCard({ teacherAction = "Explaining concept", boardAction = "Writing equation", learnerResponse = "Asked clarifying question", nextDecision = "Replay example", className = "" }: TeachingMomentCardProps) {
  const steps = [
    { label: "Teacher", value: teacherAction, color: "text-[#7D2233]" },
    { label: "Board", value: boardAction, color: "text-[#A0522D]" },
    { label: "Learner", value: learnerResponse, color: "text-[#2F7D5A]" },
    { label: "Next", value: nextDecision, color: "text-[#C97922]" },
  ];
  return (
    <div className={cn("bg-white rounded-xl border border-[#E7DAD1] p-5 shadow-sm", className)}>
      {steps.map((step, i) => (
        <div key={i} className={cn(i < steps.length - 1 && "border-b border-[#F2E8E1] pb-3 mb-3")}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A7478] mb-1">{step.label}</p>
          <p className={cn("text-[14px] font-medium", step.color)}>{step.value}</p>
        </div>
      ))}
    </div>
  );
}
