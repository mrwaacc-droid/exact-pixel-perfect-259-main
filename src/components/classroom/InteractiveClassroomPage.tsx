import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  Atom,
  Brain,
  Calculator,
  CircleCheck as CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  EyeOff,
  Feather,
  Globe,
  Circle as HelpCircle,
  Image,
  Languages,
  Lightbulb,
  Map,
  Mic,
  MicOff,
  Music,
  Notebook,
  Palette,
  Play,
  Send,
  Sparkles,
  Bubbles as Subtitles,
  Target,
  Volume2,
  VolumeX,
  Zap,
  Accessibility,
  BookOpen,
  Settings,
  MessageSquare,
  Repeat,
  SkipForward,
  X,
  Beaker,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { speakWithAccessibility, stopSpeech, startListening, stopListening } from "@/lib/speech";
import {
  DEMO_LESSON,
  type BoardWriteItem,
  type QuestionCheckpoint,
  type BoardItemType,
} from "@/lib/lesson-models";
import { startOrResumeClassroom } from "@/lib/sessions.functions";
import type { ClassroomContext } from "@/lib/types";
import "@/styles/classroom.css";

type Panel = "steps" | "chat" | "notes" | "settings";

type ClassroomState = {
  mode: "intro" | "teaching" | "question" | "practice" | "summary" | "complete";
  stepIndex: number;
  boardItemIndex: number;
  visibleBoardItems: BoardWriteItem[];
  currentSpeech: string;
  isTeacherSpeaking: boolean;
  elapsedSeconds: number;
  progressPercent: number;
  questionPrompt: string | null;
  isWaitingForAnswer: boolean;
  isRequiredQuestion: boolean;
  isMicActive: boolean;
  autoPlay: boolean;
  speechRate: number;
  showCaptions: boolean;
  messages: Array<{ id: string; sender: "student" | "teacher" | "system"; message: string }>;
  practiceMode: "guided" | "independent" | null;
  practiceResult: "correct" | "incorrect" | null;
};

const STEP_ORDER = [
  "welcome",
  "concept",
  "worked_example",
  "guided_practice",
  "independent_practice",
  "summary",
];

// Subject type for content adaptation
type SubjectType =
  | "math"
  | "science"
  | "language"
  | "history"
  | "geography"
  | "art"
  | "music"
  | "ict"
  | "general";

// Get subject from lesson data
function getSubjectType(subject: string): SubjectType {
  const lowerSubject = subject.toLowerCase();
  if (
    lowerSubject.includes("math") ||
    lowerSubject.includes("algebra") ||
    lowerSubject.includes("geometry") ||
    lowerSubject.includes("calculus") ||
    lowerSubject.includes("arithmetic")
  )
    return "math";
  if (
    lowerSubject.includes("science") ||
    lowerSubject.includes("physics") ||
    lowerSubject.includes("chemistry") ||
    lowerSubject.includes("biology")
  )
    return "science";
  if (
    lowerSubject.includes("english") ||
    lowerSubject.includes("language") ||
    lowerSubject.includes("french") ||
    lowerSubject.includes("spanish") ||
    lowerSubject.includes("literature")
  )
    return "language";
  if (lowerSubject.includes("history") || lowerSubject.includes("civics")) return "history";
  if (lowerSubject.includes("geography")) return "geography";
  if (lowerSubject.includes("art") || lowerSubject.includes("drawing")) return "art";
  if (lowerSubject.includes("music")) return "music";
  if (
    lowerSubject.includes("computer") ||
    lowerSubject.includes("ict") ||
    lowerSubject.includes("coding")
  )
    return "ict";
  return "general";
}

// Subject icon mapping
const SUBJECT_ICONS: Record<SubjectType, React.ElementType> = {
  math: Calculator,
  science: Beaker,
  language: Languages,
  history: BookOpen,
  geography: Map,
  art: Palette,
  music: Music,
  ict: Settings,
  general: BookOpen,
};

// Subject color mapping
const SUBJECT_COLORS: Record<SubjectType, string> = {
  math: "#7c3aed",
  science: "#059669",
  language: "#ea580c",
  history: "#b45309",
  geography: "#0891b2",
  art: "#db2777",
  music: "#7c3aed",
  ict: "#9A3247",
  general: "var(--muted)",
};

