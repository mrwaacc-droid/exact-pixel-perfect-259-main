/**
 * TeachingFlowUI.tsx
 *
 * Component that renders the real-teacher classroom flow:
 *   Write on board → Read exactly → Explain → Warn → Check → Next
 *
 * This component shows:
 *   - The whiteboard with items appearing one at a time
 *   - Teacher state indicator (writing, speaking, explaining, warning)
 *   - Common mistake warning banner
 *   - Teacher explanation text (what the teacher is saying beyond the board)
 *   - Navigation controls (skip, pause)
 *   - Progress indicator
 *   - Learner notes export button
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useTeachingEngine, type TeachingEngine } from "@/hooks/useTeachingEngine";
import type { MathTeachingItem } from "@/lib/lesson-models";
import {
  LESSON_TITLE,
  LESSON_OPENING_NARRATIVE,
  quadraticTeachingSequence,
} from "@/lib/demo-lesson-real-teacher";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  BookOpen,
  FileText,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Eye,
  Volume2,
  Lightbulb,
  Download,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

type TeachingFlowUIProps = {
  /** Custom teaching items (defaults to quadratic lesson) */
  items?: MathTeachingItem[];
  /** Lesson title */
  lessonTitle?: string;
  /** Opening narrative before teaching begins */
  openingNarrative?: string;
  /** Callback when lesson is complete */
  onComplete?: () => void;
  /** Callback to save notes */
  onSaveNotes?: (notesText: string) => void;
  /** Callback to save transcript */
  onSaveTranscript?: (transcriptText: string) => void;
  /** Whether auto-play is enabled */
  autoPlay?: boolean;
  /** CSS class name */
  className?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Phase display configuration
// ─────────────────────────────────────────────────────────────────────────────

