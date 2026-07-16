import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  forwardRef,
} from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Accessibility,
  Play,
  Pause,
  RotateCcw,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Subtitles,
  MessageSquare,
  Send,
  HelpCircle,
  Lightbulb,
  SkipBack,
  SkipForward,
  Download,
  Eye,
  EyeOff,
  PenTool,
  X,
  Check,
  Loader2,
  Brain,
  Sparkles,
  BookOpen,
  ChevronRight,
  RefreshCw,
  Hand,
  FileText,
  Clock,
  Target,
  Award,
  AlertCircle,
  ChevronLeft,
  Plus,
  Save,
  Home,
  Video,
  VideoOff,
  Users,
  MonitorUp,
  HandMetal,
  Wifi,
  WifiOff,
  CircleDot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  speak,
  stopSpeech,
  pauseSpeech,
  resumeSpeech,
  startListening,
  stopListening as stopVoiceListening,
} from "@/lib/speech";
import type {
  VideoClassroomState,
  LearningMode,
  TeacherVideoState,
  BoardWriteItem,
  TranscriptEntry,
  WritingSpeed,
  BlindQuestionState,
  ClassroomContext,
  VideoSessionState,
  VideoConnectionStatus,
  VideoParticipantState,
} from "@/lib/types";
import {
  DEMO_LESSON,
  type Lesson,
  type LessonStep,
  type LessonCompletionSummary,
  type ClassroomEvent,
  type RequiredLessonQuestion,
  type PracticeBlock,
  type ExitTicket,
  type QuestionCheckpoint,
  type LearnerNotes,
} from "@/lib/lesson-models";

/* ─── Sample Board Sequence (kept for fallback) ──────────────── */

const SAMPLE_BOARD_SEQUENCE: BoardWriteItem[] = [
  {
    id: "b1",
    type: "heading",
    text: "Solving Quadratic Equations",
    readExactly: true,
    accessibleDescription: "The board title is Solving Quadratic Equations.",
  },
  {
    id: "b2",
    type: "equation",
    text: "x² + 5x + 6 = 0",
    readExactly: true,
    accessibleDescription: "The board shows x squared plus five x plus six equals zero.",
  },
  {
    id: "b3",
    type: "bullet",
    text: "Find two numbers that multiply to 6.",
    readExactly: true,
    explanation: "We are looking for a factor pair of six.",
    accessibleDescription: "The instruction is to find two numbers that multiply to six.",
  },
  {
    id: "b4",
    type: "bullet",
    text: "The same numbers must add to 5.",
    readExactly: true,
    explanation: "This is because the middle term is five x.",
    accessibleDescription: "The same two numbers must also add to five.",
  },
  {
    id: "b5",
    type: "calculation",
    text: "2 × 3 = 6  and  2 + 3 = 5",
    readExactly: true,
    accessibleDescription: "Two times three equals six, and two plus three equals five.",
  },
  {
    id: "b6",
    type: "answer",
    text: "x = -2  or  x = -3",
    readExactly: true,
    accessibleDescription: "The answers are x equals negative two or x equals negative three.",
  },
];

/* ─── Lesson Step Board Maps ─────────────────────────────────── */

const STEP_BOARDS: Record<string, BoardWriteItem[]> = {
  hook: [
    {
      id: "h1",
      type: "heading",
      text: "Quadratic Equations",
      readExactly: true,
      accessibleDescription: "Title: Quadratic Equations.",
    },
    {
      id: "h2",
      type: "bullet",
      text: "We will move from big idea to worked example.",
      readExactly: true,
      accessibleDescription: "We will move from big idea to worked example.",
    },
    {
      id: "h3",
      type: "bullet",
      text: "Then practice, quiz, and summary.",
      readExactly: true,
      accessibleDescription: "Then practice, quiz, and summary.",
    },
  ],
  concept: [
    {
      id: "c1",
      type: "heading",
      text: "Quadratic Form",
      readExactly: true,
      accessibleDescription: "Title: Quadratic Form.",
    },
    {
      id: "c2",
      type: "equation",
      text: "ax² + bx + c = 0",
      readExactly: true,
      accessibleDescription: "a x squared plus b x plus c equals zero.",
    },
    {
      id: "c3",
      type: "bullet",
      text: "a cannot be 0.",
      readExactly: true,
      accessibleDescription: "a cannot be zero.",
    },
  ],
  worked_example: [
    {
      id: "w1",
      type: "heading",
      text: "Worked Example",
      readExactly: true,
      accessibleDescription: "Title: Worked Example.",
    },
    {
      id: "w2",
      type: "equation",
      text: "x² - 5x + 6 = 0",
      readExactly: true,
      accessibleDescription: "x squared minus five x plus six equals zero.",
    },
    {
      id: "w3",
      type: "calculation",
      text: "(x - 2)(x - 3) = 0",
      readExactly: true,
      accessibleDescription:
        "Open paren x minus 2 close paren times open paren x minus 3 close paren equals zero.",
    },
    {
      id: "w4",
      type: "answer",
      text: "x = 2  or  x = 3",
      readExactly: true,
      accessibleDescription: "x equals 2 or x equals 3.",
    },
  ],
  guided_practice: [
    {
      id: "g1",
      type: "heading",
      text: "Practice Together",
      readExactly: true,
      accessibleDescription: "Title: Practice Together.",
    },
    {
      id: "g2",
      type: "equation",
      text: "x² + 7x + 12 = 0",
      readExactly: true,
      accessibleDescription: "x squared plus seven x plus twelve equals zero.",
    },
    {
      id: "g3",
      type: "bullet",
      text: "Which pair works?",
      readExactly: true,
      accessibleDescription: "Which pair of numbers works?",
    },
    {
      id: "g4",
      type: "answer",
      text: "3 and 4",
      readExactly: true,
      accessibleDescription: "The answer is 3 and 4.",
    },
  ],
  independent_question: [
    {
      id: "i1",
      type: "heading",
      text: "Your Turn",
      readExactly: true,
      accessibleDescription: "Title: Your Turn.",
    },
    {
      id: "i2",
      type: "equation",
      text: "x² - 8x + 15 = 0",
      readExactly: true,
      accessibleDescription: "x squared minus eight x plus fifteen equals zero.",
    },
    {
      id: "i3",
      type: "bullet",
      text: "Think of the pair.",
      readExactly: true,
      accessibleDescription: "Think of the pair of numbers.",
    },
    {
      id: "i4",
      type: "bullet",
      text: "Write your answer.",
      readExactly: true,
      accessibleDescription: "Write your answer.",
    },
  ],
  correction: [
    {
      id: "r1",
      type: "heading",
      text: "Let's Review",
      readExactly: true,
      accessibleDescription: "Title: Let's Review.",
    },
    {
      id: "r2",
      type: "bullet",
      text: "We need numbers that multiply to 15.",
      readExactly: true,
      accessibleDescription: "We need numbers that multiply to fifteen.",
    },
    {
      id: "r3",
      type: "bullet",
      text: "and add to -8.",
      readExactly: true,
      accessibleDescription: "and add to negative eight.",
    },
    {
      id: "r4",
      type: "answer",
      text: "x = 3  or  x = 5",
      readExactly: true,
      accessibleDescription: "x equals three or x equals five.",
    },
  ],
  quiz: [
    {
      id: "q1",
      type: "heading",
      text: "Quiz Time",
      readExactly: true,
      accessibleDescription: "Title: Quiz Time.",
    },
    {
      id: "q2",
      type: "question",
      text: "Solve: x² - 9x + 20 = 0",
      readExactly: true,
      accessibleDescription: "Solve: x squared minus nine x plus twenty equals zero.",
    },
    {
      id: "q3",
      type: "bullet",
      text: "Choose carefully.",
      readExactly: true,
      accessibleDescription: "Choose carefully.",
    },
  ],
  summary: [
    {
      id: "s1",
      type: "heading",
      text: "Summary",
      readExactly: true,
      accessibleDescription: "Title: Summary.",
    },
    {
      id: "s2",
      type: "bullet",
      text: "Write in standard form.",
      readExactly: true,
      accessibleDescription: "Step one: Write in standard form.",
    },
    {
      id: "s3",
      type: "bullet",
      text: "Find the right pair.",
      readExactly: true,
      accessibleDescription: "Step two: Find the right pair.",
    },
    {
      id: "s4",
      type: "bullet",
      text: "Factor and solve.",
      readExactly: true,
      accessibleDescription: "Step three: Factor and solve.",
    },
  ],
};

const STEP_ORDER = [
  "hook",
  "concept",
  "worked_example",
  "guided_practice",
  "independent_question",
  "correction",
  "quiz",
  "summary",
] as const;

const LEARNING_MODES: { key: LearningMode; label: string }[] = [
  { key: "standard", label: "Standard" },
  { key: "deaf", label: "Deaf / Hard of Hearing" },
  { key: "blind", label: "Blind / Low Vision" },
  { key: "low_vision", label: "Low Vision" },
  { key: "deaf_blind", label: "Deaf-Blind" },
  { key: "dyslexia", label: "Dyslexia" },
  { key: "adhd_focus", label: "ADHD / Focus" },
  { key: "motor_support", label: "Motor Support" },
  { key: "speech_difficulty", label: "Speech Difficulty" },
  { key: "extra_support", label: "Extra Support" },
  { key: "challenge", label: "Challenge" },
];

/* ─── Writing speed config ───────────────────────────────────── */

function getCharDelay(speed?: WritingSpeed, mode?: LearningMode): number {
  const base =
    mode === "adhd_focus" || mode === "extra_support" ? 55 : mode === "dyslexia" ? 60 : 40;
  if (speed === "slow") return base + 30;
  if (speed === "fast") return Math.max(15, base - 15);
  return base;
}

function getLinePause(mode?: LearningMode): number {
  return mode === "adhd_focus" ? 1200 : 800;
}

/* ─── Classroom Event Tracker ────────────────────────────────── */

const trackedEvents: ClassroomEvent[] = [];

function trackEvent(event: ClassroomEvent) {
  trackedEvents.push(event);
  // In production, this would send to analytics backend
  console.log("[ClassroomEvent]", event.type, event);
}

/* ─── Completion State ───────────────────────────────────────── */

type CompletionTracking = {
  middleQuestionAnswered: boolean;
  middleQuestionCorrect: boolean;
  guidedPracticeAttempted: boolean;
  guidedPracticeCorrect: boolean;
  independentPracticeAttempted: boolean;
  independentPracticeCorrect: boolean;
  exitTicketAnswered: boolean;
  exitTicketCorrect: boolean;
  questionsAskedCount: number;
  lessonCompleted: boolean;
  summaryViewed: boolean;
  notesSaved: boolean;
  weakAreas: string[];
};

const INITIAL_COMPLETION: CompletionTracking = {
  middleQuestionAnswered: false,
  middleQuestionCorrect: false,
  guidedPracticeAttempted: false,
  guidedPracticeCorrect: false,
  independentPracticeAttempted: false,
  independentPracticeCorrect: false,
  exitTicketAnswered: false,
  exitTicketCorrect: false,
  questionsAskedCount: 0,
  lessonCompleted: false,
  summaryViewed: false,
  notesSaved: false,
  weakAreas: [],
};

/* ─── Initial State ──────────────────────────────────────────── */

function createInitialState(sessionId: string, learningMode: LearningMode): VideoClassroomState {
  const firstStepKey = STEP_ORDER[0];
  return {
    sessionId,
    learningMode,
    teacherState: "preparing",
    teacherMode: "ai_teacher",
    boardState: {
      items: STEP_BOARDS[firstStepKey] ?? SAMPLE_BOARD_SEQUENCE,
      currentItemIndex: 0,
      writtenItems: [],
      isWriting: false,
      autoScroll: true,
      currentWrittenText: "",
    },
    audioState: {
      enabled: learningMode !== "deaf" && learningMode !== "deaf_blind",
      playing: false,
      rate: learningMode === "adhd_focus" || learningMode === "extra_support" ? 0.85 : 1,
      lockedOnForBlindMode: learningMode === "blind",
    },
    questionState: {
      isPromptOpen: false,
      inputMode:
        learningMode === "blind"
          ? "voice"
          : learningMode === "speech_difficulty"
            ? "quick_action"
            : "text",
      isListening: false,
      transcript: "",
      blindState: undefined,
    },
    replayState: { isReplayMode: false },
    captions: {
      enabled: learningMode !== "blind",
      currentText: "",
    },
    transcript: [],
    progress: {
      stepIndex: 0,
      totalSteps: STEP_ORDER.length,
      percentage: Math.round((1 / STEP_ORDER.length) * 100),
    },
  };
}

/* ─── Reducer Actions ────────────────────────────────────────── */

