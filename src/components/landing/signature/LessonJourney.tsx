import { BookOpen, Sparkles, GraduationCap, FileText, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: BookOpen,
    label: "Materials",
    description: "Upload course content",
    color: "bg-[#A0522D]",
  },
  {
    icon: Sparkles,
    label: "Structure",
    description: "Generate lesson plan",
    color: "bg-[#7B1E2B]",
  },
  {
    icon: GraduationCap,
    label: "Teaching",
    description: "AI delivers the lesson",
    color: "bg-[#2E7D32]",
  },
  {
    icon: FileText,
    label: "Evidence",
    description: "Progress and transcripts",
    color: "bg-[#D97706]",
  },
];

interface LessonJourneyProps {
  className?: string;
}

export function LessonJourney({ className = "" }: LessonJourneyProps) {
  return (
    <div className={cn("flex items-center gap-3 lg:gap-4", className)}>
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <div key={step.label} className="flex items-center gap-3 lg:gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg", step.color)}>
                <Icon size={20} className="text-white" />
              </div>
              <div className="text-center">
                <p className="text-[11px] font-bold text-[#231F20]">{step.label}</p>
                <p className="text-[10px] text-[#7A7470]">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <ArrowRight size={16} className="text-[#D4C5B8] shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}