export function InteractiveClassroomPage({
  classroomContext,
  sessionId,
  onEndLesson,
}: {
  classroomContext: ClassroomContext;
  sessionId: string;
  onEndLesson: () => void;
}) {
  const router = useRouter();
  const lesson = DEMO_LESSON;

  const [state, setState] = useState<ClassroomState>({
    mode: "intro",
    stepIndex: 0,
    boardItemIndex: -1,
    visibleBoardItems: [],
    currentSpeech: "",
    isTeacherSpeaking: false,
    elapsedSeconds: 0,
    progressPercent: 0,
    questionPrompt: null,
    isWaitingForAnswer: false,
    isRequiredQuestion: false,
    isMicActive: false,
    autoPlay: true,
    speechRate: 1,
    showCaptions: true,
    messages: [],
    practiceMode: null,
    practiceResult: null,
  });

  const currentStep = lesson.steps[state.stepIndex];

  const [chatInput, setChatInput] = useState("");
  const [activePanel, setActivePanel] = useState<Panel>("chat");
  const [isListening, setIsListening] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(true);

  const timerRef = useRef<number | null>(null);
  const recognitionRef = useRef<ReturnType<typeof startListening> | null>(null);
  const autoPlayRef = useRef(state.autoPlay);

  // Keep autoPlayRef in sync
  useEffect(() => {
    autoPlayRef.current = state.autoPlay;
  }, [state.autoPlay]);

  // Start timer for lesson progress
  useEffect(() => {
    if (!welcomeOpen && state.mode !== "complete") {
      timerRef.current = window.setInterval(() => {
        setState((prev) => ({
          ...prev,
          elapsedSeconds: prev.elapsedSeconds + 1,
          progressPercent: Math.round((prev.stepIndex / lesson.steps.length) * 100),
        }));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [welcomeOpen, state.mode, lesson.steps.length]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopSpeech();
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) stopListening(recognitionRef.current);
    };
  }, []);

  // Speak and await completion
  const speakAndWait = useCallback(
    (text: string, onComplete?: () => void) => {
      stopSpeech();
      setState((prev) => ({
        ...prev,
        isTeacherSpeaking: true,
        currentSpeech: text,
      }));

      speakWithAccessibility(text, {
        rate: state.speechRate,
        onEnd: () => {
          setState((prev) => ({
            ...prev,
            isTeacherSpeaking: false,
          }));
          onComplete?.();
        },
      });
    },
    [state.speechRate],
  );

  // Show next board item
  const showNextBoardItem = useCallback(() => {
    const step = lesson.steps[state.stepIndex];
    if (!step) return;

    const nextIndex = state.boardItemIndex + 1;
    if (nextIndex >= step.boardItems.length) {
      // Move to next step
      goToNextStep();
      return;
    }

    const item = step.boardItems[nextIndex];
    setState((prev) => ({
      ...prev,
      boardItemIndex: nextIndex,
      visibleBoardItems: [...prev.visibleBoardItems, item],
    }));

    // Teacher reads the item
    if (item.readExactly) {
      speakAndWait(item.text, () => {
        if (item.explanation) {
          speakAndWait(item.explanation, () => {
            // Continue after pause
            if (autoPlayRef.current && !state.questionPrompt) {
              setTimeout(() => showNextBoardItem(), item.pauseAfter || 1000);
            }
          });
        } else if (autoPlayRef.current && !state.questionPrompt) {
          setTimeout(() => showNextBoardItem(), item.pauseAfter || 800);
        }
      });
    } else if (item.explanation) {
      speakAndWait(item.explanation, () => {
        if (autoPlayRef.current && !state.questionPrompt) {
          setTimeout(() => showNextBoardItem(), item.pauseAfter || 500);
        }
      });
    } else if (autoPlayRef.current && !state.questionPrompt) {
      setTimeout(() => showNextBoardItem(), item.pauseAfter || 500);
    }
  }, [state.stepIndex, state.boardItemIndex, state.questionPrompt, lesson, speakAndWait]);

  // Go to next step
  const goToNextStep = useCallback(() => {
    const nextIndex = state.stepIndex + 1;
    if (nextIndex >= lesson.steps.length) {
      // Lesson complete
      completeLesson();
      return;
    }

    const step = lesson.steps[nextIndex];
    setState((prev) => ({
      ...prev,
      stepIndex: nextIndex,
      boardItemIndex: -1,
      visibleBoardItems: [],
      mode: "teaching",
    }));

    // Check for required mid-lesson question
    if (nextIndex === 2 && lesson.requiredMidLessonQuestion) {
      // At 50% point
      setTimeout(() => {
        triggerRequiredQuestion();
      }, 1000);
      return;
    }

    // Check for practice
    if (step.practice) {
      startPractice(step.practice.type);
      return;
    }

    // Speak step intro and start board items
    speakAndWait(`Now, ${step.title.toLowerCase()}.`, () => {
      if (autoPlayRef.current) {
        setTimeout(() => showNextBoardItem(), 500);
      }
    });
  }, [state.stepIndex, lesson, speakAndWait, showNextBoardItem]);

  // Trigger required question
  const triggerRequiredQuestion = useCallback(() => {
    setState((prev) => ({
      ...prev,
      questionPrompt: lesson.requiredMidLessonQuestion.questionText,
      isWaitingForAnswer: true,
      isRequiredQuestion: true,
      isMicActive: true,
      mode: "question",
    }));

    speakAndWait(lesson.requiredMidLessonQuestion.questionText, () => {
      // Mic is now active, listening
      startMicListening();
    });
  }, [lesson, speakAndWait]);

  // Start practice
  const startPractice = useCallback(
    (type: "guided" | "independent") => {
      const step = lesson.steps[state.stepIndex];
      if (!step?.practice) return;

      setState((prev) => ({
        ...prev,
        mode: "practice",
        practiceMode: type,
        questionPrompt: step.practice!.problemText,
        isWaitingForAnswer: true,
        isMicActive: true,
      }));

      speakAndWait(
        type === "guided"
          ? `Let's practice together. ${step.practice.problemText}`
          : `Now it's your turn. ${step.practice.problemText}`,
        () => {
          startMicListening();
        },
      );
    },
    [state.stepIndex, lesson, speakAndWait],
  );

  // Start mic listening for answer
  const startMicListening = useCallback(() => {
    setIsListening(true);
    // Note: In production, this would use Web Speech API
    // For now, we'll use text input
  }, []);

  // Stop mic listening
  const stopMicListening = useCallback(() => {
    setIsListening(false);
  }, []);

  // Process answer
  const processAnswer = useCallback(
    (answer: string) => {
      const normalized = answer.toLowerCase().trim();

      if (state.isRequiredQuestion) {
        const isCorrect = lesson.requiredMidLessonQuestion.acceptableAnswers.some(
          (a) => a.toLowerCase().trim() === normalized,
        );

        const feedback = isCorrect
          ? lesson.requiredMidLessonQuestion.feedbackCorrect
          : lesson.requiredMidLessonQuestion.feedbackIncorrect;

        speakAndWait(feedback, () => {
          if (!isCorrect && lesson.requiredMidLessonQuestion.boardCorrection.length > 0) {
            setState((prev) => ({
              ...prev,
              visibleBoardItems: lesson.requiredMidLessonQuestion.boardCorrection,
              questionPrompt: null,
              isWaitingForAnswer: false,
              isRequiredQuestion: false,
              isMicActive: false,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              questionPrompt: null,
              isWaitingForAnswer: false,
              isRequiredQuestion: false,
              isMicActive: false,
            }));
          }

          if (autoPlayRef.current) {
            setTimeout(() => showNextBoardItem(), 1000);
          }
        });
      } else if (state.practiceMode) {
        const step = lesson.steps[state.stepIndex];
        if (!step?.practice) return;

        const isCorrect = step.practice.acceptableAnswers.some(
          (a) => a.toLowerCase().trim() === normalized,
        );

        setState((prev) => ({
          ...prev,
          practiceResult: isCorrect ? "correct" : "incorrect",
        }));

        speakAndWait(
          isCorrect
            ? "Correct! Well done."
            : step.practice.hintOnIncorrect || "Let me show you the solution.",
          () => {
            if (!isCorrect) {
              setState((prev) => ({
                ...prev,
                visibleBoardItems: step.practice!.boardSolution,
                questionPrompt: null,
                isWaitingForAnswer: false,
                isMicActive: false,
              }));
            } else {
              setState((prev) => ({
                ...prev,
                questionPrompt: null,
                isWaitingForAnswer: false,
                practiceMode: null,
                isMicActive: false,
              }));
            }

            if (autoPlayRef.current) {
              setTimeout(() => goToNextStep(), 1000);
            }
          },
        );
      }
    },
    [
      state.isRequiredQuestion,
      state.practiceMode,
      state.stepIndex,
      lesson,
      speakAndWait,
      showNextBoardItem,
      goToNextStep,
    ],
  );

  // Complete lesson
  const completeLesson = useCallback(() => {
    stopSpeech();
    if (timerRef.current) clearInterval(timerRef.current);

    setState((prev) => ({
      ...prev,
      mode: "complete",
    }));

    speakAndWait("Congratulations! You have completed this lesson. Great work today!");
  }, [speakAndWait]);

  // Start lesson
  const startLesson = useCallback(() => {
    setWelcomeOpen(false);
    setState((prev) => ({
      ...prev,
      mode: "teaching",
    }));

    speakAndWait(
      `Welcome to today's lesson. Our goal is: ${lesson.objective}. Let's begin.`,
      () => {
        if (autoPlayRef.current) {
          setTimeout(() => showNextBoardItem(), 1000);
        }
      },
    );
  }, [lesson, speakAndWait, showNextBoardItem]);

  // Ask question
  const askQuestion = useCallback(
    (question: string) => {
      setState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          { id: crypto.randomUUID(), sender: "student", message: question },
        ],
      }));

      // Pause auto-play for question
      setState((prev) => ({
        ...prev,
        autoPlay: false,
        isMicActive: true,
        isWaitingForAnswer: true,
      }));

      speakAndWait(`That's a great question. Let me explain. ${question}`, () => {
        // Generate an answer based on current context
        speakAndWait(
          "That's an important point. In quadratic equations, we always look for two numbers that satisfy both conditions simultaneously - their product and their sum.",
          () => {
            setState((prev) => ({
              ...prev,
              autoPlay: autoPlayRef.current,
              isMicActive: false,
              isWaitingForAnswer: false,
              messages: [
                ...prev.messages,
                {
                  id: crypto.randomUUID(),
                  sender: "teacher",
                  message:
                    "That's an important point. In quadratic equations, we always look for two numbers that satisfy both conditions simultaneously - their product and their sum.",
                },
              ],
            }));

            if (autoPlayRef.current) {
              setTimeout(() => showNextBoardItem(), 500);
            }
          },
        );
      });
    },
    [speakAndWait, showNextBoardItem],
  );

  // Handle chat input submit
  const handleChatSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim()) return;

      if (state.isWaitingForAnswer) {
        processAnswer(chatInput.trim());
        setChatInput("");
        return;
      }

      askQuestion(chatInput.trim());
      setChatInput("");
    },
    [chatInput, state.isWaitingForAnswer, processAnswer, askQuestion],
  );

  // Quick action handlers
  const handleQuickAction = useCallback(
    (action: string) => {
      switch (action) {
        case "no_question":
          setState((prev) => ({
            ...prev,
            questionPrompt: null,
            isWaitingForAnswer: false,
            isRequiredQuestion: false,
            isMicActive: false,
          }));
          speakAndWait("Alright, let's continue.", () => {
            if (autoPlayRef.current) {
              showNextBoardItem();
            }
          });
          break;

        case "repeat":
          speakAndWait(currentStep?.teacherNotes || "Let me repeat this.", () => {
            if (autoPlayRef.current) {
              showNextBoardItem();
            }
          });
          break;

        case "simpler":
          speakAndWait(
            currentStep?.accessibility?.simplifiedExplanation || "Let me explain this more simply.",
            () => {
              if (autoPlayRef.current) {
                showNextBoardItem();
              }
            },
          );
          break;

        case "slower":
          setState((prev) => ({ ...prev, speechRate: 0.75 }));
          speakAndWait("I'll slow down now.");
          break;

        case "faster":
          setState((prev) => ({ ...prev, speechRate: 1.25 }));
          speakAndWait("I'll speed up now.");
          break;

        default:
          askQuestion(action);
      }
    },
    [currentStep, speakAndWait, showNextBoardItem, askQuestion],
  );

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const subjectType = getSubjectType(lesson.subject);
  const SubjectIcon = SUBJECT_ICONS[subjectType];
  const subjectColor = SUBJECT_COLORS[subjectType];

  return (
    <div className="classroom-root">
      {/* Header */}
      <header className="classroom-header">
        <Link
          to="/student/dashboard"
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Exit
        </Link>

        <div className="ml-4 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{
                backgroundColor: `${subjectColor}15`,
                color: subjectColor,
                border: `1px solid ${subjectColor}30`,
              }}
            >
              <SubjectIcon className="h-3.5 w-3.5" />
              {lesson.subject}
            </span>
          </div>
          <h1 className="text-sm font-bold text-gray-900 mt-1">{lesson.title}</h1>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-400">Progress</p>
            <p className="text-sm font-bold text-gray-900">{state.progressPercent}%</p>
          </div>

          <div className="h-8 w-px bg-gray-200" />

          <div className="text-right">
            <p className="text-xs text-gray-400">Time</p>
            <p className="text-sm font-bold text-gray-900">{formatTime(state.elapsedSeconds)}</p>
          </div>

          <div className="h-8 w-px bg-gray-200" />

          <button
            onClick={() => setState((prev) => ({ ...prev, showCaptions: !prev.showCaptions }))}
            className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100"
          >
            <Subtitles className="h-4 w-4" />
            CC
          </button>

          <Link
            to="/student/access"
            className="flex items-center gap-2 rounded-lg bg-[var(--crimson-soft)] px-3 py-2 text-xs font-medium text-[var(--crimson)] hover:bg-[var(--crimson-soft)]"
          >
            <Accessibility className="h-4 w-4" />
            Access
          </Link>
        </div>

        {/* Progress bar under header */}
        <div className="classroom-progress-bar">
          <div className="classroom-progress-fill" style={{ width: `${state.progressPercent}%` }} />
        </div>
      </header>

      {/* Main Layout */}
      <div className="classroom-layout">
        {/* Left: Teacher Panel */}
        <aside className="classroom-teacher-panel">
          <div className="teacher-header">
            <span className="teacher-title">AI Teacher</span>
            <div className="teacher-status">
              <span className="teacher-status-dot" />
              Online
            </div>
          </div>

          {/* Avatar */}
          <div className="teacher-avatar-container">
            <div className="teacher-avatar">
              {state.isTeacherSpeaking && <div className="teacher-avatar-speaking-ring" />}
              <div className="teacher-avatar-inner">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
            </div>

            <div className="teacher-speaking-indicator">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="teacher-speaking-bar"
                  style={{ height: `${6 + Math.random() * 10}px` }}
                />
              ))}
            </div>

            <p className="teacher-state-label">
              {state.isTeacherSpeaking
                ? "Speaking..."
                : state.mode === "question"
                  ? "Listening..."
                  : "Ready"}
            </p>
          </div>

          {/* Current Step */}
          <div className="current-step-card">
            <div className="current-step-label">
              <span>Current Step</span>
              <span className="current-step-number">
                {state.stepIndex + 1} of {lesson.steps.length}
              </span>
            </div>
            <p className="current-step-title">{currentStep?.title}</p>
            <p className="current-step-desc">{currentStep?.accessibility?.boardDescription}</p>
          </div>

          {/* Transcript */}
          <div className="transcript-box">
            <div className="transcript-label">
              <MessageSquare className="h-3.5 w-3.5" />
              What teacher said
            </div>
            <div className="transcript-content">
              {state.currentSpeech || "Waiting for lesson to start..."}
            </div>
          </div>

          {/* Speed Controls */}
          <div className="p-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-2">Speech Speed</p>
            <div className="flex gap-1">
              {[0.75, 1, 1.25].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setState((prev) => ({ ...prev, speechRate: rate }))}
                  className={`flex-1 py-2 text-xs font-semibold rounded ${
                    state.speechRate === rate
                      ? "bg-[var(--crimson)] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {/* Auto-play toggle */}
          <div className="p-4 border-t border-gray-100">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-gray-600">Auto-play</span>
              <div
                className={`w-10 h-5 rounded-full transition-colors ${
                  state.autoPlay ? "bg-green-500" : "bg-gray-300"
                }`}
                onClick={() => setState((prev) => ({ ...prev, autoPlay: !prev.autoPlay }))}
              >
                <div
                  className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                    state.autoPlay ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </div>
            </label>
          </div>
        </aside>

        {/* Center: Whiteboard */}
        <div className="classroom-content-panel">
          <div className="whiteboard-container">
            {/* Header */}
            <div className="whiteboard-header">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${subjectColor}15` }}
                >
                  <SubjectIcon className="h-4 w-4" style={{ color: subjectColor }} />
                </div>
                <div>
                  <h2 className="whiteboard-title">{currentStep?.title || "Lesson"}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {currentStep?.accessibility?.boardDescription || "Learning content"}
                  </p>
                </div>
              </div>
              <div className="whiteboard-step-badge">
                <Target className="h-3.5 w-3.5" />
                {currentStep?.key?.replace(/_/g, " ") || "Step"}
              </div>
            </div>

            {/* Whiteboard Content */}
            <div className="whiteboard-content">
              <div className="whiteboard-grid-pattern" />

              {/* Render board items */}
              {state.visibleBoardItems.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className={`whiteboard-item whiteboard-item-${item.type} ${
                    index === state.visibleBoardItems.length - 1 ? "whiteboard-item-active" : ""
                  }`}
                >
                  {item.type === "heading" && <h3 className="font-bold">{item.text}</h3>}
                  {item.type === "bullet" && <p>{item.text}</p>}
                  {item.type === "equation" && <span>{item.text}</span>}
                  {item.type === "calculation" && <span>{item.text}</span>}
                  {item.type === "step_number" && <span>{item.text}</span>}
                  {item.type === "question" && <span>{item.text}</span>}
                  {item.type === "answer" && <span>{item.text}</span>}
                  {item.type === "diagram_label" && (
                    <span className="italic text-gray-500">{item.text}</span>
                  )}
                </div>
              ))}

              {/* Key Concept Card */}
              {currentStep?.learnerNotes && state.visibleBoardItems.length > 2 && (
                <div className="key-concept-card">
                  <div className="key-concept-header">
                    <Lightbulb className="h-4 w-4" />
                    Key Concepts
                  </div>
                  <div className="key-concept-text">
                    {currentStep.learnerNotes.keyPoints.map((point, i) => (
                      <p key={i}>{point}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes Card */}
              {currentStep?.teacherNotes && state.visibleBoardItems.length > 3 && (
                <div className="notes-card">
                  <div className="notes-header">
                    <Notebook className="h-4 w-4" />
                    Teacher's Explanation
                  </div>
                  <div className="notes-text">{currentStep.teacherNotes}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Chat & Settings */}
        <aside className="classroom-side-panel">
          {/* Tabs */}
          <div className="side-panel-tabs">
            {(["steps", "chat", "notes", "settings"] as Panel[]).map((panel) => (
              <button
                key={panel}
                onClick={() => setActivePanel(panel)}
                className={`side-panel-tab ${activePanel === panel ? "side-panel-tab-active" : ""}`}
              >
                {panel === "steps" && <Target className="h-4 w-4" />}
                {panel === "chat" && <MessageSquare className="h-4 w-4" />}
                {panel === "notes" && <Notebook className="h-4 w-4" />}
                {panel === "settings" && <Settings className="h-4 w-4" />}
                <span className="capitalize">{panel}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="side-panel-content">
            {activePanel === "steps" && (
              <div className="steps-timeline">
                {lesson.steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`step-item ${
                      index < state.stepIndex
                        ? "step-item-completed"
                        : index === state.stepIndex
                          ? "step-item-active"
                          : ""
                    }`}
                    onClick={() => {
                      if (index < state.stepIndex) {
                        setState((prev) => ({
                          ...prev,
                          stepIndex: index,
                          boardItemIndex: -1,
                          visibleBoardItems: [],
                        }));
                      }
                    }}
                  >
                    <div
                      className={`step-check ${
                        index < state.stepIndex
                          ? "step-check-completed"
                          : index === state.stepIndex
                            ? "step-check-active"
                            : "step-check-pending"
                      }`}
                    >
                      {index < state.stepIndex ? <CheckCircle2 className="h-3 w-3" /> : index + 1}
                    </div>
                    <span
                      className={`step-label ${
                        index === state.stepIndex ? "step-label-active" : ""
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activePanel === "chat" && (
              <div className="chat-messages-container">
                {state.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`chat-message ${
                      msg.sender === "student" ? "chat-message-user" : "chat-message-ai"
                    }`}
                  >
                    {msg.sender !== "student" && <div className="chat-message-avatar">AI</div>}
                    <div
                      className={`chat-message-bubble ${
                        msg.sender === "student"
                          ? "chat-message-bubble-user"
                          : "chat-message-bubble-ai"
                      }`}
                    >
                      <p>{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activePanel === "notes" && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-4">Lesson Notes</h3>
                <div className="prose prose-sm">
                  <h4>Summary</h4>
                  <p className="text-gray-600">{currentStep?.learnerNotes?.summary}</p>

                  <h4 className="mt-4">Key Points</h4>
                  <ul>
                    {currentStep?.learnerNotes?.keyPoints.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>

                  {currentStep?.learnerNotes?.formulas && (
                    <>
                      <h4 className="mt-4">Formulas</h4>
                      {currentStep.learnerNotes.formulas.map((formula, i) => (
                        <p key={i} className="font-mono text-sm">
                          {formula}
                        </p>
                      ))}
                    </>
                  )}

                  <h4 className="mt-4">Common Mistakes</h4>
                  <ul>
                    {currentStep?.learnerNotes?.commonMistakes.map((mistake, i) => (
                      <li key={i}>{mistake}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activePanel === "settings" && (
              <div>
                <div className="settings-section">
                  <div className="settings-section-title">Accessibility</div>
                  <div className="settings-item">
                    <div>
                      <p className="settings-item-label">Captions</p>
                      <p className="settings-item-desc">Show live transcript</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={state.showCaptions}
                      onChange={(e) =>
                        setState((prev) => ({ ...prev, showCaptions: e.target.checked }))
                      }
                    />
                  </div>
                  <div className="settings-item">
                    <div>
                      <p className="settings-item-label">Speech Rate</p>
                      <p className="settings-item-desc">Teacher speaking speed</p>
                    </div>
                    <p className="text-sm font-bold">{state.speechRate}x</p>
                  </div>
                </div>

                <div className="settings-section">
                  <div className="settings-section-title">Lesson</div>
                  <div className="settings-item">
                    <div>
                      <p className="settings-item-label">Auto-play</p>
                      <p className="settings-item-desc">Continue automatically</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={state.autoPlay}
                      onChange={(e) =>
                        setState((prev) => ({ ...prev, autoPlay: e.target.checked }))
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-bar">
            {state.isWaitingForAnswer ? (
              <>
                <button
                  className="quick-action-btn quick-action-btn-primary"
                  onClick={() => handleQuickAction("no_question")}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Done
                </button>
                <button className="quick-action-btn" onClick={() => handleQuickAction("repeat")}>
                  <Repeat className="h-4 w-4" />
                  Repeat
                </button>
              </>
            ) : (
              <>
                <button className="quick-action-btn" onClick={() => handleQuickAction("simpler")}>
                  <HelpCircle className="h-4 w-4" />
                  Simpler
                </button>
                <button className="quick-action-btn" onClick={() => handleQuickAction("repeat")}>
                  <Repeat className="h-4 w-4" />
                  Repeat
                </button>
                <button
                  className="quick-action-btn"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      speechRate: prev.speechRate === 1 ? 0.75 : prev.speechRate - 0.25,
                    }))
                  }
                >
                  <Zap className="h-4 w-4" />
                  {state.speechRate === 0.75 ? "Normal" : "Slower"}
                </button>
                <button
                  className="quick-action-btn"
                  onClick={() => setChatInput("I have a question: ")}
                >
                  <MessageSquare className="h-4 w-4" />
                  Ask
                </button>
              </>
            )}
          </div>

          {/* Chat Input */}
          <div className="chat-input-container">
            <form onSubmit={handleChatSubmit} className="flex gap-2 w-full">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={
                  state.isWaitingForAnswer ? "Type your answer..." : "Type a question..."
                }
                className="chat-input"
              />
              <button
                type="button"
                onClick={() => {
                  if (state.isMicActive) {
                    stopMicListening();
                    setState((prev) => ({ ...prev, isMicActive: false }));
                  } else {
                    startMicListening();
                    setState((prev) => ({ ...prev, isMicActive: true }));
                  }
                }}
                className={`chat-mic-btn ${state.isMicActive ? "chat-mic-btn-active" : ""}`}
              >
                {state.isMicActive ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              <button type="submit" className="chat-send-btn">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </aside>
      </div>

      {/* Transcript Bar */}
      {state.showCaptions && state.currentSpeech && (
        <div className="transcript-bar">
          <div className="transcript-bar-inner">
            <div className="transcript-bar-content">
              <Subtitles className="transcript-icon h-5 w-5" />
              <div className="transcript-text">
                <span className="transcript-speaker">Teacher:</span> {state.currentSpeech}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audio Control Bar */}
      <div className="audio-control-bar" style={{ bottom: state.showCaptions ? 60 : 0 }}>
        <button
          className="audio-btn"
          onClick={() => setState((prev) => ({ ...prev, autoPlay: !prev.autoPlay }))}
        >
          {state.autoPlay ? <VolumeX className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>

        <div className="audio-speed-group">
          {[0.5, 0.75, 1, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              onClick={() => setState((prev) => ({ ...prev, speechRate: rate }))}
              className={`audio-speed-btn ${state.speechRate === rate ? "audio-speed-btn-active" : ""}`}
            >
              {rate}x
            </button>
          ))}
        </div>

        <div className="audio-divider" />

        <div className="audio-label" onClick={() => handleQuickAction("repeat")}>
          <Repeat className="audio-label-icon" />
          <span className="audio-label-text">Repeat</span>
        </div>

        <div className="audio-label" onClick={() => handleQuickAction("simpler")}>
          <HelpCircle className="audio-label-icon" />
          <span className="audio-label-text">Simpler</span>
        </div>

        <button className="audio-btn audio-btn-danger" onClick={onEndLesson}>
          End Lesson
        </button>
      </div>

      {/* Welcome Overlay */}
      {welcomeOpen && (
        <div className="welcome-overlay">
          <div className="welcome-card">
            <div className="welcome-badge">
              <Sparkles className="h-4 w-4" />
              Welcome to Klassruum
            </div>
            <div className="flex items-center gap-3 mt-6 mb-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: `${subjectColor}18`,
                  border: `2px solid ${subjectColor}30`,
                }}
              >
                <SubjectIcon className="h-7 w-7" style={{ color: subjectColor }} />
              </div>
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: subjectColor }}
                >
                  {lesson.subject}
                </p>
                <h2 className="welcome-title">{lesson.title}</h2>
              </div>
            </div>
            <p className="welcome-subtitle">{lesson.objective}</p>
            <div className="welcome-features">
              {[
                { icon: Volume2, text: "Voice Teaching" },
                { icon: Subtitles, text: "Captions" },
                { icon: Brain, text: "Adaptive" },
                { icon: Accessibility, text: "Accessible" },
              ].map((f) => (
                <div key={f.text} className="welcome-feature">
                  <f.icon className="welcome-feature-icon h-4 w-4" />
                  <span className="welcome-feature-text">{f.text}</span>
                </div>
              ))}
            </div>
            <div className="welcome-actions">
              <Button size="lg" className="shadow-lg" onClick={startLesson}>
                <Play className="mr-2 h-4 w-4" />
                Start Lesson
              </Button>
              <Button size="lg" variant="outline" onClick={() => setWelcomeOpen(false)}>
                Preview Content
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Question Prompt */}
      {state.questionPrompt && state.isWaitingForAnswer && (
        <div className="question-prompt-overlay">
          <div className="question-prompt-card">
            <div className="question-prompt-badge">
              {state.isRequiredQuestion
                ? "Required Question"
                : state.practiceMode
                  ? `${state.practiceMode === "guided" ? "Guided" : "Independent"} Practice`
                  : "Checkpoint"}
            </div>
            <h3 className="question-prompt-text">{state.questionPrompt}</h3>
            <p className="question-prompt-subtext">
              {state.isRequiredQuestion ? "Answer to continue" : "Type or speak your answer"}
            </p>

            {/* Mic Active Indicator */}
            {state.isMicActive && (
              <div className="mic-active-indicator">
                <div className="mic-pulse">
                  <Mic className="h-5 w-5 text-white" />
                </div>
                <div className="mic-active-text">
                  <p className="mic-active-label">Listening for your answer...</p>
                  <p className="mic-active-sub">Speak now, or type below</p>
                </div>
              </div>
            )}

            <div className="question-input-container">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your answer..."
                className="question-input"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && chatInput.trim()) {
                    processAnswer(chatInput.trim());
                    setChatInput("");
                  }
                }}
              />
            </div>

            <div className="question-actions">
              <button
                className="question-action-btn question-action-btn-primary"
                onClick={() => {
                  if (chatInput.trim()) {
                    processAnswer(chatInput.trim());
                    setChatInput("");
                  }
                }}
              >
                Submit Answer
              </button>
              {!state.isRequiredQuestion && (
                <button
                  className="question-action-btn question-action-btn-secondary"
                  onClick={() => handleQuickAction("no_question")}
                >
                  Skip
                </button>
              )}
              <button
                className="question-action-btn question-action-btn-secondary"
                onClick={() => handleQuickAction("repeat")}
              >
                Repeat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
