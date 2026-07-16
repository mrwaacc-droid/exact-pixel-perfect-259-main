import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

type Step = {
  title: string;
  description: string;
  icon?: ReactNode;
};

type Props = {
  steps: Step[];
  className?: string;
};

export function ProcessJourney({ steps, className }: Props) {
  return (
    <Reveal className={cn("w-full overflow-x-auto pb-4", className)}>
      <div className="relative flex items-start gap-0 min-w-max px-4">
        {steps.map((step, i) => (
          <div key={i} className="relative flex flex-col items-center text-center" style={{ minWidth: 200 }}>
            {/* Step circle */}
            <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 border-crimson-dark bg-white text-crimson-dark shadow-sm">
              {step.icon ?? (
                <span className="text-lg font-bold">{i + 1}</span>
              )}
            </div>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className="absolute left-[calc(50%+28px)] top-7 z-0 h-px w-[calc(100%-56px)] border-t border-dashed border-crimson-dark/30" />
            )}

            {/* Text */}
            <div className="mt-4 max-w-[180px] px-2">
              <h4 className="font-headings text-[15px] font-bold text-ink">{step.title}</h4>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
