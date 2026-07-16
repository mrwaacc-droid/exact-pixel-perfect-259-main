/**
 * AITeacherVideoPanel.tsx
 *
 * Level 1 AI Video — Animated AI Teacher Placeholder
 *
 * This is the visual "body" of the AI teacher. The "brain" is the
 * TeachingOrchestrator which drives state changes that this panel reflects.
 *
 * Components:
 *   - AITeacherVideoPanel  — main container
 *   - AITeacherAvatar      — animated placeholder with mouth
 *   - SpeakingRing         — pulsing glow ring when speaking
 *   - AudioWaveform        — animated frequency bars
 *   - TeacherStateBadge    — state indicator with color
 *   - CaptionBar           — live spoken text overlay
 *   - ConnectionStatus     — idle/connecting/connected/error
 */

import { useState, useCallback } from "react";
import {
  GraduationCap,
  RotateCcw,
  MessageSquare,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Loader2,
  AlertCircle,
  Hand,
  Ear,
  Brain,
  Pencil,
  BookMarked,
  Pause,
  Sparkles,
  ThumbsUp,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type AITeacherState =
  | "idle"
  | "preparing"
  | "writing"
  | "reading_board"
  | "explaining"
  | "asking_question"
  | "listening"
  | "thinking"
  | "answering"
  | "encouraging"
  | "paused";

export type ConnectionStatus = "idle" | "connecting" | "connected" | "error";

export type AvatarVideoMode = "animated_placeholder" | "pregenerated_clip" | "realtime_stream";

export type LearningModeDisplay =
  | "standard"
  | "deaf"
  | "blind"
  | "adhd_focus"
  | "speech_difficulty";

export interface AITeacherVideoPanelProps {
  /** Teacher display name */
  teacherName?: string;
  /** Current teacher state */
  teacherState: AITeacherState;
  /** Whether the teacher is currently speaking */
  isSpeaking: boolean;
  /** Current caption text (what teacher is saying now) */
  captionText?: string;
  /** Connection status */
  connectionStatus?: ConnectionStatus;
  /** Avatar video mode */
  mode?: AvatarVideoMode;
  /** Video URL for pre-generated clips (Level 2) */
  videoUrl?: string;
  /** Current teaching phase description */
  phaseLabel?: string;
  /** Current step info */
  currentStep?: number;
  /** Total steps */
  totalSteps?: number;
  /** Whether captions are enabled */
  captionsEnabled?: boolean;
  /** Learning mode */
  learningMode?: LearningModeDisplay;
  /** Last explanation text for replay */
  lastExplanation?: string;
  /** Callback when replay is requested */
  onReplay?: () => void;
  /** Callback when learner asks a question */
  onAskQuestion?: (question: string) => void;
  /** Callback to toggle captions */
  onToggleCaptions?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// State Configuration
// ─────────────────────────────────────────────────────────────────────────────

interface StateConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: LucideIcon;
  ringColor: string;
}

const STATE_CONFIG: Record<AITeacherState, StateConfig> = {
  idle: {
    label: "Ready",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-300",
    icon: GraduationCap,
    ringColor: "rgba(107, 114, 128, 0.3)",
  },
  preparing: {
    label: "Preparing lesson…",
    color: "text-[#7D2233]",
    bgColor: "bg-[var(--crimson-soft)]",
    borderColor: "border-[var(--crimson-soft)]",
    icon: Loader2,
    ringColor: "rgba(154, 50, 71, 0.3)",
  },
  writing: {
    label: "Writing on board…",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300",
    icon: Pencil,
    ringColor: "rgba(147, 51, 234, 0.4)",
  },
  reading_board: {
    label: "Reading board…",
    color: "text-[#7D2233]",
    bgColor: "bg-[var(--crimson-soft)]",
    borderColor: "border-[var(--crimson-soft)]",
    icon: BookMarked,
    ringColor: "rgba(79, 70, 229, 0.4)",
  },
  explaining: {
    label: "Explaining…",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-300",
    icon: Lightbulb,
    ringColor: "rgba(8, 145, 178, 0.4)",
  },
  asking_question: {
    label: "Asking you a question…",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
    icon: Hand,
    ringColor: "rgba(217, 119, 6, 0.4)",
  },
  listening: {
    label: "Listening to you…",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
    icon: Ear,
    ringColor: "rgba(22, 163, 74, 0.4)",
  },
  thinking: {
    label: "Thinking…",
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-300",
    icon: Brain,
    ringColor: "rgba(124, 58, 237, 0.4)",
  },
  answering: {
    label: "Answering…",
    color: "text-[#7D2233]",
    bgColor: "bg-[var(--crimson-soft)]",
    borderColor: "border-[var(--crimson-soft)]",
    icon: MessageSquare,
    ringColor: "rgba(154, 50, 71, 0.4)",
  },
  encouraging: {
    label: "Great work!",
    color: "text-success",
    bgColor: "bg-success-light",
    borderColor: "border-emerald-300",
    icon: ThumbsUp,
    ringColor: "rgba(5, 150, 105, 0.4)",
  },
  paused: {
    label: "Paused",
    color: "text-gray-500",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-300",
    icon: Pause,
    ringColor: "rgba(107, 114, 128, 0.2)",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SpeakingRing — Animated glow ring around avatar
// ─────────────────────────────────────────────────────────────────────────────

function SpeakingRing({ isSpeaking, color }: { isSpeaking: boolean; color: string }) {
  return (
    <div
      className={`ai-video-speaking-ring ${isSpeaking ? "ai-video-speaking-ring-active" : ""}`}
      style={{ "--ring-color": color } as React.CSSProperties}
    >
      <div className="ai-video-speaking-ring-inner" />
      <div className="ai-video-speaking-ring-outer" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AudioWaveform — Animated frequency bars
// ─────────────────────────────────────────────────────────────────────────────

function AudioWaveform({ isSpeaking }: { isSpeaking: boolean }) {
  const barCount = 24;
  return (
    <div className={`ai-video-waveform ${isSpeaking ? "ai-video-waveform-active" : ""}`}>
      {Array.from({ length: barCount }).map((_, i) => (
        <span
          key={i}
          className="ai-video-waveform-bar"
          style={{
            animationDelay: `${i * 0.05}s`,
            animationDuration: `${0.4 + Math.random() * 0.4}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TeacherStateBadge — State indicator
// ─────────────────────────────────────────────────────────────────────────────

function TeacherStateBadge({ state }: { state: AITeacherState }) {
  const config = STATE_CONFIG[state];
  const Icon = config.icon;
  const isSpinning = state === "preparing" || state === "thinking";

  return (
    <div className={`ai-video-state-badge ${config.bgColor} ${config.borderColor}`}>
      <Icon className={`h-3 w-3 ${config.color} ${isSpinning ? "ai-video-spin" : ""}`} />
      <span className={`ai-video-state-label ${config.color}`}>{config.label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ConnectionStatus — Connection indicator
// ─────────────────────────────────────────────────────────────────────────────

function ConnectionStatusIndicator({ status }: { status: ConnectionStatus }) {
  const config: Record<ConnectionStatus, { icon: LucideIcon; label: string; color: string }> = {
    idle: { icon: WifiOff, label: "Offline", color: "text-gray-400" },
    connecting: {
      icon: Loader2,
      label: "Connecting…",
      color: "text-amber-500",
    },
    connected: { icon: Wifi, label: "Connected", color: "text-green-500" },
    error: { icon: AlertCircle, label: "Error", color: "text-red-500" },
  };

  const { icon: Icon, label, color } = config[status];

  return (
    <div className={`ai-video-connection ${color}`}>
      <Icon className={`h-3 w-3 ${status === "connecting" ? "ai-video-spin" : ""}`} />
      <span>{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CaptionBar — Live spoken text overlay
// ─────────────────────────────────────────────────────────────────────────────

function CaptionBar({ text, enabled }: { text: string; enabled: boolean }) {
  if (!enabled || !text) return null;

  return (
    <div className="ai-video-caption-bar">
      <div className="ai-video-caption-text">{text}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AITeacherAvatar — Animated placeholder avatar with mouth
// ─────────────────────────────────────────────────────────────────────────────

function AITeacherAvatar({
  isSpeaking,
  teacherState,
  ringColor,
}: {
  isSpeaking: boolean;
  teacherState: AITeacherState;
  ringColor: string;
}) {
  const isActive = teacherState !== "idle" && teacherState !== "paused";

  return (
    <div className="ai-video-avatar-container">
      {/* Speaking ring */}
      <SpeakingRing isSpeaking={isSpeaking} color={ringColor} />

      {/* Avatar body */}
      <div
        className={`ai-video-avatar ${isActive ? "ai-video-avatar-active" : ""} ${isSpeaking ? "ai-video-avatar-speaking" : ""}`}
      >
        {/* Head */}
        <div className="ai-video-avatar-head">
          {/* Eyes */}
          <div className="ai-video-avatar-eyes">
            <div
              className={`ai-video-avatar-eye ${teacherState === "thinking" ? "ai-video-eye-looking-up" : ""} ${teacherState === "listening" ? "ai-video-eye-looking-side" : ""}`}
            />
            <div
              className={`ai-video-avatar-eye ${teacherState === "thinking" ? "ai-video-eye-looking-up" : ""} ${teacherState === "listening" ? "ai-video-eye-looking-side" : ""}`}
            />
          </div>

          {/* Mouth — animates when speaking */}
          <div
            className={`ai-video-avatar-mouth ${isSpeaking ? "ai-video-mouth-speaking" : ""} ${
              teacherState === "encouraging"
                ? "ai-video-mouth-smile"
                : teacherState === "asking_question"
                  ? "ai-video-mouth-question"
                  : ""
            }`}
          />

          {/* Graduation cap */}
          <div className="ai-video-avatar-cap">
            <GraduationCap size={20} className="text-[#7D2233]" />
          </div>
        </div>

        {/* Body */}
        <div className="ai-video-avatar-body">
          <div className="ai-video-avatar-torso" />
        </div>
      </div>

      {/* Glow effect when active */}
      {isActive && <div className="ai-video-avatar-glow" style={{ background: ringColor }} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// QuestionInput — Simple ask question UI
// ─────────────────────────────────────────────────────────────────────────────

function QuestionInput({
  onAskQuestion,
  isOpen,
  onToggle,
}: {
  onAskQuestion: (question: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [question, setQuestion] = useState("");

  const handleSubmit = useCallback(() => {
    if (question.trim()) {
      onAskQuestion(question.trim());
      setQuestion("");
    }
  }, [question, onAskQuestion]);

  if (!isOpen) return null;

  return (
    <div className="ai-video-question-input">
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Type your question here…"
        className="ai-video-question-textarea"
        rows={3}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />
      <div className="ai-video-question-actions">
        <button
          className="ai-video-question-send"
          onClick={handleSubmit}
          disabled={!question.trim()}
        >
          Send Question
        </button>
        <button className="ai-video-question-cancel" onClick={onToggle}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main: AITeacherVideoPanel
// ─────────────────────────────────────────────────────────────────────────────

export function AITeacherVideoPanel({
  teacherName = "Mr. Klass",
  teacherState,
  isSpeaking,
  captionText = "",
  connectionStatus = "connected",
  mode = "animated_placeholder",
  videoUrl,
  phaseLabel,
  currentStep,
  totalSteps,
  captionsEnabled = true,
  learningMode = "standard",
  lastExplanation,
  onReplay,
  onAskQuestion,
  onToggleCaptions,
}: AITeacherVideoPanelProps) {
  const [showQuestionInput, setShowQuestionInput] = useState(false);

  const stateConfig = STATE_CONFIG[teacherState];

  // Accessibility: deaf mode forces captions on
  const effectiveCaptionsEnabled = captionsEnabled || learningMode === "deaf";

  // ADHD focus: minimal UI
  const isFocusMode = learningMode === "adhd_focus";

  const handleAskQuestion = useCallback(
    (question: string) => {
      onAskQuestion?.(question);
      setShowQuestionInput(false);
    },
    [onAskQuestion],
  );

  // ── For Level 2 (pre-generated video) ──────────────────────────────────
  if (mode === "pregenerated_clip" && videoUrl) {
    return (
      <aside className="ai-video-panel">
        <div className="ai-video-panel-header">
          <div className="ai-video-panel-title">{teacherName}</div>
          <ConnectionStatusIndicator status={connectionStatus} />
        </div>
        <div className="ai-video-clip-container">
          <video src={videoUrl} className="ai-video-clip-player" autoPlay playsInline />
          <CaptionBar text={captionText} enabled={effectiveCaptionsEnabled} />
        </div>
        <div className="ai-video-panel-footer">
          <TeacherStateBadge state={teacherState} />
        </div>
      </aside>
    );
  }

  // ── Level 1: Animated Avatar (default) ─────────────────────────────────
  return (
    <aside className={`ai-video-panel ${isFocusMode ? "ai-video-panel-focus" : ""}`}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="ai-video-panel-header">
        <div className="ai-video-panel-identity">
          <div className="ai-video-panel-title">{teacherName}</div>
          <div className="ai-video-panel-mode">AI Teacher</div>
        </div>
        <ConnectionStatusIndicator status={connectionStatus} />
      </div>

      {/* ── Avatar Stage ────────────────────────────────────────────────── */}
      <div className="ai-video-stage">
        <AITeacherAvatar
          isSpeaking={isSpeaking}
          teacherState={teacherState}
          ringColor={stateConfig.ringColor}
        />

        {/* Audio waveform below avatar */}
        <AudioWaveform isSpeaking={isSpeaking} />

        {/* State badge overlay */}
        <div className="ai-video-state-badge-container">
          <TeacherStateBadge state={teacherState} />
        </div>
      </div>

      {/* ── Caption Bar ─────────────────────────────────────────────────── */}
      <CaptionBar text={captionText} enabled={effectiveCaptionsEnabled} />

      {/* ── Phase / Step Info ────────────────────────────────────────────── */}
      {!isFocusMode && (
        <div className="ai-video-info-section">
          {phaseLabel && (
            <div className="ai-video-phase-info">
              <span className="ai-video-phase-label">Current Activity</span>
              <span className="ai-video-phase-value">{phaseLabel}</span>
            </div>
          )}
          {currentStep !== undefined && totalSteps !== undefined && (
            <div className="ai-video-step-progress">
              <div className="ai-video-step-bar">
                <div
                  className="ai-video-step-bar-fill"
                  style={{
                    width: `${Math.round((currentStep / totalSteps) * 100)}%`,
                  }}
                />
              </div>
              <span className="ai-video-step-text">
                Step {currentStep} / {totalSteps}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Controls ────────────────────────────────────────────────────── */}
      <div className="ai-video-controls">
        {/* Replay button */}
        <button
          className="ai-video-control-btn"
          onClick={onReplay}
          disabled={!lastExplanation}
          title="Replay last explanation"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Replay</span>
        </button>

        {/* Ask question button */}
        <button
          className="ai-video-control-btn ai-video-control-btn-primary"
          onClick={() => setShowQuestionInput(!showQuestionInput)}
          title="Ask a question"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Ask</span>
        </button>

        {/* Captions toggle */}
        <button
          className="ai-video-control-btn"
          onClick={onToggleCaptions}
          title={effectiveCaptionsEnabled ? "Hide captions" : "Show captions"}
        >
          {effectiveCaptionsEnabled ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
          <span>{effectiveCaptionsEnabled ? "CC On" : "CC Off"}</span>
        </button>
      </div>

      {/* ── Question Input ──────────────────────────────────────────────── */}
      <QuestionInput
        onAskQuestion={handleAskQuestion}
        isOpen={showQuestionInput}
        onToggle={() => setShowQuestionInput(false)}
      />

      {/* ── Learning Mode Indicator ─────────────────────────────────────── */}
      {!isFocusMode && learningMode !== "standard" && (
        <div className="ai-video-mode-indicator">
          <Sparkles className="h-3 w-3" />
          <span>
            {learningMode === "deaf" && "Deaf Mode Active"}
            {learningMode === "blind" && "Blind Mode Active"}
            {learningMode === "speech_difficulty" && "Speech Support Active"}
          </span>
        </div>
      )}
    </aside>
  );
}

export default AITeacherVideoPanel;
