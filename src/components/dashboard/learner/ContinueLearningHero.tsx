import { Link } from "@tanstack/react-router";
import { Clock, Play, FileText, CheckCircle2, Accessibility } from "lucide-react";

interface ContinueLearningHeroProps {
  courseName: string;
  institutionName: string;
  lessonTitle: string;
  currentStep: string;
  stepNumber: number;
  totalSteps: number;
  progress: number;
  estimatedTime: string;
  teacherMode: string;
  accessibilityStatus: string;
  sessionId: string;
}

export function ContinueLearningHero({
  courseName,
  institutionName,
  lessonTitle,
  currentStep,
  stepNumber,
  totalSteps,
  progress,
  estimatedTime,
  teacherMode,
  accessibilityStatus,
  sessionId,
}: ContinueLearningHeroProps) {
  return (
    <section className="dashboard-card overflow-hidden bg-gradient-to-br from-[#F7E7EA] to-white border-[#F7E7EA]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left side: Course info */}
        <div className="flex-1">
          <div className="mb-3 flex items-center gap-2">
            <span className="status-pill bg-green-100 text-green-700 flex items-center gap-1">
              <Play className="h-3 w-3" />
              AI Teacher Ready
            </span>
          </div>

          <h2 className="text-2xl font-bold text-[var(--gray-900)] lg:text-3xl">{lessonTitle}</h2>

          <p className="text-sm text-[var(--gray-500)] lg:text-base">
            {courseName} · {institutionName}
          </p>

          {/* Progress info */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-[var(--gray-500)]">
                Step {stepNumber} of {totalSteps}
              </p>
              <p className="text-sm font-semibold text-[var(--gray-900)]">{currentStep}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[var(--primary)]">{progress}%</p>
              <p className="text-xs text-[var(--gray-500)]">{estimatedTime} left</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2 rounded-full bg-[var(--gray-200)]">
            <div
              className="h-2 rounded-full bg-[var(--primary)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Metadata */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-[var(--gray-700)] border border-[var(--gray-200)]">
              <Accessibility className="h-3 w-3" />
              {teacherMode}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-[var(--gray-700)] border border-[var(--gray-200)]">
              <CheckCircle2 className="h-3 w-3" />
              {accessibilityStatus}
            </span>
          </div>
        </div>

        {/* Right side: Actions */}
        <div className="flex flex-col gap-3 lg:min-w-[200px]">
          <Link
            to="/classroom/session/$sessionId"
            params={{ sessionId }}
            className="btn-primary flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-center text-sm font-semibold text-white"
          >
            <Play className="h-4 w-4" />
            Enter Classroom
          </Link>
          <Link
            to="/student/sessions/$sessionId/summary"
            params={{ sessionId }}
            className="btn-secondary flex items-center justify-center gap-2 rounded-xl border border-[var(--gray-200)] bg-white px-6 py-3 text-center text-sm font-semibold text-[var(--primary)] hover:bg-[var(--gray-50)]"
          >
            <FileText className="h-4 w-4" />
            Review Summary
          </Link>
          <Link
            to="/student/quizzes/$quizId"
            params={{ quizId: `quiz_${sessionId}` }}
            className="btn-secondary flex items-center justify-center gap-2 rounded-xl border border-[var(--gray-200)] bg-white px-6 py-3 text-center text-sm font-semibold text-[var(--primary)] hover:bg-[var(--gray-50)]"
          >
            <Clock className="h-4 w-4" />
            Take Quick Quiz
          </Link>
        </div>
      </div>
    </section>
  );
}
