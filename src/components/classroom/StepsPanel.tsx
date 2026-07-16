import type { ClassroomContext, LessonStepKey } from "@/lib/types";
import { CheckCircle, Circle, Target } from "lucide-react";
import { LESSON_STEPS } from "@/lib/teacher-types";

interface StepsPanelProps {
  classroomContext: ClassroomContext;
  onStepChange?: (step: LessonStepKey) => void;
}

export function StepsPanel({ classroomContext, onStepChange }: StepsPanelProps) {
  const { progress, lesson } = classroomContext;
  const currentStepIndex = LESSON_STEPS.indexOf(progress.currentStep as any);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Lesson Steps</h3>
        <p className="text-xs text-gray-500 mt-1">
          Step {currentStepIndex + 1} of {LESSON_STEPS.length}
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-2">
          {LESSON_STEPS.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const stepData = lesson.steps[index];
            const isLocked = index > currentStepIndex + 1;

            return (
              <button
                key={step}
                onClick={() => !isLocked && onStepChange?.(step as LessonStepKey)}
                disabled={isLocked}
                className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                  isCurrent
                    ? "bg-[#F7E7EA] border border-[var(--crimson-soft)]"
                    : isCompleted
                      ? "bg-green-50/50"
                      : "bg-gray-50/50"
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {isCompleted ? (
                    <CheckCircle size={20} className="text-green-600" />
                  ) : isCurrent ? (
                    <Target size={20} className="text-[var(--crimson)]" />
                  ) : (
                    <Circle size={20} className="text-gray-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <div
                    className={`text-sm font-medium ${
                      isCurrent
                        ? "text-[#191314]"
                        : isCompleted
                          ? "text-green-900"
                          : "text-gray-700"
                    }`}
                  >
                    {stepData?.title || step}
                  </div>
                  {stepData?.simpleExplanation && (
                    <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {stepData.simpleExplanation}
                    </div>
                  )}
                </div>

                {isCurrent && (
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[var(--crimson)] animate-pulse" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Progress Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-700">Progress</span>
            <span className="text-xs font-semibold text-[var(--crimson)]">
              {Math.round(((currentStepIndex + 1) / LESSON_STEPS.length) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--crimson)] rounded-full transition-all duration-300"
              style={{
                width: `${((currentStepIndex + 1) / LESSON_STEPS.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