const PHASE_LABELS: Record<string, { label: string; color: string; icon: typeof Eye }> = {
  idle: { label: "Ready", color: "bg-gray-100 text-gray-600", icon: Eye },
  narrating: { label: "Introduction", color: "bg-[#F7E7EA] text-[#521326]", icon: Volume2 },
  writing: { label: "Writing on Board", color: "bg-purple-100 text-purple-700", icon: Eye },
  reading: { label: "Reading", color: "bg-[#F7E7EA] text-[#521326]", icon: Volume2 },
  explaining: { label: "Explaining", color: "bg-cyan-100 text-cyan-700", icon: Lightbulb },
  warning: { label: "Common Mistake!", color: "bg-amber-100 text-amber-700", icon: AlertTriangle },
  checking: {
    label: "Checking Understanding",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
  },
  pausing: { label: "Pausing...", color: "bg-gray-100 text-gray-600", icon: Pause },
  complete: {
    label: "Lesson Complete!",
    color: "bg-emerald-100 text-emerald-700",
    icon: CheckCircle,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function TeachingFlowUI({
  items = quadraticTeachingSequence,
  lessonTitle = LESSON_TITLE,
  openingNarrative = LESSON_OPENING_NARRATIVE,
  onComplete,
  onSaveNotes,
  onSaveTranscript,
  autoPlay = true,
  className = "",
}: TeachingFlowUIProps) {
  const engine = useTeachingEngine();
  const [showNotes, setShowNotes] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const boardEndRef = useRef<HTMLDivElement>(null);

  // ── Auto-scroll board ─────────────────────────────────────────────────
  useEffect(() => {
    boardEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [engine.boardLines]);

  // ── Handle complete ───────────────────────────────────────────────────
  useEffect(() => {
    if (engine.currentPhase === "complete" && onComplete) {
      onComplete();
    }
  }, [engine.currentPhase, onComplete]);

  // ── Start lesson ──────────────────────────────────────────────────────
  const handleStart = useCallback(() => {
    setHasStarted(true);
    engine.startTeaching(items);
  }, [engine, items]);

  // ── Handle board written (called when animation completes) ────────────
  useEffect(() => {
    if (engine.currentPhase === "writing" && autoPlay) {
      // Simulate board writing animation delay
      const speed = engine.currentItem?.writingSpeed ?? "normal";
      const delay = speed === "slow" ? 2000 : speed === "fast" ? 500 : 1200;
      const timer = setTimeout(() => {
        engine.onBoardWritten();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [engine.currentPhase, autoPlay]);

  // ── Handle warning auto-advance ───────────────────────────────────────
  useEffect(() => {
    if (engine.currentPhase === "warning" && autoPlay) {
      const timer = setTimeout(() => {
        engine.onWarningShown();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [engine.currentPhase, autoPlay]);

  // ── Handle checking auto-advance ──────────────────────────────────────
  useEffect(() => {
    if (engine.currentPhase === "checking" && autoPlay) {
      const timer = setTimeout(() => {
        engine.onUnderstandingChecked();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [engine.currentPhase, autoPlay]);

  // ── Phase info ────────────────────────────────────────────────────────
  const phaseInfo = PHASE_LABELS[engine.currentPhase] ?? PHASE_LABELS.idle;
  const PhaseIcon = phaseInfo.icon;

  // ── Export notes ──────────────────────────────────────────────────────
  const handleExportNotes = useCallback(() => {
    const text = engine.getLearnerNotesText(lessonTitle);
    if (onSaveNotes) {
      onSaveNotes(text);
    } else {
      // Download as text file
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${lessonTitle.replace(/\s+/g, "_")}_notes.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [engine, lessonTitle, onSaveNotes]);

  const handleExportTranscript = useCallback(() => {
    const text = engine.getTranscriptText();
    if (onSaveTranscript) {
      onSaveTranscript(text);
    } else {
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${lessonTitle.replace(/\s+/g, "_")}_transcript.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [engine, lessonTitle, onSaveTranscript]);

  // ───────────────────────────────────────────────────────────────────────
  // Render: Pre-start screen
  // ───────────────────────────────────────────────────────────────────────
  if (!hasStarted) {
    return (
      <div className={`teaching-flow ${className}`}>
        <div className="teaching-start-screen">
          <div className="teaching-start-card">
            <div className="teaching-start-badge">
              <BookOpen className="h-4 w-4" />
              Klassruum Mathematics
            </div>
            <h2 className="teaching-start-title">{lessonTitle}</h2>
            <p className="teaching-start-narrative">{openingNarrative}</p>
            <div className="teaching-start-meta">
              <span className="teaching-start-meta-item">{items.length} teaching steps</span>
              <span className="teaching-start-meta-item">Interactive whiteboard</span>
              <span className="teaching-start-meta-item">Full explanations</span>
            </div>
            <Button size="lg" className="teaching-start-btn" onClick={handleStart}>
              <Play className="mr-2 h-4 w-4" />
              Begin Lesson
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────
  // Render: Main teaching flow
  // ───────────────────────────────────────────────────────────────────────
  return (
    <div className={`teaching-flow ${className}`}>
      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <div className="teaching-top-bar">
        <div className="teaching-top-bar-left">
          <span className="teaching-lesson-title">{lessonTitle}</span>
        </div>
        <div className="teaching-top-bar-center">
          <div className={`teaching-phase-badge ${phaseInfo.color}`}>
            <PhaseIcon className="h-3.5 w-3.5" />
            <span>{phaseInfo.label}</span>
          </div>
        </div>
        <div className="teaching-top-bar-right">
          <div className="teaching-progress-text">
            Step {engine.progress.currentItem + 1} of {engine.progress.totalItems}
          </div>
          <div className="teaching-progress-bar">
            <div
              className="teaching-progress-fill"
              style={{ width: `${engine.progress.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <div className="teaching-main">
        {/* ── Whiteboard ────────────────────────────────────────────────── */}
        <div className="teaching-whiteboard">
          <div className="teaching-whiteboard-header">
            <span className="teaching-whiteboard-label">Whiteboard</span>
            {engine.currentPhase === "writing" && (
              <span className="teaching-writing-indicator">
                <span className="teaching-writing-dot" />
                Writing...
              </span>
            )}
          </div>
          <div className="teaching-whiteboard-content">
            {engine.boardLines.length === 0 && engine.currentPhase === "idle" && (
              <div className="teaching-whiteboard-empty">
                The board is ready. Waiting for the teacher...
              </div>
            )}
            {engine.boardLines.map((line, idx) => {
              const isLatestLine =
                idx === engine.boardLines.length - 1 && engine.currentPhase === "writing";
              return (
                <div
                  key={`board-line-${idx}`}
                  className={`teaching-board-line ${
                    isLatestLine ? "teaching-board-line-active" : ""
                  } ${
                    engine.currentItem?.type === "answer" && idx === engine.boardLines.length - 1
                      ? "teaching-board-line-answer"
                      : ""
                  } ${
                    engine.currentItem?.type === "equation" && idx === engine.boardLines.length - 1
                      ? "teaching-board-line-equation"
                      : ""
                  }`}
                >
                  <span className="teaching-board-line-number">{idx + 1}</span>
                  <span className="teaching-board-line-text">{line}</span>
                </div>
              );
            })}
            <div ref={boardEndRef} />
          </div>
        </div>

        {/* ── Teacher Panel ─────────────────────────────────────────────── */}
        <div className="teaching-teacher-panel">
          {/* Current speech / explanation */}
          {engine.currentItem && (
            <div className="teaching-explanation-section">
              {/* Exact spoken text */}
              <div className="teaching-spoken-text">
                <div className="teaching-section-label">
                  <Volume2 className="h-3.5 w-3.5" />
                  Teacher reads:
                </div>
                <p className="teaching-spoken-content">
                  &ldquo;{engine.currentItem.exactSpokenText}&rdquo;
                </p>
              </div>

              {/* Teacher explanation */}
              {(engine.currentPhase === "explaining" ||
                engine.currentPhase === "checking" ||
                engine.currentPhase === "warning" ||
                engine.currentPhase === "pausing" ||
                engine.currentPhase === "complete") && (
                <div className="teaching-explanation-text">
                  <div className="teaching-section-label">
                    <Lightbulb className="h-3.5 w-3.5" />
                    Teacher explains:
                  </div>
                  <p className="teaching-explanation-content">
                    {engine.currentItem.teacherExplanation}
                  </p>
                  {engine.currentItem.whyThisStepMatters && (
                    <p className="teaching-why-matters">
                      <strong>Why this matters:</strong> {engine.currentItem.whyThisStepMatters}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Common mistake warning */}
          {engine.isWarningVisible && engine.currentItem?.commonMistake && (
            <div className="teaching-warning-banner">
              <div className="teaching-warning-header">
                <AlertTriangle className="h-4 w-4" />
                <span>Common Mistake</span>
              </div>
              <p className="teaching-warning-text">{engine.currentItem.commonMistake}</p>
            </div>
          )}

          {/* Step type indicator */}
          {engine.currentItem && (
            <div className="teaching-step-type">
              <span
                className={`teaching-step-type-badge teaching-step-type-${engine.currentItem.type}`}
              >
                {engine.currentItem.type}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Controls ────────────────────────────────────────────────────── */}
      <div className="teaching-controls">
        <div className="teaching-controls-left">
          <Button variant="outline" size="sm" onClick={() => engine.pauseTeaching()} title="Pause">
            <Pause className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => engine.skipToNext()}
            title="Skip to next step"
          >
            <SkipForward className="h-4 w-4" />
            <span className="ml-1">Skip</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => engine.resetTeaching()}
            title="Restart lesson"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="teaching-controls-center">
          {engine.currentPhase === "checking" && (
            <Button
              size="sm"
              onClick={() => engine.onUnderstandingChecked()}
              className="teaching-btn-understand"
            >
              <CheckCircle className="mr-1 h-4 w-4" />I understand, continue
            </Button>
          )}
          {engine.currentPhase === "warning" && (
            <Button size="sm" variant="outline" onClick={() => engine.onWarningShown()}>
              <ChevronRight className="mr-1 h-4 w-4" />
              Got it, continue
            </Button>
          )}
        </div>

        <div className="teaching-controls-right">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotes(!showNotes)}
            className={showNotes ? "teaching-btn-active" : ""}
          >
            <BookOpen className="h-4 w-4" />
            <span className="ml-1">Notes</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTranscript(!showTranscript)}
            className={showTranscript ? "teaching-btn-active" : ""}
          >
            <FileText className="h-4 w-4" />
            <span className="ml-1">Transcript</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExportNotes} title="Download notes">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Notes Panel (collapsible) ───────────────────────────────────── */}
      {showNotes && (
        <div className="teaching-notes-panel">
          <div className="teaching-notes-header">
            <h3>Learner Notes</h3>
            <Button variant="ghost" size="sm" onClick={handleExportNotes}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
          <pre className="teaching-notes-content">{engine.getLearnerNotesText(lessonTitle)}</pre>
        </div>
      )}

      {/* ── Transcript Panel (collapsible) ──────────────────────────────── */}
      {showTranscript && (
        <div className="teaching-transcript-panel">
          <div className="teaching-transcript-header">
            <h3>Full Transcript</h3>
            <Button variant="ghost" size="sm" onClick={handleExportTranscript}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
          <pre className="teaching-transcript-content">{engine.getTranscriptText()}</pre>
        </div>
      )}

      {/* ── Completion screen ───────────────────────────────────────────── */}
      {engine.currentPhase === "complete" && (
        <div className="teaching-complete-overlay">
          <div className="teaching-complete-card">
            <CheckCircle className="teaching-complete-icon" />
            <h2 className="teaching-complete-title">Lesson Complete!</h2>
            <p className="teaching-complete-subtitle">
              You have gone through all {items.length} teaching steps.
            </p>
            <div className="teaching-complete-actions">
              <Button onClick={handleExportNotes}>
                <Download className="mr-2 h-4 w-4" />
                Download Notes
              </Button>
              <Button variant="outline" onClick={() => engine.resetTeaching()}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Replay Lesson
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeachingFlowUI;