type Action =
  | { type: "SET_TEACHER_STATE"; state: TeacherVideoState }
  | { type: "SET_WRITING"; isWriting: boolean; currentText: string }
  | { type: "FINISH_ITEM"; item: BoardWriteItem }
  | { type: "SET_CURRENT_ITEM_INDEX"; index: number }
  | { type: "SET_BOARD_ITEMS"; items: BoardWriteItem[] }
  | { type: "SET_AUDIO_PLAYING"; playing: boolean }
  | { type: "SET_AUDIO_ENABLED"; enabled: boolean }
  | { type: "SET_CAPTION"; text: string }
  | { type: "TOGGLE_CAPTIONS" }
  | { type: "OPEN_QUESTION" }
  | { type: "CLOSE_QUESTION" }
  | { type: "SET_LISTENING"; isListening: boolean; transcript: string }
  | { type: "SET_BLIND_STATE"; blindState: BlindQuestionState | undefined }
  | { type: "ADD_TRANSCRIPT"; entry: TranscriptEntry }
  | { type: "SET_LEARNING_MODE"; mode: LearningMode }
  | { type: "SET_STEP_INDEX"; index: number }
  | { type: "START_REPLAY"; fromIndex?: number }
  | { type: "STOP_REPLAY" }
  | { type: "RESET_BOARD" }
  | { type: "SET_AUTO_SCROLL"; autoScroll: boolean };

function reducer(state: VideoClassroomState, action: Action): VideoClassroomState {
  switch (action.type) {
    case "SET_TEACHER_STATE":
      return { ...state, teacherState: action.state };
    case "SET_WRITING":
      return {
        ...state,
        boardState: {
          ...state.boardState,
          isWriting: action.isWriting,
          currentWrittenText: action.currentText,
        },
      };
    case "FINISH_ITEM":
      return {
        ...state,
        boardState: {
          ...state.boardState,
          writtenItems: [...state.boardState.writtenItems, action.item],
          currentWrittenText: "",
          isWriting: false,
        },
      };
    case "SET_CURRENT_ITEM_INDEX":
      return { ...state, boardState: { ...state.boardState, currentItemIndex: action.index } };
    case "SET_BOARD_ITEMS":
      return {
        ...state,
        boardState: {
          ...state.boardState,
          items: action.items,
          writtenItems: [],
          currentItemIndex: 0,
          currentWrittenText: "",
          isWriting: false,
        },
      };
    case "SET_AUDIO_PLAYING":
      return { ...state, audioState: { ...state.audioState, playing: action.playing } };
    case "SET_AUDIO_ENABLED":
      return { ...state, audioState: { ...state.audioState, enabled: action.enabled } };
    case "SET_CAPTION":
      return { ...state, captions: { ...state.captions, currentText: action.text } };
    case "TOGGLE_CAPTIONS":
      return { ...state, captions: { ...state.captions, enabled: !state.captions.enabled } };
    case "OPEN_QUESTION":
      return { ...state, questionState: { ...state.questionState, isPromptOpen: true } };
    case "CLOSE_QUESTION":
      return {
        ...state,
        questionState: {
          ...state.questionState,
          isPromptOpen: false,
          transcript: "",
          isListening: false,
          blindState: undefined,
        },
      };
    case "SET_LISTENING":
      return {
        ...state,
        questionState: {
          ...state.questionState,
          isListening: action.isListening,
          transcript: action.transcript,
        },
      };
    case "SET_BLIND_STATE":
      return { ...state, questionState: { ...state.questionState, blindState: action.blindState } };
    case "ADD_TRANSCRIPT": {
      return { ...state, transcript: [...state.transcript, action.entry] };
    }
    case "SET_LEARNING_MODE": {
      const m = action.mode;
      return {
        ...state,
        learningMode: m,
        audioState: {
          ...state.audioState,
          enabled: m !== "deaf" && m !== "deaf_blind",
          lockedOnForBlindMode: m === "blind",
          rate: m === "adhd_focus" || m === "extra_support" ? 0.85 : 1,
        },
        captions: { ...state.captions, enabled: m !== "blind" },
        questionState: {
          ...state.questionState,
          inputMode: m === "blind" ? "voice" : m === "speech_difficulty" ? "quick_action" : "text",
        },
      };
    }
    case "SET_STEP_INDEX": {
      const pct = Math.round(((action.index + 1) / state.progress.totalSteps) * 100);
      return {
        ...state,
        progress: { ...state.progress, stepIndex: action.index, percentage: pct },
      };
    }
    case "START_REPLAY":
      return {
        ...state,
        replayState: { isReplayMode: true, replayFromIndex: action.fromIndex ?? 0 },
        boardState: {
          ...state.boardState,
          writtenItems: [],
          currentItemIndex: action.fromIndex ?? 0,
          currentWrittenText: "",
          isWriting: false,
        },
      };
    case "STOP_REPLAY":
      return { ...state, replayState: { isReplayMode: false, replayFromIndex: undefined } };
    case "RESET_BOARD":
      return {
        ...state,
        boardState: {
          ...state.boardState,
          writtenItems: [],
          currentItemIndex: 0,
          currentWrittenText: "",
          isWriting: false,
        },
      };
    case "SET_AUTO_SCROLL":
      return { ...state, boardState: { ...state.boardState, autoScroll: action.autoScroll } };
    default:
      return state;
  }
}

/* ─── Main Component ─────────────────────────────────────────── */

interface VideoClassroomPageProps {
  classroomContext?: ClassroomContext;
  sessionId?: string;
  onEndLesson?: () => void;
}

