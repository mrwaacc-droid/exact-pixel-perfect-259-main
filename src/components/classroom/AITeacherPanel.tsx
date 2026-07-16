import type { TeacherState, LessonStepKey } from "@/lib/types";
import { Info, RotateCcw, GraduationCap } from "lucide-react";

interface AITeacherPanelProps {
  teacherState: TeacherState;
  currentStep: LessonStepKey;
  teacherName?: string;
  isSpeaking?: boolean;
}

const STATE_MESSAGES: Record<TeacherState, string> = {
  idle: "Ready to help",
  preparing: "Preparing lesson…",
  listening: "Listening to you…",
  thinking: "Thinking…",
  speaking: "Speaking…",
  explaining: "Explaining…",
  correcting: "Let me help you…",
  encouraging: "Great job!",
  writing: "Writing on board…",
  reading: "Reading aloud…",
  warning: "Common mistake alert!",
  checking: "Checking understanding…",
  paused: "Paused",
};

export function AITeacherPanel({
  teacherState,
  currentStep,
  teacherName = "Mr. Klass",
  isSpeaking = false,
}: AITeacherPanelProps) {
  return (
    <aside className="ai-panel">
      <div className="ai-panel-header">
        <div className="ai-panel-title">Your Teacher</div>
        <div className="online-badge">
          <span className="online-dot" />
          Online
        </div>
      </div>

      <div className="ai-avatar-wrap">
        <div className="ai-avatar">
          <div className="ai-avatar-placeholder">
            <GraduationCap size={48} className="text-[var(--crimson)]" />
          </div>
        </div>
        <div className="ai-speaking">
          <div className="flex items-center gap-2">
            {isSpeaking && <SoundBars />}
            <span>{STATE_MESSAGES[teacherState]}</span>
          </div>
        </div>
        <div className="ai-desc">{teacherName} is here to help you learn at your own pace</div>
      </div>

      <div className="ai-tags">
        <div className="ai-tag active">Adaptive</div>
        <div className="ai-tag active">Patient</div>
        <div className="ai-tag">24/7 Available</div>
      </div>

      <div className="divider" />

      <div className="current-step-box">
        <div className="current-step-label">
          <span>Current Step</span>
          <span className="current-step-num">{getStepNumber(currentStep)}/8</span>
        </div>
        <div className="current-step-name">{formatStepName(currentStep)}</div>
        <div className="current-step-desc">{getStepDescription(currentStep)}</div>
      </div>

      <div className="divider" />

      <div className="last-explanation-box">
        <div className="last-exp-label flex items-center gap-1.5">
          <Info size={14} className="text-[var(--gray-400)]" /> What we're learning
        </div>
        <div className="last-exp-text">
          Understanding how to solve quadratic equations using the factoring method. This technique
          helps us find the values of x that make the equation true.
        </div>
      </div>

      <button className="replay-btn">
        <RotateCcw size={14} /> Replay last explanation
      </button>
    </aside>
  );
}

function SoundBars() {
  return (
    <div className="sound-bars">
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

function getStepNumber(step: LessonStepKey): number {
  const steps: LessonStepKey[] = [
    "hook",
    "concept",
    "worked_example",
    "guided_practice",
    "independent_question",
    "correction",
    "quiz",
    "summary",
  ];
  return steps.indexOf(step) + 1;
}

function formatStepName(step: LessonStepKey): string {
  const names: Record<LessonStepKey, string> = {
    hook: "Hook",
    concept: "Concept Teaching",
    worked_example: "Worked Example",
    guided_practice: "Guided Practice",
    independent_question: "Independent Question",
    correction: "Correction Loop",
    quiz: "Quiz",
    summary: "Summary",
  };
  return names[step];
}

function getStepDescription(step: LessonStepKey): string {
  const descriptions: Record<LessonStepKey, string> = {
    hook: "Engaging introduction to show why this topic matters",
    concept: "Learning the fundamental ideas and definitions",
    worked_example: "Step-by-step demonstration of the solution method",
    guided_practice: "Working together through a practice problem",
    independent_question: "Applying what you learned on your own",
    correction: "Feedback and improvement based on your work",
    quiz: "Testing your understanding with a challenge",
    summary: "Reviewing key points and what comes next",
  };
  return descriptions[step];
}
