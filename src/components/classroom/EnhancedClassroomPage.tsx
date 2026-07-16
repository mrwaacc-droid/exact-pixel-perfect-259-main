import React, { useState, useEffect } from "react";
import { AnimatedWhiteboard } from "./AnimatedWhiteboard";
import { QuestionSystem } from "./QuestionSystem";
import { LearnerNotesPanel, TeacherNotesPanel } from "./IntegratedNotesPanel";
import { ExitTicketPrompt, LessonCompletionSummary, HomeworkPanel } from "./LessonCompletionFlow";
import { sampleQuadraticsLesson } from "@/lib/sample-lesson";
import type { Lesson, LessonProgress } from "@/lib/lesson-types";
import type { LearningMode } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, BookOpen, Eye, EyeOff } from "lucide-react";

interface EnhancedClassroomPageProps {
  lessonId?: string;
  userAccessibilityMode?: LearningMode;
  isTeacher?: boolean;
}

export function EnhancedClassroomPage({
  lessonId,
  userAccessibilityMode = "standard",
  isTeacher = false,
}: EnhancedClassroomPageProps) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentQuestionCheckpoint, setCurrentQuestionCheckpoint] = useState(0);
  const [showExitTicket, setShowExitTicket] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);

  // Initialize lesson
  useEffect(() => {
    // In real app, fetch from backend based on lessonId
    // For now, use sample lesson
    setLesson(sampleQuadraticsLesson);
    setProgress({
      lessonId: sampleQuadraticsLesson.id,
      studentId: "demo-student",
      startedAt: new Date().toISOString(),
      currentStepIndex: 0,
      completedSteps: [],
      askedQuestions: [],
      midLessonQuestionAnswered: false,
      practiceAnswers: [],
      exitTicketAnswered: false,
      misconceptionsDetected: [],
      totalTimeMinutes: 0,
      notesCollected: [],
    });
  }, [lessonId]);

  // Timer for tracking elapsed time
  useEffect(() => {
    if (!isAnimating || showCompletion) return;
    const interval = setInterval(() => {
      setTimeElapsed((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isAnimating, showCompletion]);

  // Trigger question checkpoints
  useEffect(() => {
    if (!lesson || !progress || showCompletion) return;

    const checkpointTriggerTime =
      (lesson.questionCheckpoints[currentQuestionCheckpoint]?.triggerMinute ?? 999) * 60;

    if (timeElapsed >= checkpointTriggerTime && timeElapsed < checkpointTriggerTime + 2) {
      setShowQuestion(true);
    }
  }, [timeElapsed, lesson, currentQuestionCheckpoint, progress, showCompletion]);

  // Trigger mid-lesson question at 50%
  useEffect(() => {
    if (!lesson || !progress || showCompletion || progress.midLessonQuestionAnswered) return;

    const midLessonTime = (lesson.estimatedDurationMinutes / 2) * 60;
    if (timeElapsed >= midLessonTime && timeElapsed < midLessonTime + 2) {
      setShowQuestion(true);
    }
  }, [timeElapsed, lesson, progress, showCompletion]);

  // Check if should show exit ticket
  useEffect(() => {
    if (!lesson || !progress || showCompletion) return;

    if (currentStepIndex >= lesson.steps.length && !progress.exitTicketAnswered) {
      setShowExitTicket(true);
      setIsAnimating(false);
    }
  }, [currentStepIndex, lesson, progress, showCompletion]);

  if (!lesson || !progress) {
    return <div className="flex items-center justify-center h-screen">Loading lesson...</div>;
  }

  const currentStep = lesson.steps[currentStepIndex];
  const formattedTime = `${Math.floor(timeElapsed / 60)}:${String(timeElapsed % 60).padStart(2, "0")}`;
  const progressPercent = (currentStepIndex / lesson.steps.length) * 100;

  // Show completion summary
  if (showCompletion) {
    const practiceCorrectCount = progress.practiceAnswers.filter((answer) => answer.correct).length;
    const practiceScore = progress.practiceAnswers.length
      ? Math.round((practiceCorrectCount / progress.practiceAnswers.length) * 100)
      : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F7E7EA] to-[#F7E7EA] p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <LessonCompletionSummary
            lessonTitle={lesson.title}
            courseTitle={lesson.subject}
            timeSpentMinutes={Math.max(1, Math.floor(timeElapsed / 60))}
            questionsAsked={progress.askedQuestions.length}
            midLessonQuestionCorrect={Boolean(progress.midLessonQuestionAnswered)}
            practiceScore={practiceScore}
            exitTicketScore={progress.exitTicketAnswered ? 100 : undefined}
            weakTopics={["Sign handling in factoring"]}
            recommendedNext={{
              type: "practice",
              title: "Review factoring with two more examples",
              reason: "A little more repetition will make the factoring pattern feel automatic.",
            }}
            onBackToDashboard={() => (window.location.href = "/student/dashboard")}
            onRetakeLesson={() => window.location.reload()}
            onNextLesson={() => (window.location.href = "/student/courses")}
          />
          {lesson.homework && (
            <HomeworkPanel
              title={lesson.homework.title}
              problems={lesson.homework.problems}
              estimatedMinutes={lesson.homework.estimatedMinutes}
              reviewMaterial={lesson.homework.reviewMaterial}
              onStartHomework={() => alert("Starting homework")}
            />
          )}
        </div>
      </div>
    );
  }

  // Show exit ticket
  if (showExitTicket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F7E7EA] to-[#F7E7EA] p-6">
        <div className="max-w-2xl mx-auto">
          <ExitTicketPrompt
            ticket={lesson.exitTicket}
            onSubmit={(answer) => {
              setProgress((prev) =>
                prev
                  ? {
                    ...prev,
                    exitTicketAnswered: true,
                    completedAt: new Date().toISOString(),
                  }
                  : prev,
              );
              setShowCompletion(true);
            }}
            isLoading={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
              <p className="text-sm text-gray-600 mt-1">
                Step {currentStepIndex + 1} of {lesson.steps.length}: {currentStep?.title}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{formattedTime}</div>
                <div className="text-xs text-gray-600">
                  Estimated: {lesson.estimatedDurationMinutes} min
                </div>
              </div>
              <Button variant="outline" onClick={() => setShowNotes(!showNotes)} className="gap-2">
                {showNotes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showNotes ? "Hide" : "Show"} Notes
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#7D2233] h-2 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
          {/* Whiteboard Area */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
              <AnimatedWhiteboard
                items={currentStep?.boardItems || []}
                isPlaying={isAnimating}
                writingSpeed="normal"
                onItemComplete={(id) => {
                  // Track which items have been read
                }}
                onSequenceComplete={() => {
                  // Mark step as complete and move to next
                  if (currentStepIndex < lesson.steps.length - 1) {
                    setProgress({
                      ...progress,
                      completedSteps: [...progress.completedSteps, currentStep.id],
                      currentStepIndex: currentStepIndex + 1,
                    });
                  }
                }}
              />
            </div>

            {/* Step navigation */}
            <div className="flex gap-4 justify-between">
              <Button
                onClick={() => {
                  if (currentStepIndex > 0) {
                    setCurrentStepIndex(currentStepIndex - 1);
                    setIsAnimating(true);
                  }
                }}
                disabled={currentStepIndex === 0}
                variant="outline"
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Step
              </Button>

              <Button onClick={() => setIsAnimating(!isAnimating)} variant="outline">
                {isAnimating ? "Pause" : "Resume"} Animation
              </Button>

              <Button
                onClick={() => {
                  if (currentStepIndex < lesson.steps.length - 1) {
                    setCurrentStepIndex(currentStepIndex + 1);
                    setIsAnimating(true);
                  } else {
                    setShowExitTicket(true);
                    setIsAnimating(false);
                  }
                }}
                className="gap-2 bg-[#7D2233] hover:bg-[var(--crimson-dark)]"
              >
                {currentStepIndex === lesson.steps.length - 1 ? "Finish Lesson" : "Next Step"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Sidebar - Notes */}
          {showNotes && (
            <div className="max-h-[600px] overflow-y-auto space-y-4">
              {isTeacher ? (
                <TeacherNotesPanel
                  lessonTitle={lesson.title}
                  keyMessages={lesson.notes?.teacherGuide?.keyMessages || []}
                  commonStudentConfusions={
                    lesson.notes?.teacherGuide?.commonStudentConfusions || []
                  }
                  timingNotes={lesson.notes?.teacherGuide?.timingNotes}
                  adaptations={lesson.notes?.teacherGuide?.adaptations}
                />
              ) : (
                <LearnerNotesPanel
                  lessonTitle={lesson.title}
                  summary={lesson.notes.learnerNotes.summary}
                  sections={lesson.notes.learnerNotes.sections}
                  formulasAndRules={lesson.notes.learnerNotes.formulasAndRules}
                  commonMistakes={lesson.notes.learnerNotes.commonMistakes}
                  onDownload={() => alert("Downloading notes...")}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Question System Modal */}
      <QuestionSystem
        mode={userAccessibilityMode}
        isOpen={showQuestion}
        questionText={
          !progress.midLessonQuestionAnswered &&
            timeElapsed >= (lesson.estimatedDurationMinutes / 2) * 60
            ? lesson.requiredMidLessonQuestion?.questionText
            : lesson.questionCheckpoints[currentQuestionCheckpoint]?.promptText
        }
        onAnswer={(answer, method) => {
          const questionText =
            !progress.midLessonQuestionAnswered &&
              timeElapsed >= (lesson.estimatedDurationMinutes / 2) * 60
              ? lesson.requiredMidLessonQuestion.questionText
              : lesson.questionCheckpoints[currentQuestionCheckpoint]?.promptText || "";

          setProgress({
            ...progress,
            askedQuestions: [
              ...progress.askedQuestions,
              {
                checkpointId:
                  !progress.midLessonQuestionAnswered &&
                    timeElapsed >= (lesson.estimatedDurationMinutes / 2) * 60
                    ? "mid-lesson"
                    : lesson.questionCheckpoints[currentQuestionCheckpoint]?.id ||
                    `checkpoint-${currentQuestionCheckpoint}`,
                question: questionText,
                answer,
                timestamp: new Date().toISOString(),
              },
            ],
            midLessonQuestionAnswered:
              !progress.midLessonQuestionAnswered &&
                timeElapsed >= (lesson.estimatedDurationMinutes / 2) * 60
                ? true
                : progress.midLessonQuestionAnswered,
          });
          setShowQuestion(false);
          if (currentQuestionCheckpoint < lesson.questionCheckpoints.length) {
            setCurrentQuestionCheckpoint(currentQuestionCheckpoint + 1);
          }
        }}
        onSkip={() => {
          setShowQuestion(false);
          if (currentQuestionCheckpoint < lesson.questionCheckpoints.length) {
            setCurrentQuestionCheckpoint(currentQuestionCheckpoint + 1);
          }
        }}
        onClose={() => setShowQuestion(false)}
      />
    </div>
  );
}