export function VideoClassroomPage({
  classroomContext,
  sessionId = "demo-session",
  onEndLesson,
}: VideoClassroomPageProps) {
  const initialState = useMemo(
    () =>
      createInitialState(
        sessionId,
        classroomContext?.learnerAccessProfile?.lessonPace === "slow"
          ? "extra_support"
          : "standard",
      ),
    [sessionId, classroomContext?.learnerAccessProfile?.lessonPace],
  );
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isPaused, setIsPaused] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showModeSwitcher, setShowModeSwitcher] = useState(false);
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const [showLessonTimeline, setShowLessonTimeline] = useState(false);
  const [questionInput, setQuestionInput] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [lastCheckpointMinute, setLastCheckpointMinute] = useState(0);
  const [showRequiredQuestion, setShowRequiredQuestion] = useState(false);
  const [showPractice, setShowPractice] = useState(false);
  const [showExitTicket, setShowExitTicket] = useState(false);
  const [showCompletionSummary, setShowCompletionSummary] = useState(false);
  const [practiceAnswer, setPracticeAnswer] = useState("");
  const [practiceResult, setPracticeResult] = useState<"correct" | "incorrect" | null>(null);
  const [exitTicketAnswer, setExitTicketAnswer] = useState("");
  const [exitTicketResult, setExitTicketResult] = useState<"correct" | "incorrect" | null>(null);
  const [requiredQuestionAnswer, setRequiredQuestionAnswer] = useState("");
  const [requiredQuestionResult, setRequiredQuestionResult] = useState<
    "correct" | "incorrect" | null
  >(null);
  const [userNotes, setUserNotes] = useState<string[]>([]);
  const [userNoteInput, setUserNoteInput] = useState("");
  const [completion, setCompletion] = useState<CompletionTracking>(INITIAL_COMPLETION);

  const boardRef = useRef<HTMLDivElement>(null);
  const writingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recognitionRef = useRef<any>(null);
  const isPlayingRef = useRef(false);
  const currentCharIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lessonRef = useRef(DEMO_LESSON);

  const lesson = classroomContext?.lesson;
  const institution = classroomContext?.institution;
  const course = classroomContext?.course;
  const activeLesson = lessonRef.current;

  const currentStepLabel =
    STEP_ORDER[state.progress.stepIndex]
      ?.replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) ?? "Hook";

  /* ── Cleanup ─────────────────────────────────────────────── */
  useEffect(() => {
    return () => {
      stopSpeech();
      stopVoiceListening(recognitionRef.current);
      if (writingTimerRef.current) clearTimeout(writingTimerRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  /* ── Elapsed time tracker ──────────────────────────────────── */
  useEffect(() => {
    if (isPlayingRef.current && !isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  /* ── 5-minute question checkpoint ──────────────────────────── */
  useEffect(() => {
    const currentMinute = Math.floor(elapsedSeconds / 300); // every 5 minutes
    if (
      currentMinute > lastCheckpointMinute &&
      currentMinute > 0 &&
      isPlayingRef.current &&
      !showRequiredQuestion &&
      !showPractice &&
      !showExitTicket &&
      !state.questionState.isPromptOpen
    ) {
      setLastCheckpointMinute(currentMinute);
      triggerCheckpoint(currentMinute);
    }
  }, [elapsedSeconds, lastCheckpointMinute]);

  /* ── Required middle question at 50% ───────────────────────── */
  useEffect(() => {
    if (
      state.progress.percentage >= 50 &&
      !completion.middleQuestionAnswered &&
      isPlayingRef.current &&
      !showRequiredQuestion &&
      !showPractice &&
      !state.questionState.isPromptOpen
    ) {
      triggerRequiredMiddleQuestion();
    }
  }, [state.progress.percentage, completion.middleQuestionAnswered]);

  /* ── Auto-scroll board ───────────────────────────────────── */
  useEffect(() => {
    if (state.boardState.autoScroll && boardRef.current) {
      boardRef.current.scrollTop = boardRef.current.scrollHeight;
    }
  }, [
    state.boardState.writtenItems,
    state.boardState.currentWrittenText,
    state.boardState.autoScroll,
  ]);

  /* ── Animate writing a board item ────────────────────────── */
  const animateItem = useCallback(
    (item: BoardWriteItem) => {
      return new Promise<void>((resolve) => {
        dispatch({ type: "SET_TEACHER_STATE", state: "writing" });
        dispatch({ type: "SET_WRITING", isWriting: true, currentText: "" });
        dispatch({ type: "SET_CAPTION", text: item.accessibleDescription });

        trackEvent({
          type: "board_item_written",
          itemId: item.id,
          timestamp: new Date().toISOString(),
        });

        const delay = getCharDelay(item.writingSpeed, state.learningMode);
        const text = item.text;
        let charIndex = 0;
        currentCharIndexRef.current = 0;

        const writeNextChar = () => {
          if (charIndex < text.length && isPlayingRef.current) {
            charIndex++;
            currentCharIndexRef.current = charIndex;
            dispatch({
              type: "SET_WRITING",
              isWriting: true,
              currentText: text.slice(0, charIndex),
            });

            const charDelay = text[charIndex - 1] === " " ? delay + 30 : delay;
            writingTimerRef.current = setTimeout(writeNextChar, charDelay);
          } else if (charIndex >= text.length) {
            dispatch({ type: "FINISH_ITEM", item });
            resolve();
          } else {
            resolve();
          }
        };

        isPlayingRef.current = true;
        writeNextChar();
      });
    },
    [state.learningMode],
  );

  /* ── Speak text ──────────────────────────────────────────── */
  const speakText = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve) => {
        if (!state.audioState.enabled) {
          resolve();
          return;
        }
        dispatch({ type: "SET_AUDIO_PLAYING", playing: true });
        dispatch({ type: "SET_CAPTION", text });
        speak(text, () => {
          dispatch({ type: "SET_AUDIO_PLAYING", playing: false });
          resolve();
        });
      });
    },
    [state.audioState.enabled],
  );

  /* ── Play a single board item: write → read → explain ───── */
  const playBoardItem = useCallback(
    async (item: BoardWriteItem) => {
      // 1. Teacher writes on board
      await animateItem(item);

      // Short pause after writing
      await new Promise<void>((r) => setTimeout(r, getLinePause(state.learningMode)));

      // 2. Teacher reads exact text (the exact-read rule)
      dispatch({ type: "SET_TEACHER_STATE", state: "speaking" });
      if (item.readExactly) {
        trackEvent({
          type: "teacher_read_board_item",
          itemId: item.id,
          timestamp: new Date().toISOString(),
        });
        await speakText(item.text);
      }

      // 3. Teacher gives deeper explanation if available
      if (item.explanation) {
        dispatch({ type: "SET_TEACHER_STATE", state: "explaining" });
        trackEvent({
          type: "teacher_explained_item",
          itemId: item.id,
          timestamp: new Date().toISOString(),
        });
        await speakText(item.explanation);
      }

      // Add to transcript
      dispatch({
        type: "ADD_TRANSCRIPT",
        entry: {
          id: crypto.randomUUID(),
          role: "board",
          text: item.text + (item.explanation ? ` — ${item.explanation}` : ""),
          timestamp: new Date().toISOString(),
          boardItemId: item.id,
        },
      });
    },
    [animateItem, speakText, state.learningMode],
  );

  /* ── Trigger 5-min checkpoint ──────────────────────────────── */
  const triggerCheckpoint = useCallback(
    (minute: number) => {
      dispatch({ type: "SET_TEACHER_STATE", state: "asking_question" });
      dispatch({ type: "OPEN_QUESTION" });
      dispatch({
        type: "ADD_TRANSCRIPT",
        entry: {
          id: crypto.randomUUID(),
          role: "teacher",
          text: "Do you have any question before we continue?",
          timestamp: new Date().toISOString(),
        },
      });
      trackEvent({
        type: "question_checkpoint_triggered",
        checkpointId: `checkpoint_${minute}`,
        timestamp: new Date().toISOString(),
      });
      speakText("Do you have any question before we continue?");
    },
    [speakText],
  );

  /* ── Play lesson ref to break circular dependency ──────────── */
  const playLessonRef = useRef<() => Promise<void>>(async () => {});

  /* ── Trigger required middle question ──────────────────────── */
  const triggerRequiredMiddleQuestion = useCallback(() => {
    isPlayingRef.current = false;
    setIsPaused(true);
    setShowRequiredQuestion(true);
    dispatch({ type: "SET_TEACHER_STATE", state: "asking_question" });
    dispatch({ type: "SET_CAPTION", text: activeLesson.requiredMidLessonQuestion.questionText });

    trackEvent({
      type: "required_question_asked",
      questionId: activeLesson.requiredMidLessonQuestion.id,
      timestamp: new Date().toISOString(),
    });

    speakText(activeLesson.requiredMidLessonQuestion.questionText);
  }, [speakText, activeLesson]);

  /* ── Handle required question answer ───────────────────────── */
  const handleRequiredQuestionSubmit = useCallback(() => {
    const q = activeLesson.requiredMidLessonQuestion;
    const normalized = requiredQuestionAnswer.toLowerCase().trim();
    const isCorrect = q.acceptableAnswers.some((a) => a.toLowerCase().trim() === normalized);

    setRequiredQuestionResult(isCorrect ? "correct" : "incorrect");
    setCompletion((prev) => ({
      ...prev,
      middleQuestionAnswered: true,
      middleQuestionCorrect: isCorrect,
      weakAreas: isCorrect ? prev.weakAreas : [...prev.weakAreas, "Factoring number pairs"],
    }));

    trackEvent({
      type: "required_question_answered",
      questionId: q.id,
      correct: isCorrect,
      timestamp: new Date().toISOString(),
    });

    if (isCorrect) {
      speakText(q.feedbackCorrect).then(() => {
        dispatch({ type: "SET_TEACHER_STATE", state: "encouraging" });
        setTimeout(() => {
          setShowRequiredQuestion(false);
          setIsPaused(false);
          isPlayingRef.current = true;
          setRequiredQuestionAnswer("");
          setRequiredQuestionResult(null);
          playLessonRef.current();
        }, 1500);
      });
    } else {
      speakText(q.feedbackIncorrect).then(() => {
        dispatch({ type: "SET_TEACHER_STATE", state: "correcting" });
        // Show board correction - cast to types.BoardWriteItem
        q.boardCorrection.forEach((item) => {
          dispatch({ type: "FINISH_ITEM", item: item as BoardWriteItem });
        });
        setTimeout(() => {
          setShowRequiredQuestion(false);
          setIsPaused(false);
          isPlayingRef.current = true;
          setRequiredQuestionAnswer("");
          setRequiredQuestionResult(null);
          playLessonRef.current();
        }, 3000);
      });
    }
  }, [requiredQuestionAnswer, activeLesson, speakText]);

  /* ── Practice handling ─────────────────────────────────────── */
  const startPractice = useCallback(
    (type: "guided" | "independent") => {
      const stepIndex = type === "guided" ? 3 : 4; // guided_practice or independent_question
      const stepKey = STEP_ORDER[stepIndex];
      const practiceStep = activeLesson.steps.find(
        (s) => s.key === stepKey || s.id === `step_${stepIndex + 1}`,
      );
      if (!practiceStep?.practice) return;

      setShowPractice(true);
      setPracticeResult(null);
      setPracticeAnswer("");
      isPlayingRef.current = false;
      setIsPaused(true);
      dispatch({ type: "SET_TEACHER_STATE", state: "asking_question" });

      if (type === "guided") {
        trackEvent({
          type: "guided_practice_started",
          practiceId: practiceStep.practice.id,
          timestamp: new Date().toISOString(),
        });
      } else {
        trackEvent({
          type: "independent_practice_started",
          practiceId: practiceStep.practice.id,
          timestamp: new Date().toISOString(),
        });
      }

      speakText(
        type === "guided"
          ? `Let's practice together. ${practiceStep.practice.problemText}`
          : `Now it's your turn. ${practiceStep.practice.problemText}`,
      );
    },
    [activeLesson, speakText],
  );

  const handlePracticeSubmit = useCallback(() => {
    const stepIndex = practiceAnswer ? 3 : 4;
    // Find current practice
    const guidedStep = activeLesson.steps.find((s) => s.practice?.type === "guided");
    const independentStep = activeLesson.steps.find((s) => s.practice?.type === "independent");
    const currentPractice = showPractice ? guidedStep?.practice || independentStep?.practice : null;

    if (!currentPractice) return;

    const normalized = practiceAnswer.toLowerCase().trim();
    const isCorrect = currentPractice.acceptableAnswers.some(
      (a) => a.toLowerCase().trim() === normalized,
    );

    setPracticeResult(isCorrect ? "correct" : "incorrect");

    const isGuided = currentPractice.type === "guided";
    setCompletion((prev) => ({
      ...prev,
      guidedPracticeAttempted: isGuided ? true : prev.guidedPracticeAttempted,
      guidedPracticeCorrect: isGuided && isCorrect ? true : prev.guidedPracticeCorrect,
      independentPracticeAttempted: !isGuided ? true : prev.independentPracticeAttempted,
      independentPracticeCorrect: !isGuided && isCorrect ? true : prev.independentPracticeCorrect,
      weakAreas: isCorrect
        ? prev.weakAreas
        : [
            ...prev.weakAreas,
            currentPractice.type === "guided" ? "Guided practice" : "Independent practice",
          ],
    }));

    trackEvent({
      type: "practice_answer_submitted",
      practiceId: currentPractice.id,
      correct: isCorrect,
      timestamp: new Date().toISOString(),
    });

    if (isCorrect) {
      dispatch({ type: "SET_TEACHER_STATE", state: "encouraging" });
      speakText("Correct! Well done.").then(() => {
        setTimeout(() => {
          setShowPractice(false);
          setPracticeAnswer("");
          setPracticeResult(null);
          setIsPaused(false);
          isPlayingRef.current = true;
        }, 2000);
      });
    } else {
      dispatch({ type: "SET_TEACHER_STATE", state: "correcting" });
      speakText(currentPractice.hintOnIncorrect || "Let me show you the solution.").then(() => {
        // Show solution on board
        currentPractice.boardSolution.forEach((item) => {
          dispatch({ type: "FINISH_ITEM", item });
        });
        setTimeout(() => {
          setShowPractice(false);
          setPracticeAnswer("");
          setPracticeResult(null);
          setIsPaused(false);
          isPlayingRef.current = true;
        }, 3000);
      });
    }
  }, [practiceAnswer, activeLesson, speakText, showPractice]);

  /* ── Exit ticket handling ──────────────────────────────────── */
  const triggerExitTicket = useCallback(() => {
    if (!activeLesson.exitTicket) return;
    setShowExitTicket(true);
    setExitTicketAnswer("");
    setExitTicketResult(null);
    isPlayingRef.current = false;
    setIsPaused(true);
    dispatch({ type: "SET_TEACHER_STATE", state: "asking_question" });
    speakText(activeLesson.exitTicket.questionText);
  }, [activeLesson, speakText]);

  const handleExitTicketSubmit = useCallback(() => {
    if (!activeLesson.exitTicket) return;
    const normalized = exitTicketAnswer.toLowerCase().trim();
    const isCorrect = activeLesson.exitTicket.acceptableAnswers.some(
      (a) => a.toLowerCase().trim() === normalized,
    );

    setExitTicketResult(isCorrect ? "correct" : "incorrect");
    setCompletion((prev) => ({
      ...prev,
      exitTicketAnswered: true,
      exitTicketCorrect: isCorrect,
    }));

    trackEvent({
      type: "exit_ticket_submitted",
      correct: isCorrect,
      timestamp: new Date().toISOString(),
    });

    speakText(
      isCorrect
        ? activeLesson.exitTicket.feedback
        : "Not quite. Remember: the numbers must multiply to c and add to b.",
    ).then(() => {
      setTimeout(() => {
        setShowExitTicket(false);
        completeLesson();
      }, 2000);
    });
  }, [exitTicketAnswer, activeLesson, speakText]);

  /* ── Complete lesson ────────────────────────────────────────── */
  const completeLesson = useCallback(() => {
    setCompletion((prev) => ({ ...prev, lessonCompleted: true }));
    setShowCompletionSummary(true);
    dispatch({ type: "SET_TEACHER_STATE", state: "encouraging" });

    const summary: LessonCompletionSummary = {
      sessionId,
      lessonId: activeLesson.id,
      timeSpentMinutes: Math.round(elapsedSeconds / 60),
      completedAt: new Date().toISOString(),
      middleQuestionAnswered: completion.middleQuestionAnswered,
      middleQuestionCorrect: completion.middleQuestionCorrect,
      guidedPracticeCompleted: completion.guidedPracticeAttempted,
      guidedPracticeCorrect: completion.guidedPracticeCorrect,
      independentPracticeCompleted: completion.independentPracticeAttempted,
      independentPracticeCorrect: completion.independentPracticeCorrect,
      exitTicketAnswered: completion.exitTicketAnswered,
      exitTicketCorrect: completion.exitTicketCorrect,
      questionsAskedCount: completion.questionsAskedCount,
      weakAreas: completion.weakAreas,
      recommendedNext: ["Practice factor signs", "Try equations with negative coefficients"],
      notesSaved: completion.notesSaved,
      transcriptGenerated: true,
    };

    trackEvent({ type: "lesson_completed", summary, timestamp: new Date().toISOString() });

    speakText("Congratulations! You have completed this lesson. Great work today!");
  }, [elapsedSeconds, completion, activeLesson, sessionId, speakText]);

  /* ── Play entire lesson from current index ───────────────── */
  const playLesson = useCallback(async () => {
    isPlayingRef.current = true;
    setIsPaused(false);
    const items = state.boardState.items;
    let idx = state.boardState.currentItemIndex;

    while (idx < items.length && isPlayingRef.current) {
      dispatch({ type: "SET_CURRENT_ITEM_INDEX", index: idx });
      await playBoardItem(items[idx]);
      idx++;

      // Ask question after certain items
      if (
        idx < items.length &&
        (items[idx - 1].type === "answer" || items[idx - 1].type === "calculation")
      ) {
        dispatch({ type: "SET_TEACHER_STATE", state: "asking_question" });
        dispatch({ type: "OPEN_QUESTION" });
        if (state.learningMode !== "blind") {
          await new Promise<void>((r) => setTimeout(r, 1500));
          dispatch({ type: "CLOSE_QUESTION" });
        }
      }
    }

    if (idx >= items.length) {
      dispatch({ type: "SET_TEACHER_STATE", state: "encouraging" });
      await speakText("Great job! That is the end of this section.");

      // Check if we should trigger exit ticket at end
      if (
        state.progress.stepIndex >= STEP_ORDER.length - 1 &&
        !completion.exitTicketAnswered &&
        activeLesson.exitTicket
      ) {
        triggerExitTicket();
      }
    }
  }, [
    playBoardItem,
    state.boardState.items,
    state.boardState.currentItemIndex,
    state.learningMode,
    state.progress.stepIndex,
    completion.exitTicketAnswered,
    activeLesson.exitTicket,
    triggerExitTicket,
  ]);

  // Wire up the ref so handlers defined before playLesson can call it
  playLessonRef.current = playLesson;

  /* ── Pause / Resume ──────────────────────────────────────── */
  const handlePause = () => {
    isPlayingRef.current = false;
    setIsPaused(true);
    pauseSpeech();
    dispatch({ type: "SET_TEACHER_STATE", state: "paused" });
    if (writingTimerRef.current) clearTimeout(writingTimerRef.current);
  };

  const handleResume = () => {
    setIsPaused(false);
    resumeSpeech();
    isPlayingRef.current = true;
    dispatch({ type: "SET_TEACHER_STATE", state: "speaking" });
  };

  /* ── Step navigation ─────────────────────────────────────── */
  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= STEP_ORDER.length) return;
    const stepKey = STEP_ORDER[stepIndex];
    dispatch({ type: "SET_STEP_INDEX", index: stepIndex });
    dispatch({ type: "SET_BOARD_ITEMS", items: STEP_BOARDS[stepKey] ?? SAMPLE_BOARD_SEQUENCE });
    dispatch({ type: "SET_TEACHER_STATE", state: "preparing" });
    isPlayingRef.current = false;
    setIsPaused(false);
    stopSpeech();
  }, []);

  /* ── Replay ──────────────────────────────────────────────── */
  const replayFromStart = () => {
    trackEvent({ type: "lesson_replayed", fromStep: 0, timestamp: new Date().toISOString() });
    dispatch({ type: "START_REPLAY", fromIndex: 0 });
    setTimeout(() => playLesson(), 300);
  };

  const replayCurrentStep = () => {
    trackEvent({
      type: "lesson_replayed",
      fromStep: state.boardState.currentItemIndex,
      timestamp: new Date().toISOString(),
    });
    dispatch({ type: "START_REPLAY", fromIndex: state.boardState.currentItemIndex });
    setTimeout(() => playLesson(), 300);
  };

  const replayFromPrevious = () => {
    const prev = Math.max(0, state.boardState.currentItemIndex - 1);
    trackEvent({ type: "lesson_replayed", fromStep: prev, timestamp: new Date().toISOString() });
    dispatch({ type: "START_REPLAY", fromIndex: prev });
    setTimeout(() => playLesson(), 300);
  };

  const replayLastExplanation = () => {
    dispatch({ type: "SET_TEACHER_STATE", state: "speaking" });
    const lastTranscript = state.transcript.filter((t) => t.role === "teacher").pop();
    if (lastTranscript) {
      speakText(lastTranscript.text);
    }
  };

  /* ── Question handling ───────────────────────────────────── */
  const handleAskQuestion = () => {
    dispatch({ type: "OPEN_QUESTION" });
    if (state.learningMode === "blind") {
      dispatch({ type: "SET_BLIND_STATE", blindState: "mic_listening" });
      dispatch({ type: "SET_LISTENING", isListening: true, transcript: "" });
      recognitionRef.current = startListening(
        (transcript, isFinal) => {
          dispatch({ type: "SET_LISTENING", isListening: true, transcript });
          if (isFinal) {
            dispatch({ type: "SET_BLIND_STATE", blindState: "transcribing" });
            stopVoiceListening(recognitionRef.current);
            dispatch({ type: "SET_LISTENING", isListening: false, transcript });
          }
        },
        () => {},
        () => {
          dispatch({ type: "SET_LISTENING", isListening: false, transcript: "" });
        },
      );
    }
  };

  const submitQuestion = (question: string) => {
    if (!question.trim()) return;
    setCompletion((prev) => ({ ...prev, questionsAskedCount: prev.questionsAskedCount + 1 }));

    dispatch({
      type: "ADD_TRANSCRIPT",
      entry: {
        id: crypto.randomUUID(),
        role: "student",
        text: question,
        timestamp: new Date().toISOString(),
      },
    });
    dispatch({ type: "CLOSE_QUESTION" });
    stopVoiceListening(recognitionRef.current);

    trackEvent({ type: "learner_asked_question", question, timestamp: new Date().toISOString() });

    // Simulate teacher answer
    dispatch({ type: "SET_TEACHER_STATE", state: "answering" });
    const answer = `That is a great question. Let me think about ${question}... The key idea here is to focus on the factor pairs.`;
    speakText(answer).then(() => {
      dispatch({
        type: "ADD_TRANSCRIPT",
        entry: {
          id: crypto.randomUUID(),
          role: "teacher",
          text: answer,
          timestamp: new Date().toISOString(),
        },
      });
      trackEvent({
        type: "teacher_answered_question",
        answer,
        timestamp: new Date().toISOString(),
      });
      dispatch({ type: "SET_TEACHER_STATE", state: "speaking" });
    });
    setQuestionInput("");
  };

  /* ── Send quick action ───────────────────────────────────── */
  const handleQuickAction = (action: string) => {
    if (action === "no_question") {
      dispatch({ type: "CLOSE_QUESTION" });
      return;
    }
    if (action === "repeat") {
      dispatch({ type: "CLOSE_QUESTION" });
      replayCurrentStep();
      return;
    }
    if (action === "dont_understand") {
      submitQuestion("I don't understand this part.");
      return;
    }
    if (action === "give_example") {
      submitQuestion("Can you give me an example?");
      return;
    }
    if (action === "slow_down") {
      dispatch({ type: "CLOSE_QUESTION" });
      dispatch({ type: "SET_TEACHER_STATE", state: "encouraging" });
      speakText("Okay, I will slow down. Let me explain again.");
      return;
    }
    if (action === "continue") {
      dispatch({ type: "CLOSE_QUESTION" });
      return;
    }
  };

  /* ── Scroll handler for auto-scroll toggle ───────────────── */
  const handleBoardScroll = () => {
    if (!boardRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = boardRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 60;
    if (!atBottom && state.boardState.autoScroll) {
      dispatch({ type: "SET_AUTO_SCROLL", autoScroll: false });
    }
  };

  /* ── Save notes ──────────────────────────────────────────── */
  const handleSaveNotes = () => {
    setCompletion((prev) => ({ ...prev, notesSaved: true }));
    trackEvent({
      type: "lesson_completed",
      summary: {} as any,
      timestamp: new Date().toISOString(),
    });
  };

  /* ── Mode defaults ───────────────────────────────────────── */
  const isDeafMode = state.learningMode === "deaf" || state.learningMode === "deaf_blind";
  const isBlindMode = state.learningMode === "blind";
  const isFocusMode = state.learningMode === "adhd_focus";
  const isSpeechDifficulty = state.learningMode === "speech_difficulty";
  const isMotorSupport = state.learningMode === "motor_support";
  const showChatPanel = !isFocusMode;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      {/* ═══ TOP BAR ═══════════════════════════════════════════ */}
      <ClassroomTopBar
        institutionName={institution?.name ?? "Klassruum Demo Academy"}
        courseName={course?.title ?? "Mathematics Form 2"}
        lessonTitle={lesson?.title ?? activeLesson.title}
        progress={state.progress.percentage}
        liveStatus={isPlayingRef.current ? "live" : isPaused ? "paused" : "ready"}
        learningMode={state.learningMode}
        elapsedSeconds={elapsedSeconds}
        currentStep={currentStepLabel}
        onOpenModeSwitcher={() => setShowModeSwitcher(true)}
        onOpenTranscript={() => setShowTranscript(true)}
        onOpenNotes={() => setShowNotesDrawer(true)}
        onEndLesson={onEndLesson ?? (() => {})}
      />

      {/* ═══ MAIN AREA ════════════════════════════════════════ */}
      <div className="flex flex-1 min-h-0">
        {/* ── TEACHER VIDEO PANEL ──────────────────────────── */}
        {!isFocusMode && (
          <TeacherVideoPanel
            teacherState={state.teacherState}
            teacherMode={state.teacherMode}
            isSpeaking={state.audioState.playing}
            audioEnabled={state.audioState.enabled}
            currentCaption={state.captions.currentText}
            currentStep={currentStepLabel}
            elapsedSeconds={elapsedSeconds}
            onToggleAudio={() => {
              if (state.audioState.lockedOnForBlindMode) return;
              dispatch({ type: "SET_AUDIO_ENABLED", enabled: !state.audioState.enabled });
            }}
            onAskQuestion={handleAskQuestion}
            onReplayExplanation={replayLastExplanation}
            learningMode={state.learningMode}
          />
        )}

        {/* ── LEARNING WHITEBOARD ──────────────────────────── */}
        <div className="flex flex-1 min-w-0 flex-col p-3">
          <LearningWhiteboard
            ref={boardRef}
            writtenItems={state.boardState.writtenItems}
            currentItem={state.boardState.items[state.boardState.currentItemIndex]}
            currentWrittenText={state.boardState.currentWrittenText}
            isWriting={state.boardState.isWriting}
            onScroll={handleBoardScroll}
            reducedMotion={state.learningMode === "adhd_focus"}
            learningMode={state.learningMode}
          />

          {/* Board navigation for replay */}
          <div className="replay-controls mt-2 flex items-center gap-2">
            <button onClick={replayFromPrevious} className="replay-button" title="Previous item">
              <SkipBack className="h-3.5 w-3.5" /> Previous
            </button>
            <button onClick={replayCurrentStep} className="replay-button" title="Replay step">
              <RotateCcw className="h-3.5 w-3.5" /> Replay Step
            </button>
            <button
              onClick={replayLastExplanation}
              className="replay-button"
              title="Replay last explanation"
            >
              <Volume2 className="h-3.5 w-3.5" /> Replay Explanation
            </button>
            <button onClick={replayFromStart} className="replay-button" title="Replay all">
              <RefreshCw className="h-3.5 w-3.5" /> Replay All
            </button>

            {/* Practice triggers */}
            {!completion.guidedPracticeAttempted && state.progress.stepIndex >= 3 && (
              <button
                onClick={() => startPractice("guided")}
                className="replay-button text-[var(--crimson)] border-[var(--crimson-soft)]"
                title="Guided practice"
              >
                <Target className="h-3.5 w-3.5" /> Guided Practice
              </button>
            )}
            {!completion.independentPracticeAttempted && state.progress.stepIndex >= 4 && (
              <button
                onClick={() => startPractice("independent")}
                className="replay-button text-purple-600 border-purple-200"
                title="Independent practice"
              >
                <Brain className="h-3.5 w-3.5" /> Independent Practice
              </button>
            )}

            <div className="ml-auto flex items-center gap-1 text-xs text-gray-400">
              <PenTool className="h-3 w-3" />
              {state.boardState.writtenItems.length} / {state.boardState.items.length} items
            </div>
          </div>
        </div>
      </div>

      {/* ═══ CAPTION BAR ══════════════════════════════════════ */}
      {state.captions.enabled && state.captions.currentText && !isFocusMode && (
        <div className="caption-bar">
          <Subtitles className="mr-2 h-4 w-4 text-[var(--crimson)]" />
          <span className="caption-text">{state.captions.currentText}</span>
        </div>
      )}

      {/* ═══ BOTTOM CONTROLS ══════════════════════════════════ */}
      <ClassroomControls
        isPlaying={isPlayingRef.current}
        isPaused={isPaused}
        audioEnabled={state.audioState.enabled}
        captionsEnabled={state.captions.enabled}
        isListening={state.questionState.isListening}
        learningMode={state.learningMode}
        onPlay={() => playLesson()}
        onPause={handlePause}
        onResume={handleResume}
        onToggleAudio={() => {
          if (state.audioState.lockedOnForBlindMode) return;
          dispatch({ type: "SET_AUDIO_ENABLED", enabled: !state.audioState.enabled });
        }}
        onToggleCaptions={() => dispatch({ type: "TOGGLE_CAPTIONS" })}
        onAskQuestion={handleAskQuestion}
        onToggleListening={() => {
          if (state.questionState.isListening) {
            stopVoiceListening(recognitionRef.current);
            dispatch({ type: "SET_LISTENING", isListening: false, transcript: "" });
          } else {
            handleAskQuestion();
          }
        }}
        onEndLesson={onEndLesson ?? (() => {})}
        onPrevStep={() => goToStep(state.progress.stepIndex - 1)}
        onNextStep={() => goToStep(state.progress.stepIndex + 1)}
        onOpenNotes={() => setShowNotesDrawer(true)}
        onOpenTimeline={() => setShowLessonTimeline(true)}
      />

      {/* ═══ QUESTION PROMPT ══════════════════════════════════ */}
      {state.questionState.isPromptOpen && !showRequiredQuestion && !showPractice && (
        <QuestionPromptOverlay
          learningMode={state.learningMode}
          questionInput={questionInput}
          setQuestionInput={setQuestionInput}
          onSubmit={submitQuestion}
          onClose={() => {
            dispatch({ type: "CLOSE_QUESTION" });
            stopVoiceListening(recognitionRef.current);
          }}
          onQuickAction={handleQuickAction}
          isListening={state.questionState.isListening}
          voiceTranscript={state.questionState.transcript}
          blindState={state.questionState.blindState}
        />
      )}

      {/* ═══ REQUIRED MIDDLE QUESTION ═════════════════════════ */}
      {showRequiredQuestion && (
        <RequiredQuestionPrompt
          question={activeLesson.requiredMidLessonQuestion}
          answer={requiredQuestionAnswer}
          setAnswer={setRequiredQuestionAnswer}
          result={requiredQuestionResult}
          onSubmit={handleRequiredQuestionSubmit}
          learningMode={state.learningMode}
        />
      )}

      {/* ═══ PRACTICE PANEL ═══════════════════════════════════ */}
      {showPractice && (
        <PracticePrompt
          activeLesson={activeLesson}
          answer={practiceAnswer}
          setAnswer={setPracticeAnswer}
          result={practiceResult}
          onSubmit={handlePracticeSubmit}
          learningMode={state.learningMode}
        />
      )}

      {/* ═══ EXIT TICKET ══════════════════════════════════════ */}
      {showExitTicket && (
        <ExitTicketPrompt
          exitTicket={activeLesson.exitTicket!}
          answer={exitTicketAnswer}
          setAnswer={setExitTicketAnswer}
          result={exitTicketResult}
          onSubmit={handleExitTicketSubmit}
          learningMode={state.learningMode}
        />
      )}

      {/* ═══ TRANSCRIPT DRAWER ════════════════════════════════ */}
      <TranscriptDrawer
        entries={state.transcript}
        isOpen={showTranscript}
        onClose={() => setShowTranscript(false)}
      />

      {/* ═══ NOTES DRAWER ═════════════════════════════════════ */}
      <NotesDrawer
        isOpen={showNotesDrawer}
        onClose={() => setShowNotesDrawer(false)}
        lesson={activeLesson}
        currentStepIndex={state.progress.stepIndex}
        userNotes={userNotes}
        onAddNote={(note) => {
          setUserNotes((prev) => [...prev, note]);
          setUserNoteInput("");
        }}
        onSaveNotes={handleSaveNotes}
        userNoteInput={userNoteInput}
        setUserNoteInput={setUserNoteInput}
      />

      {/* ═══ LESSON TIMELINE ══════════════════════════════════ */}
      {showLessonTimeline && (
        <LessonTimelineOverlay
          currentStepIndex={state.progress.stepIndex}
          steps={STEP_ORDER}
          completion={completion}
          onSelect={(idx) => {
            goToStep(idx);
            setShowLessonTimeline(false);
          }}
          onClose={() => setShowLessonTimeline(false)}
        />
      )}

      {/* ═══ MODE SWITCHER ════════════════════════════════════ */}
      {showModeSwitcher && (
        <ModeSwitcherOverlay
          currentMode={state.learningMode}
          onSelect={(mode) => {
            dispatch({ type: "SET_LEARNING_MODE", mode });
            setShowModeSwitcher(false);
          }}
          onClose={() => setShowModeSwitcher(false)}
        />
      )}

      {/* ═══ COMPLETION SUMMARY ═══════════════════════════════ */}
      {showCompletionSummary && (
        <LessonCompletionSummaryPanel
          completion={completion}
          elapsedSeconds={elapsedSeconds}
          onReplay={() => {
            setShowCompletionSummary(false);
            goToStep(0);
            setTimeout(() => playLesson(), 500);
          }}
          onClose={() => setShowCompletionSummary(false)}
        />
      )}

      {/* ═══ WELCOME OVERLAY (initial) ════════════════════════ */}
      {state.teacherState === "preparing" && !state.replayState.isReplayMode && (
        <div className="question-prompt-wrapper">
          <div className="question-prompt-content max-w-lg text-center">
            <div className="learning-mode-badge mx-auto mb-4">
              <Sparkles className="h-4 w-4" />
              Welcome to Klassruum
            </div>
            <h2 className="text-2xl font-bold text-foreground">Your AI teacher is ready.</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              This lesson includes voice, whiteboard with handwriting, captions, and full
              accessibility support.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              <Clock className="mr-1 inline h-3 w-3" />
              Estimated duration: {activeLesson.estimatedDurationMinutes} minutes
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button
                onClick={() => {
                  trackEvent({ type: "session_started", timestamp: new Date().toISOString() });
                  playLesson();
                }}
                size="lg"
              >
                <Play className="mr-2 h-5 w-5" />
                Start Lesson
              </Button>
              <Button variant="outline" onClick={() => setShowModeSwitcher(true)}>
                <Accessibility className="mr-2 h-4 w-4" />
                Learning Mode
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════ */
/*  SUB-COMPONENTS                                                   */
/* ════════════════════════════════════════════════════════════════ */

/* ─── Classroom Top Bar ──────────────────────────────────────── */

function ClassroomTopBar({
  institutionName,
  courseName,
  lessonTitle,
  progress,
  liveStatus,
  learningMode,
  elapsedSeconds,
  currentStep,
  onOpenModeSwitcher,
  onOpenTranscript,
  onOpenNotes,
  onEndLesson,
}: {
  institutionName: string;
  courseName: string;
  lessonTitle: string;
  progress: number;
  liveStatus: "live" | "paused" | "ready";
  learningMode: LearningMode;
  elapsedSeconds: number;
  currentStep: string;
  onOpenModeSwitcher: () => void;
  onOpenTranscript: () => void;
  onOpenNotes: () => void;
  onEndLesson: () => void;
}) {
  return (
    <header
      className="flex h-14 items-center border-b border-border bg-white px-4 shadow-sm"
      role="banner"
    >
      <Link
        to="/student/dashboard"
        className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Exit
      </Link>

      {/* Klassruum logo area */}
      <div className="ml-4 flex items-center gap-2 text-sm">
        <span className="text-xs font-bold text-primary">Klassruum</span>
        <span className="text-muted-foreground/50">|</span>
        <span className="text-muted-foreground text-xs">{institutionName}</span>
        <span className="text-muted-foreground/50">|</span>
        <span className="text-muted-foreground text-xs">{courseName}</span>
        <span className="text-muted-foreground/50">|</span>
        <span className="font-semibold text-foreground text-xs">{lessonTitle}</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Live badge */}
        <div
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            liveStatus === "live"
              ? "bg-red-100 text-red-600"
              : liveStatus === "paused"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-slate-100 text-gray-500"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${liveStatus === "live" ? "animate-pulse bg-red-500" : liveStatus === "paused" ? "bg-yellow-500" : "bg-gray-400"}`}
          />
          {liveStatus === "live" ? "Live" : liveStatus === "paused" ? "Paused" : "Ready"}
        </div>

        {/* AI Teacher badge */}
        <div className="flex items-center gap-1.5 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-600">
          <Sparkles className="h-3 w-3" />
          AI Teacher
        </div>

        {/* Current step */}
        <div className="hidden items-center gap-1.5 rounded-full bg-[var(--crimson-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--crimson)] lg:flex">
          <Target className="h-3 w-3" />
          {currentStep}
        </div>

        {/* Timer */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, "0")}
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2">
          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-bold text-foreground">{progress}%</span>
        </div>

        {/* Learning Mode */}
        <button
          onClick={onOpenModeSwitcher}
          className="learning-mode-badge"
          aria-label="Change learning mode"
        >
          <Accessibility className="h-3.5 w-3.5" />
          {LEARNING_MODES.find((m) => m.key === learningMode)?.label ?? "Standard"}
        </button>

        {/* Notes */}
        <button
          onClick={onOpenNotes}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          aria-label="Open notes"
        >
          <FileText className="h-3.5 w-3.5" />
          Notes
        </button>

        {/* Transcript */}
        <button
          onClick={onOpenTranscript}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          aria-label="Open transcript"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Transcript
        </button>

        {/* End Lesson */}
        <button
          onClick={onEndLesson}
          className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-white hover:bg-destructive/90"
        >
          End Lesson
        </button>
      </div>
    </header>
  );
}

/* ─── Teacher Video Panel ────────────────────────────────────── */

function TeacherVideoPanel({
  teacherState,
  teacherMode,
  isSpeaking,
  audioEnabled,
  currentCaption,
  currentStep,
  elapsedSeconds,
  onToggleAudio,
  onAskQuestion,
  onReplayExplanation,
  learningMode,
}: {
  teacherState: TeacherVideoState;
  teacherMode: "ai_teacher" | "human_teacher" | "hybrid";
  isSpeaking: boolean;
  audioEnabled: boolean;
  currentCaption: string;
  currentStep: string;
  elapsedSeconds: number;
  onToggleAudio: () => void;
  onAskQuestion: () => void;
  onReplayExplanation: () => void;
  learningMode: LearningMode;
}) {
  const stateLabel = teacherState.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const stateColor = (() => {
    switch (teacherState) {
      case "speaking":
        return "bg-[var(--crimson-soft)] text-[var(--crimson-dark)]";
      case "writing":
        return "bg-purple-100 text-purple-700";
      case "listening":
        return "bg-green-100 text-green-700";
      case "thinking":
        return "bg-orange-100 text-orange-700";
      case "answering":
        return "bg-cyan-100 text-cyan-700";
      case "encouraging":
        return "bg-pink-100 text-pink-700";
      case "paused":
        return "bg-yellow-100 text-yellow-700";
      case "explaining":
        return "bg-[var(--crimson-soft)] text-[var(--crimson-dark)]";
      case "asking_question":
        return "bg-amber-100 text-amber-700";
      case "preparing":
        return "bg-slate-100 text-gray-600";
      default:
        return "bg-slate-100 text-gray-600";
    }
  })();

  // Dynamic activity description based on state
  const activityDescription = (() => {
    switch (teacherState) {
      case "writing":
        return "Writing on board...";
      case "speaking":
        return "Explaining the lesson...";
      case "listening":
        return "Listening for questions...";
      case "thinking":
        return "Thinking...";
      case "answering":
        return "Answering your question...";
      case "encouraging":
        return "Great work!";
      case "paused":
        return "Paused";
      case "preparing":
        return "Preparing lesson...";
      case "explaining":
        return "Giving deeper explanation...";
      case "asking_question":
        return "Asking a question...";
      default:
        return "Ready";
    }
  })();

  return (
    <aside
      className="teacher-video-panel flex w-[280px] min-w-[240px] max-w-[320px] flex-shrink-0 flex-col"
      role="complementary"
      aria-label="Teacher video panel"
    >
      {/* Header with teacher name and connection status */}
      <div className="flex items-center justify-between px-4 pt-4">
        <span className="text-sm font-bold text-foreground">
          {teacherMode === "ai_teacher"
            ? "AI Teacher"
            : teacherMode === "human_teacher"
              ? "Teacher"
              : "Teacher"}
        </span>
        {/* Connection status */}
        <div
          className="flex items-center gap-1.5 text-xs font-medium text-green-600"
          title="Connected"
        >
          <Wifi className="h-3 w-3" />
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Online
        </div>
      </div>

      {/* Video frame / avatar area */}
      <div
        className="relative mx-4 mt-3 overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 to-gray-900"
        style={{ aspectRatio: "16/10" }}
      >
        {/* Teacher name overlay */}
        <div className="absolute left-2 top-2 z-10 flex items-center gap-1.5 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
          Mr. Klass
        </div>

        {/* Role badge overlay */}
        <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full bg-purple-500/80 px-2 py-0.5 text-[10px] font-semibold text-white">
          <Sparkles className="h-2.5 w-2.5" />
          {teacherMode === "ai_teacher"
            ? "AI"
            : teacherMode === "human_teacher"
              ? "Live"
              : "Hybrid"}
        </div>

        {/* Avatar with speaking ring */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className={`relative h-20 w-20 rounded-full border-4 ${isSpeaking ? "border-[var(--crimson)] shadow-lg shadow-[var(--crimson)]/30" : "border-gray-600"}`}
          >
            <div className="absolute inset-1 rounded-full bg-gradient-to-br from-[var(--crimson)]/30 to-purple-400/30" />
            <div className="absolute inset-3 flex items-center justify-center rounded-full bg-gradient-to-br from-[var(--crimson)]/60 to-purple-500/60">
              <div
                className={`h-6 w-6 rounded-full bg-gradient-to-br from-[var(--crimson)] to-purple-400 ${isSpeaking ? "animate-pulse" : ""}`}
              />
            </div>
            {isSpeaking && (
              <div className="absolute inset-0 animate-ping rounded-full border-2 border-[var(--crimson)]/20" />
            )}
            {teacherState === "writing" && (
              <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 text-xs shadow-md">
                ✍️
              </div>
            )}
            {teacherState === "thinking" && (
              <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 shadow-md">
                <Loader2 className="h-3 w-3 animate-spin text-white" />
              </div>
            )}
          </div>

          {/* Audio waveform */}
          {isSpeaking && (
            <div className="mt-2 flex items-center gap-[2px]">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-[2px] rounded-full bg-[var(--crimson)]"
                  style={{
                    height: `${4 + Math.random() * 10}px`,
                    animation: `waveform 0.6s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Mic/Camera status overlay */}
        <div className="absolute bottom-2 left-2 z-10 flex items-center gap-2">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full ${audioEnabled ? "bg-green-500/80" : "bg-red-500/80"}`}
          >
            {audioEnabled ? (
              <Mic className="h-3 w-3 text-white" />
            ) : (
              <MicOff className="h-3 w-3 text-white" />
            )}
          </div>
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-600/80">
            <VideoOff className="h-3 w-3 text-white" />
          </div>
        </div>

        {/* Video readiness label */}
        <div className="absolute bottom-2 right-2 z-10 rounded bg-black/40 px-1.5 py-0.5 text-[8px] text-gray-300">
          Video standby
        </div>
      </div>

      {/* Teacher state badge */}
      <div className="flex flex-col items-center px-4 pt-3">
        <div className={`teacher-state-badge ${stateColor} mt-3`}>
          {teacherState === "writing" && <PenTool className="h-3 w-3" />}
          {teacherState === "speaking" && <Volume2 className="h-3 w-3" />}
          {teacherState === "listening" && <Mic className="h-3 w-3" />}
          {teacherState === "thinking" && <Loader2 className="h-3 w-3 animate-spin" />}
          {teacherState === "explaining" && <BookOpen className="h-3 w-3" />}
          {teacherState === "asking_question" && <HelpCircle className="h-3 w-3" />}
          {teacherState === "answering" && <MessageSquare className="h-3 w-3" />}
          {teacherState === "encouraging" && <Award className="h-3 w-3" />}
          {stateLabel}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Mr. Klass is your AI teacher</p>
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap justify-center gap-2 px-4">
        <span className="rounded-full bg-[var(--crimson-soft)] px-2.5 py-1 text-[10px] font-semibold text-[var(--crimson)]">
          {teacherMode === "ai_teacher"
            ? "AI Teacher"
            : teacherMode === "human_teacher"
              ? "Human Teacher"
              : "Hybrid"}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${audioEnabled ? "bg-green-50 text-green-600" : "bg-slate-100 text-gray-500"}`}
        >
          {audioEnabled ? "Voice Active" : "Voice Off"}
        </span>
        <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-semibold text-purple-600">
          Captions {learningMode === "deaf" || learningMode === "deaf_blind" ? "On" : "Auto"}
        </span>
      </div>

      <div className="mx-4 my-3 h-px bg-border" />

      {/* Current activity */}
      <div className="px-4 py-2">
        <div className="text-xs text-muted-foreground">Current Activity</div>
        <p className="mt-1 text-sm font-medium text-foreground">{activityDescription}</p>
      </div>

      {/* Current step */}
      <div className="px-4 py-2">
        <div className="text-xs text-muted-foreground">Current Step</div>
        <p className="mt-1 text-sm font-medium text-foreground">{currentStep}</p>
      </div>

      {/* Time spent */}
      <div className="px-4 py-2">
        <div className="text-xs text-muted-foreground">Time Spent</div>
        <p className="mt-1 text-sm font-medium text-foreground">
          {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, "0")}
        </p>
      </div>

      {/* Caption preview */}
      {currentCaption && (
        <div className="mx-4 mb-3 rounded-lg bg-slate-50 p-3 text-xs text-muted-foreground">
          <Subtitles className="mr-1 inline h-3 w-3" />
          {currentCaption}
        </div>
      )}

      <div className="mt-auto px-4 pb-4 space-y-2">
        {/* Replay last explanation */}
        <button
          onClick={onReplayExplanation}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-100"
          aria-label="Replay last explanation"
        >
          <RotateCcw className="h-4 w-4" />
          Replay Explanation
        </button>

        {/* Ask question */}
        <button
          onClick={onAskQuestion}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
          aria-label="Ask a question"
        >
          <MessageSquare className="h-4 w-4" />
          Ask Question
        </button>

        {/* Audio toggle (not for blind mode) */}
        {learningMode !== "blind" && (
          <button
            onClick={onToggleAudio}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {audioEnabled ? "Audio On" : "Audio Off"}
          </button>
        )}
      </div>
    </aside>
  );
}

/* ─── Learning Whiteboard ────────────────────────────────────── */

const LearningWhiteboard = forwardRef<
  HTMLDivElement,
  {
    writtenItems: BoardWriteItem[];
    currentItem?: BoardWriteItem;
    currentWrittenText: string;
    isWriting: boolean;
    onScroll: () => void;
    reducedMotion: boolean;
    learningMode: LearningMode;
  }
>(function LearningWhiteboard(
  {
    writtenItems,
    currentItem,
    currentWrittenText,
    isWriting,
    onScroll,
    reducedMotion,
    learningMode,
  },
  ref,
) {
  const fontSize =
    learningMode === "low_vision" || learningMode === "deaf_blind"
      ? "text-3xl"
      : learningMode === "dyslexia"
        ? "text-2xl"
        : "";
  const fontFamily = learningMode === "dyslexia" ? "font-sans" : "";

  return (
    <div
      ref={ref}
      className="learning-whiteboard"
      onScroll={onScroll}
      role="region"
      aria-label="Learning whiteboard"
      aria-live="polite"
    >
      {/* Dot grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #A89890 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative">
        {/* Written items */}
        {writtenItems.map((item) => (
          <div
            key={item.id}
            className={`board-writing-line ${item.type} ${fontSize} ${fontFamily}`}
          >
            {item.type === "heading" && <span className="font-bold">{item.text}</span>}
            {item.type === "bullet" && <span>• {item.text}</span>}
            {item.type === "equation" && (
              <span className="text-center block text-lg">{item.text}</span>
            )}
            {item.type === "calculation" && <span> {item.text}</span>}
            {item.type === "answer" && (
              <span className="text-green-600 font-semibold">→ {item.text}</span>
            )}
            {item.type === "question" && <span className="text-orange-600">? {item.text}</span>}
            {!["heading", "bullet", "equation", "calculation", "answer", "question"].includes(
              item.type,
            ) && item.text}
          </div>
        ))}

        {/* Currently writing item */}
        {isWriting && currentItem && (
          <div className={`board-writing-line ${currentItem.type} ${fontSize} ${fontFamily}`}>
            {currentItem.type === "bullet" && "• "}
            {currentItem.type === "equation" && "  "}
            {currentItem.type === "calculation" && "  "}
            {currentItem.type === "answer" && "→ "}
            {currentItem.type === "question" && "? "}
            <span>{currentWrittenText}</span>
            {/* Writing cursor / hand */}
            {!reducedMotion && (
              <span
                className="writing-cursor inline-block w-[2px] animate-pulse bg-[var(--crimson-soft)]0"
                style={{ height: "1em", verticalAlign: "text-bottom", marginLeft: "2px" }}
              />
            )}
            {/* Hand cursor emoji following text */}
            {!reducedMotion && (
              <span
                className="writing-hand ml-1"
                style={{ position: "relative", top: "-2px" }}
                aria-hidden="true"
              >
                ✍️
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

(LearningWhiteboard as any).displayName = "LearningWhiteboard";

// Forward ref wrapper
const LearningWhiteboardWithRef = React.forwardRef(LearningWhiteboard as any);

/* ─── Classroom Controls (Bottom Bar) ────────────────────────── */

function ClassroomControls({
  isPlaying,
  isPaused,
  audioEnabled,
  captionsEnabled,
  isListening,
  learningMode,
  onPlay,
  onPause,
  onResume,
  onToggleAudio,
  onToggleCaptions,
  onAskQuestion,
  onToggleListening,
  onEndLesson,
  onPrevStep,
  onNextStep,
  onOpenNotes,
  onOpenTimeline,
}: {
  isPlaying: boolean;
  isPaused: boolean;
  audioEnabled: boolean;
  captionsEnabled: boolean;
  isListening: boolean;
  learningMode: LearningMode;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onToggleAudio: () => void;
  onToggleCaptions: () => void;
  onAskQuestion: () => void;
  onToggleListening: () => void;
  onEndLesson: () => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  onOpenNotes: () => void;
  onOpenTimeline: () => void;
}) {
  const isLargeButtons = learningMode === "motor_support" || learningMode === "low_vision";
  const btnClass = isLargeButtons ? "h-12 w-12" : "h-10 w-10";

  return (
    <div
      className="flex h-16 items-center justify-center gap-2 border-t border-border bg-white px-4 shadow-inner"
      role="toolbar"
      aria-label="Classroom controls"
    >
      {/* Lesson controls group */}
      <button
        onClick={onPrevStep}
        className={`${btnClass} flex items-center justify-center rounded-full bg-slate-100 text-muted-foreground hover:bg-slate-200`}
        aria-label="Previous step"
      >
        <SkipBack className="h-4 w-4" />
      </button>

      {!isPlaying && !isPaused && (
        <button
          onClick={onPlay}
          className={`${btnClass} flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90`}
          aria-label="Start lesson"
        >
          <Play className="h-5 w-5" />
        </button>
      )}
      {isPlaying && !isPaused && (
        <button
          onClick={onPause}
          className={`${btnClass} flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90`}
          aria-label="Pause"
        >
          <Pause className="h-5 w-5" />
        </button>
      )}
      {isPaused && (
        <button
          onClick={onResume}
          className={`${btnClass} flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90`}
          aria-label="Resume"
        >
          <Play className="h-5 w-5" />
        </button>
      )}

      <button
        onClick={onNextStep}
        className={`${btnClass} flex items-center justify-center rounded-full bg-slate-100 text-muted-foreground hover:bg-slate-200`}
        aria-label="Next step"
      >
        <SkipForward className="h-4 w-4" />
      </button>

      <div className="mx-1 h-8 w-px bg-border" />

      {/* Question controls group */}
      <button
        onClick={onAskQuestion}
        className={`${btnClass} flex items-center justify-center rounded-full bg-green-100 text-green-600 hover:bg-green-200`}
        aria-label="Ask question"
      >
        <MessageSquare className="h-4 w-4" />
      </button>

      {learningMode !== "speech_difficulty" && (
        <button
          onClick={onToggleListening}
          className={`${btnClass} flex items-center justify-center rounded-full ${isListening ? "bg-red-100 text-red-600 animate-pulse" : "bg-slate-100 text-muted-foreground"}`}
          aria-label={isListening ? "Stop listening" : "Start voice input"}
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>
      )}

      <div className="mx-1 h-8 w-px bg-border" />

      {/* Accessibility controls group */}
      {learningMode !== "blind" && (
        <button
          onClick={onToggleAudio}
          className={`${btnClass} flex items-center justify-center rounded-full ${audioEnabled ? "bg-[var(--crimson-soft)] text-[var(--crimson)]" : "bg-slate-100 text-muted-foreground"}`}
          aria-label={audioEnabled ? "Mute audio" : "Unmute audio"}
        >
          {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>
      )}

      <button
        onClick={onToggleCaptions}
        className={`${btnClass} flex items-center justify-center rounded-full ${captionsEnabled ? "bg-[var(--crimson-soft)] text-[var(--crimson)]" : "bg-slate-100 text-muted-foreground"}`}
        aria-label={captionsEnabled ? "Hide captions" : "Show captions"}
      >
        <Subtitles className="h-4 w-4" />
      </button>

      <button
        onClick={onOpenNotes}
        className={`${btnClass} flex items-center justify-center rounded-full bg-slate-100 text-muted-foreground hover:bg-slate-200`}
        aria-label="Open notes"
      >
        <FileText className="h-4 w-4" />
      </button>

      <button
        onClick={onOpenTimeline}
        className={`${btnClass} flex items-center justify-center rounded-full bg-slate-100 text-muted-foreground hover:bg-slate-200`}
        aria-label="Lesson timeline"
      >
        <Target className="h-4 w-4" />
      </button>

      <div className="mx-1 h-8 w-px bg-border" />

      {/* Video controls queued behind live-session readiness */}
      <button
        disabled
        className={`${btnClass} flex cursor-not-allowed items-center justify-center rounded-full bg-slate-50 text-gray-300 opacity-50`}
        aria-label="Camera control"
        title="Camera control"
      >
        <Video className="h-4 w-4" />
      </button>
      <button
        disabled
        className={`${btnClass} flex cursor-not-allowed items-center justify-center rounded-full bg-slate-50 text-gray-300 opacity-50`}
        aria-label="Raise hand"
        title="Raise hand"
      >
        <HandMetal className="h-4 w-4" />
      </button>
      <button
        disabled
        className={`${btnClass} flex cursor-not-allowed items-center justify-center rounded-full bg-slate-50 text-gray-300 opacity-50`}
        aria-label="Participants"
        title="Participants"
      >
        <Users className="h-4 w-4" />
      </button>
      <button
        disabled
        className={`${btnClass} flex cursor-not-allowed items-center justify-center rounded-full bg-slate-50 text-gray-300 opacity-50`}
        aria-label="Screen share"
        title="Screen share"
      >
        <MonitorUp className="h-4 w-4" />
      </button>

      <div className="mx-1 h-8 w-px bg-border" />

      {/* Session controls */}
      <button
        onClick={onEndLesson}
        className="rounded-lg border-2 border-destructive/30 bg-white px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive hover:text-white"
        aria-label="End lesson"
      >
        End Lesson
      </button>
    </div>
  );
}

/* ─── Required Question Prompt ───────────────────────────────── */

function RequiredQuestionPrompt({
  question,
  answer,
  setAnswer,
  result,
  onSubmit,
  learningMode,
}: {
  question: RequiredLessonQuestion;
  answer: string;
  setAnswer: (v: string) => void;
  result: "correct" | "incorrect" | null;
  onSubmit: () => void;
  learningMode: LearningMode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="question-prompt-wrapper" role="dialog" aria-label="Required question">
      <div className="question-prompt-content max-w-md">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          <h3 className="question-prompt-title text-amber-600">Required Question</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-1">You must answer before continuing.</p>
        <p className="text-lg font-semibold text-foreground mb-4">{question.questionText}</p>

        {result === null ? (
          <>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && answer.trim() && onSubmit()}
                placeholder="Type your answer..."
                className="question-prompt-input flex-1"
                autoComplete="off"
              />
              <button
                onClick={onSubmit}
                disabled={!answer.trim()}
                className="question-prompt-button primary disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            {question.hint && (
              <p className="mt-3 text-xs text-muted-foreground italic">💡 Hint: {question.hint}</p>
            )}
          </>
        ) : (
          <div
            className={`rounded-lg p-4 text-center ${result === "correct" ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"}`}
          >
            {result === "correct" ? (
              <>
                <Check className="mx-auto mb-2 h-8 w-8" />
                <p className="font-semibold">{question.feedbackCorrect}</p>
              </>
            ) : (
              <>
                <AlertCircle className="mx-auto mb-2 h-8 w-8" />
                <p className="font-semibold">{question.feedbackIncorrect}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Practice Prompt ────────────────────────────────────────── */

function PracticePrompt({
  activeLesson,
  answer,
  setAnswer,
  result,
  onSubmit,
  learningMode,
}: {
  activeLesson: Lesson;
  answer: string;
  setAnswer: (v: string) => void;
  result: "correct" | "incorrect" | null;
  onSubmit: () => void;
  learningMode: LearningMode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const guidedPractice = activeLesson.steps.find((s) => s.practice?.type === "guided")?.practice;
  const independentPractice = activeLesson.steps.find(
    (s) => s.practice?.type === "independent",
  )?.practice;
  const currentPractice = guidedPractice || independentPractice;
  const isGuided = currentPractice?.type === "guided";

  if (!currentPractice) return null;

  return (
    <div className="question-prompt-wrapper" role="dialog" aria-label="Practice problem">
      <div className="question-prompt-content max-w-md">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-5 w-5 text-purple-500" />
          <h3 className="question-prompt-title text-purple-600">
            {isGuided ? "Guided Practice" : "Independent Practice"}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mb-1">
          {isGuided ? "Let's work on this together." : "Now try this on your own!"}
        </p>
        <p className="text-lg font-semibold text-foreground mb-4">{currentPractice.problemText}</p>

        {result === null ? (
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && answer.trim() && onSubmit()}
              placeholder="Type your answer..."
              className="question-prompt-input flex-1"
              autoComplete="off"
            />
            <button
              onClick={onSubmit}
              disabled={!answer.trim()}
              className="question-prompt-button primary disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            className={`rounded-lg p-4 text-center ${result === "correct" ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"}`}
          >
            {result === "correct" ? (
              <>
                <Check className="mx-auto mb-2 h-8 w-8" />
                <p className="font-semibold">Correct! Well done.</p>
              </>
            ) : (
              <>
                <AlertCircle className="mx-auto mb-2 h-8 w-8" />
                <p className="font-semibold">
                  {currentPractice.hintOnIncorrect || "Let me show you the solution."}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Exit Ticket Prompt ─────────────────────────────────────── */

function ExitTicketPrompt({
  exitTicket,
  answer,
  setAnswer,
  result,
  onSubmit,
  learningMode,
}: {
  exitTicket: ExitTicket;
  answer: string;
  setAnswer: (v: string) => void;
  result: "correct" | "incorrect" | null;
  onSubmit: () => void;
  learningMode: LearningMode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="question-prompt-wrapper" role="dialog" aria-label="Exit ticket">
      <div className="question-prompt-content max-w-md">
        <div className="flex items-center gap-2 mb-3">
          <Award className="h-5 w-5 text-green-500" />
          <h3 className="question-prompt-title text-green-600">Exit Ticket</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-1">One final check before you finish.</p>
        <p className="text-lg font-semibold text-foreground mb-4">{exitTicket.questionText}</p>

        {result === null ? (
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && answer.trim() && onSubmit()}
              placeholder="Type your answer..."
              className="question-prompt-input flex-1"
              autoComplete="off"
            />
            <button
              onClick={onSubmit}
              disabled={!answer.trim()}
              className="question-prompt-button primary disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            className={`rounded-lg p-4 text-center ${result === "correct" ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"}`}
          >
            {result === "correct" ? (
              <>
                <Check className="mx-auto mb-2 h-8 w-8" />
                <p className="font-semibold">{exitTicket.feedback}</p>
              </>
            ) : (
              <>
                <AlertCircle className="mx-auto mb-2 h-8 w-8" />
                <p className="font-semibold">
                  Not quite. The key is: numbers must multiply to c and add to b.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Question Prompt Overlay ────────────────────────────────── */

function QuestionPromptOverlay({
  learningMode,
  questionInput,
  setQuestionInput,
  onSubmit,
  onClose,
  onQuickAction,
  isListening,
  voiceTranscript,
  blindState,
}: {
  learningMode: LearningMode;
  questionInput: string;
  setQuestionInput: (v: string) => void;
  onSubmit: (q: string) => void;
  onClose: () => void;
  onQuickAction: (action: string) => void;
  isListening: boolean;
  voiceTranscript: string;
  blindState?: BlindQuestionState;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (learningMode !== "blind") {
      inputRef.current?.focus();
    }
  }, [learningMode]);

  // Standard / Default prompt
  if (
    learningMode === "standard" ||
    learningMode === "extra_support" ||
    learningMode === "challenge" ||
    learningMode === "dyslexia" ||
    learningMode === "low_vision" ||
    learningMode === "motor_support"
  ) {
    return (
      <div className="question-prompt-wrapper" role="dialog" aria-label="Ask a question">
        <div className="question-prompt-content max-w-md">
          <h3 className="question-prompt-title">Any question?</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Do you have any question before we continue?
          </p>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSubmit(questionInput)}
              placeholder="Ask your teacher..."
              className="question-prompt-input flex-1"
              autoComplete="off"
            />
            <button
              onClick={() => onSubmit(questionInput)}
              className="question-prompt-button primary"
              aria-label="Send question"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="question-prompt-buttons">
            <button
              onClick={() => onQuickAction("no_question")}
              className="question-prompt-button secondary"
            >
              No question
            </button>
            <button
              onClick={() => onQuickAction("repeat")}
              className="question-prompt-button secondary"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Repeat
            </button>
            <button
              onClick={() => onQuickAction("dont_understand")}
              className="question-prompt-button secondary"
            >
              <HelpCircle className="h-3.5 w-3.5" /> I don't understand
            </button>
            <button
              onClick={() => onQuickAction("give_example")}
              className="question-prompt-button secondary"
            >
              <Lightbulb className="h-3.5 w-3.5" /> Give example
            </button>
            <button
              onClick={() => onQuickAction("slow_down")}
              className="question-prompt-button secondary"
            >
              Slow down
            </button>
            <button
              onClick={() => onQuickAction("continue")}
              className="question-prompt-button secondary"
            >
              Continue
            </button>
          </div>
          <button
            onClick={onClose}
            className="mt-3 text-xs text-muted-foreground hover:text-foreground"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Deaf / Deaf-Blind mode
  if (learningMode === "deaf" || learningMode === "deaf_blind") {
    return (
      <div className="question-prompt-wrapper" role="dialog" aria-label="Ask a question">
        <div className="question-prompt-content max-w-md">
          <h3 className="question-prompt-title">Any question?</h3>
          <p className="mb-3 text-sm text-muted-foreground">
            Type your question below. No audio required.
          </p>
          <textarea
            ref={inputRef as any}
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            placeholder="Type your question..."
            className="question-prompt-input min-h-[80px] resize-none"
            rows={3}
            autoComplete="off"
          />
          <div className="question-prompt-buttons">
            <button
              onClick={() => onSubmit(questionInput)}
              className="question-prompt-button primary"
            >
              <Send className="h-3.5 w-3.5" /> Send Question
            </button>
            <button
              onClick={() => onQuickAction("no_question")}
              className="question-prompt-button secondary"
            >
              No Question
            </button>
            <button
              onClick={() => onQuickAction("repeat")}
              className="question-prompt-button secondary"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Repeat Board Step
            </button>
            <button
              onClick={() => onQuickAction("give_example")}
              className="question-prompt-button secondary"
            >
              <Lightbulb className="h-3.5 w-3.5" /> Simpler Explanation
            </button>
          </div>
          <button
            onClick={onClose}
            className="mt-3 text-xs text-muted-foreground hover:text-foreground"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Blind mode - voice first
  if (learningMode === "blind") {
    return (
      <div className="question-prompt-wrapper" role="dialog" aria-label="Voice question prompt">
        <div className="question-prompt-content max-w-md text-center" aria-live="assertive">
          <h3 className="question-prompt-title">Any question before we continue?</h3>
          <p className="text-sm text-muted-foreground mb-3">You can ask now, or say no question.</p>
          <div className="my-4">
            {isListening ? (
              <>
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 animate-pulse">
                  <Mic className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  {blindState === "mic_listening"
                    ? 'Listening. Say your question, or say "no question".'
                    : "Processing..."}
                </p>
                {voiceTranscript && (
                  <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-muted-foreground">
                    You said: "{voiceTranscript}"
                  </p>
                )}
              </>
            ) : voiceTranscript ? (
              <>
                <p className="text-sm text-foreground">You said:</p>
                <p className="mt-1 text-lg font-medium text-foreground">"{voiceTranscript}"</p>
                <div className="question-prompt-buttons mt-4 justify-center">
                  <button
                    onClick={() => onSubmit(voiceTranscript)}
                    className="question-prompt-button primary"
                  >
                    <Send className="h-3.5 w-3.5" /> Send
                  </button>
                  <button
                    onClick={() => onQuickAction("no_question")}
                    className="question-prompt-button secondary"
                  >
                    No Question
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Starting microphone...</p>
            )}
          </div>
          <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Speech difficulty mode
  if (learningMode === "speech_difficulty") {
    return (
      <div className="question-prompt-wrapper" role="dialog" aria-label="Question prompt">
        <div className="question-prompt-content max-w-md">
          <h3 className="question-prompt-title">Any question?</h3>
          <input
            ref={inputRef}
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmit(questionInput)}
            placeholder="Type your question..."
            className="question-prompt-input"
            autoComplete="off"
          />
          <div className="question-prompt-buttons">
            <button
              onClick={() => onSubmit(questionInput)}
              className="question-prompt-button primary"
            >
              <Send className="h-3.5 w-3.5" /> Send
            </button>
            <button
              onClick={() => onQuickAction("no_question")}
              className="question-prompt-button secondary"
            >
              No question
            </button>
            <button
              onClick={() => onQuickAction("repeat")}
              className="question-prompt-button secondary"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Repeat
            </button>
            <button
              onClick={() => onQuickAction("dont_understand")}
              className="question-prompt-button secondary"
            >
              Explain simpler
            </button>
            <button
              onClick={() => onQuickAction("give_example")}
              className="question-prompt-button secondary"
            >
              <Lightbulb className="h-3.5 w-3.5" /> Give example
            </button>
            <button
              onClick={() => onQuickAction("continue")}
              className="question-prompt-button secondary"
            >
              Continue
            </button>
          </div>
          <button
            onClick={onClose}
            className="mt-3 text-xs text-muted-foreground hover:text-foreground"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // ADHD Focus mode - minimal
  return (
    <div className="question-prompt-wrapper" role="dialog" aria-label="Question prompt">
      <div className="question-prompt-content max-w-sm">
        <h3 className="question-prompt-title">Question?</h3>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmit(questionInput)}
            placeholder="Quick question..."
            className="question-prompt-input flex-1"
            autoComplete="off"
          />
          <button
            onClick={() => onSubmit(questionInput)}
            className="question-prompt-button primary"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="question-prompt-buttons">
          <button
            onClick={() => onQuickAction("no_question")}
            className="question-prompt-button secondary"
          >
            No question
          </button>
          <button
            onClick={() => onQuickAction("continue")}
            className="question-prompt-button secondary"
          >
            Continue
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-3 text-xs text-muted-foreground hover:text-foreground"
        >
          Close
        </button>
      </div>
    </div>
  );
}

/* ─── Notes Drawer ───────────────────────────────────────────── */

function NotesDrawer({
  isOpen,
  onClose,
  lesson,
  currentStepIndex,
  userNotes,
  onAddNote,
  onSaveNotes,
  userNoteInput,
  setUserNoteInput,
}: {
  isOpen: boolean;
  onClose: () => void;
  lesson: Lesson;
  currentStepIndex: number;
  userNotes: string[];
  onAddNote: (note: string) => void;
  onSaveNotes: () => void;
  userNoteInput: string;
  setUserNoteInput: (v: string) => void;
}) {
  const currentStep = lesson.steps[currentStepIndex];

  return (
    <div
      className={`transcript-drawer ${isOpen ? "open" : "closed"}`}
      role="dialog"
      aria-label="Lesson notes"
      aria-hidden={!isOpen}
    >
      <div className="transcript-content">
        <div className="transcript-header">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <FileText className="h-4 w-4" />
            Lesson Notes
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onSaveNotes}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90"
              aria-label="Save notes"
            >
              <Save className="h-3.5 w-3.5" /> Save
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-slate-100"
              aria-label="Close notes"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="transcript-body">
          {/* Lesson objective */}
          <div className="mb-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Lesson Objective
            </h4>
            <p className="text-sm text-foreground bg-[var(--crimson-soft)] rounded-lg p-3">
              {lesson.objective}
            </p>
          </div>

          {/* Key ideas from current step */}
          {currentStep?.learnerNotes && (
            <div className="mb-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Key Ideas
              </h4>
              {currentStep.learnerNotes.keyPoints.map((point, i) => (
                <p key={i} className="text-sm text-foreground py-1">
                  • {point}
                </p>
              ))}
            </div>
          )}

          {/* Detailed explanation */}
          {currentStep?.learnerNotes?.summary && (
            <div className="mb-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Detailed Explanation
              </h4>
              <p className="text-sm text-foreground bg-slate-50 rounded-lg p-3">
                {currentStep.learnerNotes.summary}
              </p>
            </div>
          )}

          {/* Examples */}
          {currentStep?.learnerNotes?.examples && currentStep.learnerNotes.examples.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Examples
              </h4>
              {currentStep.learnerNotes.examples.map((example, i) => (
                <p
                  key={i}
                  className="text-sm text-foreground py-1 font-mono bg-slate-50 rounded-lg p-2 mb-1"
                >
                  {example}
                </p>
              ))}
            </div>
          )}

          {/* Formulas */}
          {currentStep?.learnerNotes?.formulas && currentStep.learnerNotes.formulas.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Formulas
              </h4>
              {currentStep.learnerNotes.formulas.map((formula, i) => (
                <p
                  key={i}
                  className="text-sm text-foreground py-1 font-mono bg-purple-50 rounded-lg p-2 mb-1"
                >
                  {formula}
                </p>
              ))}
            </div>
          )}

          {/* Common mistakes */}
          {currentStep?.learnerNotes?.commonMistakes &&
            currentStep.learnerNotes.commonMistakes.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Common Mistakes
                </h4>
                {currentStep.learnerNotes.commonMistakes.map((mistake, i) => (
                  <p
                    key={i}
                    className="text-sm text-orange-700 py-1 bg-orange-50 rounded-lg p-2 mb-1"
                  >
                    ⚠️ {mistake}
                  </p>
                ))}
              </div>
            )}

          {/* Homework */}
          {lesson.homework && lesson.homework.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Homework
              </h4>
              {lesson.homework.map((hw, i) => (
                <p key={i} className="text-sm text-foreground py-1">
                  • {hw}
                </p>
              ))}
            </div>
          )}

          {/* Teacher notes */}
          {currentStep?.teacherNotes && (
            <div className="mb-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Teacher's Explanation
              </h4>
              <p className="text-sm text-foreground bg-green-50 rounded-lg p-3">
                {currentStep.teacherNotes}
              </p>
            </div>
          )}

          {/* Accessibility notes */}
          {currentStep?.accessibility?.simplifiedExplanation && (
            <div className="mb-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Simpler Explanation
              </h4>
              <p className="text-sm text-foreground bg-amber-50 rounded-lg p-3">
                {currentStep.accessibility.simplifiedExplanation}
              </p>
            </div>
          )}

          {/* User notes */}
          <div className="mb-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              My Notes
            </h4>
            {userNotes.map((note, i) => (
              <p key={i} className="text-sm text-foreground py-1 bg-yellow-50 rounded-lg p-2 mb-1">
                📝 {note}
              </p>
            ))}
            <div className="flex gap-2 mt-2">
              <input
                value={userNoteInput}
                onChange={(e) => setUserNoteInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && userNoteInput.trim() && onAddNote(userNoteInput)
                }
                placeholder="Add your note..."
                className="question-prompt-input flex-1 text-sm"
                autoComplete="off"
              />
              <button
                onClick={() => userNoteInput.trim() && onAddNote(userNoteInput)}
                className="question-prompt-button primary"
                aria-label="Add note"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Lesson Timeline Overlay ────────────────────────────────── */

function LessonTimelineOverlay({
  currentStepIndex,
  steps,
  completion,
  onSelect,
  onClose,
}: {
  currentStepIndex: number;
  steps: readonly string[];
  completion: CompletionTracking;
  onSelect: (index: number) => void;
  onClose: () => void;
}) {
  return (
    <div className="question-prompt-wrapper" role="dialog" aria-label="Lesson timeline">
      <div className="question-prompt-content max-w-lg">
        <h3 className="question-prompt-title flex items-center gap-2">
          <Target className="h-5 w-5" />
          Lesson Timeline
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">Click any completed step to review it.</p>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {steps.map((step, idx) => {
            const label = step.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
            const isCurrent = idx === currentStepIndex;
            const isPast = idx < currentStepIndex;
            return (
              <button
                key={step}
                onClick={() => onSelect(idx)}
                className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                  isCurrent
                    ? "border-primary bg-primary/5"
                    : isPast
                      ? "border-green-200 bg-green-50/50"
                      : "border-border bg-white"
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    isCurrent
                      ? "bg-primary text-white"
                      : isPast
                        ? "bg-green-100 text-green-600"
                        : "bg-slate-100 text-gray-400"
                  }`}
                >
                  {isPast ? <Check className="h-4 w-4" /> : idx + 1}
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${isCurrent ? "text-primary" : isPast ? "text-green-700" : "text-muted-foreground"}`}
                  >
                    {label}
                  </p>
                </div>
                {isCurrent && (
                  <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Completion status */}
        <div className="mt-4 rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-bold text-muted-foreground mb-2">Completion Status</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div
              className={completion.middleQuestionAnswered ? "text-green-600" : "text-gray-400"}
            >
              {completion.middleQuestionAnswered ? "✅" : "⬜"} Middle Question
            </div>
            <div
              className={completion.guidedPracticeAttempted ? "text-green-600" : "text-gray-400"}
            >
              {completion.guidedPracticeAttempted ? "✅" : "⬜"} Guided Practice
            </div>
            <div
              className={
                completion.independentPracticeAttempted ? "text-green-600" : "text-gray-400"
              }
            >
              {completion.independentPracticeAttempted ? "✅" : "⬜"} Independent Practice
            </div>
            <div className={completion.exitTicketAnswered ? "text-green-600" : "text-gray-400"}>
              {completion.exitTicketAnswered ? "✅" : "⬜"} Exit Ticket
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground"
        >
          Close
        </button>
      </div>
    </div>
  );
}

/* ─── Lesson Completion Summary Panel ────────────────────────── */

function LessonCompletionSummaryPanel({
  completion,
  elapsedSeconds,
  onReplay,
  onClose,
}: {
  completion: CompletionTracking;
  elapsedSeconds: number;
  onReplay: () => void;
  onClose: () => void;
}) {
  return (
    <div className="question-prompt-wrapper" role="dialog" aria-label="Lesson completed">
      <div className="question-prompt-content max-w-lg text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Award className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Lesson Completed!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Great work today. Here is your summary.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 text-left">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-muted-foreground">Time Spent</p>
            <p className="text-lg font-bold text-foreground">
              {Math.floor(elapsedSeconds / 60)} min
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-muted-foreground">Questions Asked</p>
            <p className="text-lg font-bold text-foreground">{completion.questionsAskedCount}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-muted-foreground">Middle Question</p>
            <p
              className={`text-sm font-bold ${completion.middleQuestionCorrect ? "text-green-600" : completion.middleQuestionAnswered ? "text-orange-600" : "text-gray-400"}`}
            >
              {completion.middleQuestionCorrect
                ? "✅ Correct"
                : completion.middleQuestionAnswered
                  ? "⚠️ Incorrect"
                  : "Not answered"}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-muted-foreground">Guided Practice</p>
            <p
              className={`text-sm font-bold ${completion.guidedPracticeCorrect ? "text-green-600" : completion.guidedPracticeAttempted ? "text-orange-600" : "text-gray-400"}`}
            >
              {completion.guidedPracticeAttempted
                ? completion.guidedPracticeCorrect
                  ? "✅ Completed"
                  : "⚠️ Needs review"
                : "Not attempted"}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-muted-foreground">Independent Practice</p>
            <p
              className={`text-sm font-bold ${completion.independentPracticeCorrect ? "text-green-600" : completion.independentPracticeAttempted ? "text-orange-600" : "text-gray-400"}`}
            >
              {completion.independentPracticeAttempted
                ? completion.independentPracticeCorrect
                  ? "✅ Completed"
                  : "⚠️ Needs review"
                : "Not attempted"}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-muted-foreground">Exit Ticket</p>
            <p
              className={`text-sm font-bold ${completion.exitTicketCorrect ? "text-green-600" : completion.exitTicketAnswered ? "text-orange-600" : "text-gray-400"}`}
            >
              {completion.exitTicketAnswered
                ? completion.exitTicketCorrect
                  ? "✅ Correct"
                  : "⚠️ Review needed"
                : "Not answered"}
            </p>
          </div>
        </div>

        {/* Weak areas */}
        {completion.weakAreas.length > 0 && (
          <div className="mt-4 rounded-lg bg-orange-50 p-3 text-left">
            <p className="text-xs font-bold text-orange-600 mb-1">Areas to Review</p>
            {completion.weakAreas.map((area, i) => (
              <p key={i} className="text-sm text-orange-700">
                • {area}
              </p>
            ))}
          </div>
        )}

        {/* Recommended next steps */}
        <div className="mt-4 rounded-lg bg-[var(--crimson-soft)] p-3 text-left">
          <p className="text-xs font-bold text-[var(--crimson)] mb-1">Recommended Next Steps</p>
          <p className="text-sm text-[var(--crimson-dark)]">• Practice factor signs</p>
          <p className="text-sm text-[var(--crimson-dark)]">• Try equations with negative coefficients</p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Button onClick={onReplay} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            Replay Lesson
          </Button>
          <Button onClick={onClose}>
            <Home className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Transcript Drawer ──────────────────────────────────────── */

function TranscriptDrawer({
  entries,
  isOpen,
  onClose,
}: {
  entries: TranscriptEntry[];
  isOpen: boolean;
  onClose: () => void;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [entries, isOpen]);

  return (
    <div
      className={`transcript-drawer ${isOpen ? "open" : "closed"}`}
      role="dialog"
      aria-label="Lesson transcript"
      aria-hidden={!isOpen}
    >
      <div className="transcript-content">
        <div className="transcript-header">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <BookOpen className="h-4 w-4" />
            Transcript & History
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-slate-100"
            aria-label="Close transcript"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div ref={bodyRef} className="transcript-body">
          {entries.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              No transcript entries yet. Start the lesson to begin.
            </p>
          )}
          {entries.map((entry) => (
            <div key={entry.id} className={`transcript-entry ${entry.role}`}>
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${
                    entry.role === "student"
                      ? "bg-[var(--crimson-soft)] text-[var(--crimson)]"
                      : entry.role === "teacher"
                        ? "bg-green-100 text-green-600"
                        : entry.role === "board"
                          ? "bg-purple-100 text-purple-600"
                          : "bg-slate-100 text-gray-500"
                  }`}
                >
                  {entry.role === "student"
                    ? "👤"
                    : entry.role === "teacher"
                      ? "🤖"
                      : entry.role === "board"
                        ? "📝"
                        : "ℹ️"}
                </span>
                <span className="capitalize">{entry.role}</span>
                <span className="ml-auto text-[10px] text-muted-foreground/60">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-foreground">{entry.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Mode Switcher Overlay ──────────────────────────────────── */

function ModeSwitcherOverlay({
  currentMode,
  onSelect,
  onClose,
}: {
  currentMode: LearningMode;
  onSelect: (mode: LearningMode) => void;
  onClose: () => void;
}) {
  return (
    <div className="question-prompt-wrapper" role="dialog" aria-label="Learning mode selector">
      <div className="question-prompt-content max-w-lg">
        <h3 className="question-prompt-title flex items-center gap-2">
          <Accessibility className="h-5 w-5" />
          Choose Learning Mode
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Select how you want to learn. You can change this at any time.
        </p>
        <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
          {LEARNING_MODES.map((mode) => (
            <button
              key={mode.key}
              onClick={() => onSelect(mode.key)}
              className={`mode-switch-button ${currentMode === mode.key ? "active" : ""}`}
            >
              {currentMode === mode.key && <Check className="h-3.5 w-3.5" />}
              {mode.label}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export { LearningWhiteboardWithRef as LearningWhiteboard };
