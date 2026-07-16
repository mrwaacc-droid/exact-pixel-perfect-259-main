/**
 * AIVideoClassroom.tsx
 *
 * Klassruum's main product asset: a serious AI video classroom where the learner
 * feels like a real teacher is present, writing, explaining, checking understanding,
 * and saving the lesson for review.
 *
 * Layout: 26% Teacher Panel | 74% Whiteboard
 * Three primary assets: AI Teacher Video Panel, Learning Whiteboard, Lesson Intelligence Layer
 */

import React, { useEffect, useRef, useState, useCallback, useMemo, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import "../../styles/video-classroom.css";
import "../../styles/classroom-premium.css";
import type { MathTeachingItem } from "@/lib/lesson-models";
import type { LearningMode, TeacherVideoState, TranscriptEntry } from "@/lib/types";
import type {
  ClassroomLessonContent,
  ClassroomConfidenceOption,
  ClassroomVisualAsset,
} from "@/lib/classroom-content";
import { buildDemoLessonContent } from "@/lib/classroom-content.demo";
import {
  speak,
  startListening,
  stopListening,
  setNarrationMuted,
  setGlobalRate,
} from "@/lib/speech";
import { answerLearnerQuestion } from "@/lib/classroom-ai.functions";
import { recordSessionEvent } from "@/lib/events.functions";
import { loadAccessibility, prefsForMode, saveAccessibility } from "@/lib/accessibility";
import type { AccessibilityPrefs, TextScale } from "@/lib/accessibility";
import { InlineEngagementArea } from "./InlineEngagementArea";
import type { EngagementPrompt } from "@/lib/types";
import { useTeacherVoice } from "@/hooks/useTeacherVoice";
import type { TeacherSpeechType } from "@/lib/voice/types";
import { analyzeSentimentKeywords, type SentimentResult } from "@/lib/sentiment-analysis";
import {
  createConfusionTracker,
  deriveAdaptiveIntervention,
  type ConfusionState,
} from "@/lib/classroom-confusion-tracker";
import { generateAdaptiveIntervention } from "@/lib/classroom-adaptive-interjection";
import {
  loadLearnerProfile,
  saveLearnerSessionSummary,
  type LearnerProfile,
} from "@/lib/classroom-personalization.functions";
import { decideAside, resetTeacherBrain, type TeacherAside } from "@/lib/classroom-teacher-brain";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type TeachingPhase =
  | "idle"
  | "writing"
  | "reading"
  | "explaining"
  | "warning"
  | "pausing"
  | "asking"
  | "practice"
  | "exit_ticket"
  | "complete";

type PracticeMode = "guided" | "independent";
type LearningDrawerTab = "notes" | "transcript" | "progress" | "resources" | "questions";
type BoardSpeechLine = {
  id: string;
  text: string;
  tone: "read" | "explain" | "warning" | "answer";
};

interface PracticeProblem {
  equation: string;
  question: string;
  correctAnswer: string;
  hint: string;
  /** Progressive hints, revealed one level at a time (Hint 1 ? Hint 2 ? Hint 3). */
  hints: string[];
  /** Misconception watch: a wrong-but-common answer and the targeted correction. */
  misconception: { answer: string; note: string };
}

/** A teaching interjection that pauses the lesson flow at a section boundary. */
type Interjection = "recap" | "thinking_pause" | "middle_question" | "confidence";

/** Learning evidence recorded across the session (no exams, just activity). */
interface LearningResults {
  questionsAsked: number;
  raisedHands: number;
  practiceAttempts: number;
  practiceCorrect: number;
  hintsUsed: number;
  confidenceChecks: { section: string; level: string }[];
  middleQuestionCorrect: boolean | null;
  misconceptionsDetected: number;
  events: string[];
  score?: number; // out of 100
}

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const STORAGE_KEY_PREFIX = "klassruum_progress_";

/**
 * Course type drives how a classroom is presented. The system decides this
 * automatically from the course/subject � no manual switch:
 *   mathematics ? calculations + graphs (a live graph panel beside the board)
 *   science     ? labelled illustrations / diagrams
 *   technical   ? images + step illustrations
 *   social      ? theory only (wider reading column, no visual panel)
 */
type CourseType = "mathematics" | "science" | "technical" | "social";

/** Auto-detect the course type from the subject/course text. */
function detectCourseType(subject: string, course: string): CourseType {
  const t = `${subject} ${course}`.toLowerCase();
  if (/math|algebra|calculus|geometry|trigonometry|statistics|quadratic|equation|graph/.test(t))
    return "mathematics";
  if (/physics|chemistry|biology|science|anatomy|geology|astronomy/.test(t)) return "science";
  if (
    /comput|program|coding|engineering|technical|electr|mechanic|design|robotics|it\b|software/.test(
      t,
    )
  )
    return "technical";
  if (
    /history|geography|civic|social|economics|literature|language|english|philosophy|law|business/.test(
      t,
    )
  )
    return "social";
  return "mathematics";
}

const COURSE_TYPE_META: Record<
  CourseType,
  { label: string; icon: string; hasVisual: boolean; visualTitle: string }
> = {
  mathematics: {
    label: "Mathematics",
    icon: "Math",
    hasVisual: true,
    visualTitle: "Graph & Strategy",
  },
  science: { label: "Science", icon: "Sci", hasVisual: true, visualTitle: "Illustration" },
  technical: { label: "Technical", icon: "Tech", hasVisual: true, visualTitle: "Illustration" },
  social: { label: "Social Science", icon: "Read", hasVisual: false, visualTitle: "" },
};

const LESSON_PLAN_SECTIONS = [
  { key: "welcome", label: "Welcome", icon: "Start" },
  { key: "concept", label: "Concept", icon: "Idea" },
  { key: "worked_example", label: "Worked Example", icon: "Step" },
  { key: "guided_practice", label: "Guided Practice", icon: "Guide" },
  { key: "independent_practice", label: "Independent", icon: "Try" },
  { key: "summary", label: "Summary", icon: "Sum" },
  { key: "exit_ticket", label: "Exit Ticket", icon: "Exit" },
  { key: "complete", label: "Complete", icon: "Done" },
] as const;

type LessonSectionKey = (typeof LESSON_PLAN_SECTIONS)[number]["key"];

const SPEED_MAP: Record<string, number> = {
  slow: 40,
  normal: 25,
  fast: 15,
};

const PROCEDURAL_PHASE_PAUSE_MS = 900;
const PROCEDURAL_START_PAUSE_MS = 1200;

function clampTeacherSpeed(speed: number) {
  return Math.max(0.75, Math.min(1.15, Number(speed.toFixed(2))));
}

function learnerModeForProfile(profile: LearnerProfile): LearningMode | null {
  if (profile.baselineLoad > 0.6 || profile.weakTopics.length >= 2) return "extra_support";
  if (profile.baselineLoad < 0.25 && profile.strongTopics.length > profile.weakTopics.length) {
    return "challenge";
  }
  return null;
}

function speechBucketForPace(pace: number): "slow" | "normal" | "fast" {
  if (pace <= 0.85) return "slow";
  if (pace >= 1.15) return "fast";
  return "normal";
}

function estimateProceduralSpeechMs(text: string, rate = 0.92) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const sentencePauses = (text.match(/[.!?:;]\s/g) ?? []).length * 650;
  const wordsPerMinute = 135 * Math.max(0.5, Math.min(1.2, rate));
  const estimatedSpeech = (words / wordsPerMinute) * 60_000;

  return Math.min(
    120_000,
    Math.max(6_000, Math.round(estimatedSpeech * 1.85 + sentencePauses + 2_500)),
  );
}

const QUICK_ACTIONS = [
  "I don't understand",
  "Repeat",
  "Give example",
  "Explain simpler",
  "Slow down",
  "Continue",
];

const LEARNING_MODES: { value: LearningMode; label: string; icon: string; description: string }[] =
  [
    {
      value: "standard",
      label: "Standard",
      icon: "Std",
      description: "Balanced voice, board, and captions.",
    },
    {
      value: "deaf",
      label: "Deaf Mode",
      icon: "Text",
      description: "Captions stay on with text-first prompts.",
    },
    {
      value: "blind",
      label: "Blind Mode",
      icon: "Audio",
      description: "Voice-first teaching and audio prompts.",
    },
    {
      value: "adhd_focus",
      label: "ADHD Focus",
      icon: "Focus",
      description: "Cleaner lesson flow with fewer distractions.",
    },
    {
      value: "dyslexia",
      label: "Dyslexia Friendly",
      icon: "Read",
      description: "Larger readable text and calmer spacing.",
    },
    {
      value: "speech_difficulty",
      label: "Speech Difficulty",
      icon: "Type",
      description: "Type-first answers with larger controls.",
    },
    {
      value: "extra_support",
      label: "Extra Support",
      icon: "Help",
      description: "More scaffolding, hints, and slower pacing.",
    },
    {
      value: "challenge",
      label: "Challenge",
      icon: "Plus",
      description: "A faster path with harder checks.",
    },
  ];

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

interface Props {
  autoPlay?: boolean;
  /**
   * The lesson the classroom teaches. Defaults to the quadratic-equations demo so
   * existing demo/marketing routes keep working unchanged. Real classroom routes
   * pass a lesson loaded from the database (see `loadClassroomLesson`).
   */
  content?: ClassroomLessonContent;
  /**
   * Real classroom_sessions id backing this lesson. When present, key learning
   * events (started, questions, completion) are persisted to the database so
   * institutions get real learning evidence. Omitted for the demo.
   */
  sessionId?: string;
  /** Called when the learner ends the lesson (e.g. to navigate away). */
  onExit?: () => void;
}

export function AIVideoClassroom({ autoPlay = false, content, sessionId, onExit }: Props) {
  // The lesson content this classroom teaches. Memoised so the demo bundle is
  // built once and the teaching sequence reference stays stable across renders.
  const lesson = useMemo(() => content ?? buildDemoLessonContent(), [content]);
  const sequence = lesson.sequence;
  const practiceProblems = lesson.practiceProblems;

  // Per-lesson identity (replaces the old module-level demo constants).
  const TEACHER_NAME = lesson.teacher.name;
  // Gender-matched portrait: a man for a male voice, a woman for a female voice.
  // Uses the lesson's own image when provided, else the matching default.
  const TEACHER_VOICE = lesson.teacher.voice;
  const TEACHER_IMAGE =
    lesson.teacher.image ||
    (TEACHER_VOICE === "female" ? "/images/teachers/woman.png" : "/images/teachers/man.png");
  const TEACHER_PROFILE_ID = TEACHER_VOICE === "female" ? "ms_amani" : "mr_klass";
  const TEACHER_VOICE_PROFILE_ID = `${TEACHER_PROFILE_ID}_voice`;
  // Optional real-teacher video feed (shown instead of the portrait when present).
  const TEACHER_VIDEO = (lesson.teacher as { videoUrl?: string }).videoUrl;
  const INSTITUTION = lesson.institution;
  const COURSE = lesson.course;
  const COURSE_LEVEL = lesson.courseLevel ?? lesson.academicLevel;
  const LESSON_SUBJECT = lesson.subject;
  const LESSON_TITLE = lesson.title;
  const LESSON_EQUATION = lesson.equation ?? "";
  const LESSON_OPENING_NARRATIVE = lesson.openingNarrative;
  const FULL_LEARNER_NOTES = lesson.learnerNotes;
  const ACADEMIC_LEVEL = lesson.academicLevel;
  const PACING_PLAN = lesson.pacingPlan;
  const VISUAL_PLAN = useMemo(() => lesson.visualPlan ?? [], [lesson.visualPlan]);
  const LESSON_COURSE_TYPE = useMemo(
    () => detectCourseType(lesson.subject, lesson.course),
    [lesson.subject, lesson.course],
  );
  // Per-lesson localStorage key so different lessons don't clobber each other.
  const STORAGE_KEY = STORAGE_KEY_PREFIX + lesson.lessonId;
  // Board-index ? section key map for the lesson-plan jump navigation.
  const SECTION_START_INDEX = useMemo(() => {
    const map: Partial<Record<LessonSectionKey, number>> = {};
    for (const stop of lesson.sectionStops) {
      if (map[stop.key as LessonSectionKey] === undefined) {
        map[stop.key as LessonSectionKey] = stop.startIndex;
      }
    }
    return map;
  }, [lesson.sectionStops]);

  // Teaching-moment content aliases (was module-level demo constants). Some are
  // optional for real generated lessons � the flow guards on them being present.
  const SECTION_GOALS = lesson.sectionGoals;
  const SECTION_RECAPS = lesson.sectionRecaps;
  const THINKING_PAUSES = lesson.thinkingPauses;
  const MIDDLE_QUESTION = lesson.middleQuestion;
  const EXIT_REFLECTION = lesson.exitReflection;
  const CONFIDENCE_OPTIONS = lesson.confidenceOptions;
  const EXIT_TICKET_QUESTION = lesson.exitTicket;

  // Where the timed teaching-moment interjections fire. Derived from the lesson
  // so real lessons (with arbitrary section boundaries) behave sensibly; for the
  // demo these resolve to the original hardwired indices (3 and 6).
  const RECAP_AT_INDEX = useMemo(() => {
    const we = lesson.sectionStops.find((s) => s.key === "worked_example");
    return we && we.startIndex > 0 ? we.startIndex : -1;
  }, [lesson.sectionStops]);
  const MIDDLE_QUESTION_AT_INDEX = useMemo(
    () => (lesson.sequence.length >= 4 ? Math.floor(lesson.sequence.length / 2) : -1),
    [lesson.sequence.length],
  );
  // Rough lesson-length estimate for the start screen (teach + practice).
  const estimatedMinutes = useMemo(
    () =>
      PACING_PLAN?.targetDurationMinutes ??
      Math.max(
        30,
        Math.round(lesson.sequence.length * 2.5 + lesson.practiceProblems.length * 4 + 8),
      ),
    [lesson.sequence.length, lesson.practiceProblems.length, PACING_PLAN?.targetDurationMinutes],
  );

  // -- Core State ----------------------------------------
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState<TeachingPhase>("idle");
  const [teacherState, setTeacherState] = useState<TeacherVideoState>("paused");
  const [learningMode, setLearningMode] = useState<LearningMode>("standard");
  const [isPaused, setIsPaused] = useState(false);

  // When an accessibility-oriented mode is chosen, fold its sensible display
  // defaults (text scale / contrast / motion) into the live settings.
  useEffect(() => {
    const extra = prefsForMode(learningMode);
    if (Object.keys(extra).length > 0) {
      setA11y((prev) => ({ ...prev, ...extra }));
    }
  }, [learningMode]);

  // -- Board State ---------------------------------------
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentItem = sequence[currentIndex];
  const [writtenLines, setWrittenLines] = useState<MathTeachingItem[]>([]);
  const [currentWritingText, setCurrentWritingText] = useState("");
  const [isWriting, setIsWriting] = useState(false);
  const [boardSpeech, setBoardSpeech] = useState<Record<string, BoardSpeechLine[]>>({});
  const [boardZoom, setBoardZoom] = useState(100);
  const boardRef = useRef<HTMLDivElement>(null);
  const boardSpeechTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // -- Whiteboard Tool State ------------------------------
  type BoardTool = "pen" | "cursor" | "chat" | "text" | "image";
  const [boardTool, setBoardTool] = useState<BoardTool>("cursor");
  const [selectedLineIdx, setSelectedLineIdx] = useState<number | null>(null);
  const [highlightedLines, setHighlightedLines] = useState<Set<number>>(new Set());
  const [annotatingLineIdx, setAnnotatingLineIdx] = useState<number | null>(null);
  const [annotationText, setAnnotationText] = useState("");
  const [boardAnnotations, setBoardAnnotations] = useState<Record<number, string>>({});

  // Live "key points" for the right rail � the summary-worthy lines written so
  // far (headings, concepts, instructions, answers). Most-recent first, capped.
  // Declared here (before any early return) so hook order stays stable.
  const boardKeyPoints = useMemo(() => {
    return writtenLines
      .filter((l) => ["concept", "instruction", "answer", "question", "equation"].includes(l.type))
      .map((l) => l.boardText)
      .filter(Boolean)
      .slice(-6);
  }, [writtenLines]);

  const visualDescriptions = useMemo(
    () => VISUAL_PLAN.map((v) => `${v.title}: ${v.description}`).slice(0, 10),
    [VISUAL_PLAN],
  );



  // -- Explanation State ---------------------------------
  const [currentExplanation, setCurrentExplanation] = useState<MathTeachingItem | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  // -- Caption State -------------------------------------
  const [captionText, setCaptionText] = useState("");
  const [captionSpeaker, setCaptionSpeaker] = useState(TEACHER_NAME);
  const teacherVoice = useTeacherVoice();
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [teacherVoiceSpeed, setTeacherVoiceSpeed] = useState(0.92);

  // -- Transcript State ----------------------------------
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  /** Whether the live caption bar is shown (toggled by the CC control). */
  const [captionsOn, setCaptionsOn] = useState(false);

  // -- Notes State ---------------------------------------
  const [learningDrawerTab, setLearningDrawerTab] = useState<LearningDrawerTab>("notes");

  // -- Question State ------------------------------------
  const [questionOpen, setQuestionOpen] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [isListening, setIsListening] = useState(false);
  /**
   * When the teacher asks the learner to clarify an unclear question, we hold the
   * clarifying prompt + quick options here and remember the original question, so
   * the learner's next message is treated as the clarification (not a new turn).
   */
  const [clarify, setClarify] = useState<{
    question: string;
    original: string;
    options: string[];
  } | null>(null);
  /** A short follow-up offer shown after an answer ("Want an example?"). */
  const [followUp, setFollowUp] = useState<string | null>(null);
  /** Active speech recognizer while the learner asks a question by voice. */
  const recognizerRef = useRef<ReturnType<typeof startListening>>(null);
  /** Pending raise-hand auto-transition timers (cancelled if the hand is lowered). */
  const raiseHandTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // -- Practice State ------------------------------------
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("guided");
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceAnswer, setPracticeAnswer] = useState("");
  const [practiceFeedback, setPracticeFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [practiceFeedbackText, setPracticeFeedbackText] = useState("");

  // -- Exit Ticket State ---------------------------------
  const [exitTicketOpen, setExitTicketOpen] = useState(false);
  const [exitTicketAnswer, setExitTicketAnswer] = useState("");
  const [exitTicketFeedback, setExitTicketFeedback] = useState<"correct" | "incorrect" | null>(
    null,
  );

  // -- Completion State ----------------------------------
  const [completionOpen, setCompletionOpen] = useState(false);
  const [takeawayScore, setTakeawayScore] = useState<number | null>(null);

  // -- Mode / Settings Selector State --------------------
  const [modeSelectorOpen, setModeSelectorOpen] = useState(false);
  const [supportMenuOpen, setSupportMenuOpen] = useState(false);
  const [classroomView, setClassroomView] = useState<"simple" | "full">("simple");

  // -- Learner Settings (display, sound, captions) -------
  // Backed by the shared accessibility prefs, plus classroom-local extras. Built
  // big and clear so it works for grade-one learners up to tertiary students.
  const [a11y, setA11y] = useState<AccessibilityPrefs>(() => loadAccessibility());
  const [narrationOn, setNarrationOn] = useState(true);
  const [voiceSpeed, setVoiceSpeed] = useState<"slow" | "normal" | "fast">("normal");
  const [captionSize, setCaptionSize] = useState<"sm" | "md" | "lg">("md");

  // Apply display prefs (text scale / contrast / motion) whenever they change.
  useEffect(() => {
    saveAccessibility(a11y);
  }, [a11y]);
  // Mute/unmute the teacher's voice globally.
  useEffect(() => {
    setNarrationMuted(!narrationOn);
  }, [narrationOn]);
  // Narration speed ? global speech rate.
  useEffect(() => {
    setGlobalRate(voiceSpeed === "slow" ? 0.8 : voiceSpeed === "fast" ? 1.25 : 1);
  }, [voiceSpeed]);

  // -- Raise Hand State ----------------------------------
  const [raiseHand, setRaiseHand] = useState<"idle" | "raised" | "acknowledged" | "resolved">(
    "idle",
  );

  // -- Current Lesson Section ----------------------------
  const [currentSection, setCurrentSection] = useState<LessonSectionKey>("welcome");


  // -- Follow-up confirmation bar (after teacher answers a question) ------
  // Shown inline under the caption bar so it never blocks the board.
  const [followUpActive, setFollowUpActive] = useState(false);
  const followUpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // -- Question-pause flag � lesson pauses while learner is asking --------
  const [questionPaused, setQuestionPaused] = useState(false);

  // -- Teaching Moments State ----------------------------
  const [recapOpen, setRecapOpen] = useState<string | null>(null);
  const [thinkingPauseText, setThinkingPauseText] = useState<string | null>(null);
  const [confidenceOpen, setConfidenceOpen] = useState(false);
  const [middleQuestionOpen, setMiddleQuestionOpen] = useState(false);
  const [middleFeedback, setMiddleFeedback] = useState<{ correct: boolean; text: string } | null>(
    null,
  );
  const [reflectionOpen, setReflectionOpen] = useState(false);
  // Progressive hint level for the active practice problem (0 = none shown)
  const [hintLevel, setHintLevel] = useState(0);

  // -- Sentiment & Confusion State ----------------------
  const confusionTracker = useMemo(() => createConfusionTracker(), [lesson.lessonId]);
  const [lastSentiment, setLastSentiment] = useState<SentimentResult | null>(null);

  // -- Cross-Lesson Personalization ---------------------
  const [learnerProfile, setLearnerProfile] = useState<LearnerProfile | null>(null);
  const learnerProfileAppliedRef = useRef(false);

  // -- Teacher Brain State ------------------------------
  const [teacherAside, setTeacherAside] = useState<TeacherAside | null>(null);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const lastInteractionRef = useRef<number>(Date.now());

  // -- Learning Results Recorder -------------------------
  const [results, setResults] = useState<LearningResults>({
    questionsAsked: 0,
    raisedHands: 0,
    practiceAttempts: 0,
    practiceCorrect: 0,
    hintsUsed: 0,
    confidenceChecks: [],
    middleQuestionCorrect: null,
    misconceptionsDetected: 0,
    events: [],
  });
  const startTimeRef = useRef<number>(Date.now());

  /** Record a learning event (the page's memory of the learning journey). */
  const logEvent = useCallback((event: string) => {
    setResults((prev) => ({
      ...prev,
      events: [...prev.events, `${new Date().toLocaleTimeString()} � ${event}`],
    }));
  }, []);

  /** Persist a learning event to the database (best-effort, fire-and-forget).
   *  No-ops for the demo / when there is no real session backing the lesson. */
  const recordEvent = useCallback(
    (eventType: string, payload?: Record<string, unknown>) => {
      if (!sessionId) return;
      recordSessionEvent({
        data: { session_id: sessionId, event_type: eventType, actor_role: "student", payload },
      }).catch(() => {
        /* best-effort: never block the lesson on telemetry */
      });
    },
    [sessionId],
  );

  const activeVisual = useMemo(() => {
    if (!currentItem) return null;
    if (currentItem.visualCue) {
      return {
        id: currentItem.id + "_cue",
        kind: currentItem.visualCue.kind,
        source: currentItem.visualCue.imageUrl ? "uploaded_material" : "fallback",
        title: currentItem.visualCue.title,
        description: currentItem.visualCue.description,
        alt: currentItem.visualCue.imageAlt ?? currentItem.visualCue.title,
        imageUrl: currentItem.visualCue.imageUrl,
        teacherCue: currentItem.visualCue.teacherCue ?? "Inspect this step carefully.",
      } as ClassroomVisualAsset;
    }
    const anchored = VISUAL_PLAN.find((v) => v.anchorId === currentItem.id);
    if (anchored) return anchored;

    const sectionAnchored = VISUAL_PLAN.find((v) => v.anchorId === currentSection);
    if (sectionAnchored) return sectionAnchored;

    if (VISUAL_PLAN.length > 0) {
      return VISUAL_PLAN[0];
    }
    return null;
  }, [currentItem, currentSection, VISUAL_PLAN]);

  const prevVisualIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (activeVisual && activeVisual.id !== prevVisualIdRef.current) {
      prevVisualIdRef.current = activeVisual.id;
      setLearningDrawerTab("resources");
      logEvent(`Auto-revealed resources tab for active visual: ${activeVisual.title}`);
    }
  }, [activeVisual, logEvent]);

  // Index we should resume writing from once an interjection is resolved
  const pendingNextIndexRef = useRef<number | null>(null);
  // Track which one-time interjections have already fired
  const firedInterjectionsRef = useRef<Set<string>>(new Set());

  // -- Progress ------------------------------------------
  const progress = useMemo(() => {
    if (phase === "complete" || completionOpen) return 100;
    if (phase === "exit_ticket") return 90;
    if (phase === "practice") return 70 + (practiceIndex / practiceProblems.length) * 20;
    return Math.round(((currentIndex + 1) / sequence.length) * 70);
  }, [currentIndex, phase, completionOpen, practiceIndex]);

  const teachingMode = useMemo(() => {
    if (teacherState === "writing") return "demonstrating";
    if (teacherState === "asking_question" || phase === "exit_ticket" || phase === "asking" || phase === "practice") return "asking";
    if (teacherState === "correcting" || teacherState === "warning") return "reteaching";
    if (teacherState === "explaining" && currentSection === "summary") return "recap";
    return "explaining";
  }, [teacherState, phase, currentSection]);

  // -- Live session clock (mm:ss since the lesson started) ---------------
  const [elapsedSec, setElapsedSec] = useState(0);
  useEffect(() => {
    if (!started) return;
    const id = setInterval(
      () => setElapsedSec(Math.max(0, Math.floor((Date.now() - startTimeRef.current) / 1000))),
      1000,
    );
    return () => clearInterval(id);
  }, [started]);
  const clock = `${String(Math.floor(elapsedSec / 60)).padStart(2, "0")}:${String(elapsedSec % 60).padStart(2, "0")}`;

  // Map board index to lesson section (driven by the lesson's section stops, so
  // it works for the demo and any real generated lesson alike).
  useEffect(() => {
    if (phase === "complete" || completionOpen) {
      setCurrentSection("complete");
      return;
    }
    if (phase === "exit_ticket") {
      setCurrentSection("exit_ticket");
      return;
    }
    if (phase === "practice") {
      setCurrentSection(practiceMode === "guided" ? "guided_practice" : "independent_practice");
      return;
    }
    // Find the last section stop at or before the current board index.
    let key: LessonSectionKey = "welcome";
    for (const stop of lesson.sectionStops) {
      if (currentIndex >= stop.startIndex) key = stop.key as LessonSectionKey;
      else break;
    }
    setCurrentSection(key);
  }, [currentIndex, phase, completionOpen, practiceMode, lesson.sectionStops]);

  // -- Save/Load Progress --------------------------------
  const saveProgress = useCallback(() => {
    try {
      const data = {
        currentIndex,
        writtenLinesIds: writtenLines.map((l) => l.id),
        progress,
        currentSection,
        phase,
        transcriptCount: transcript.length,
        // Learning evidence (no exams � just activity)
        questionsAsked: results.questionsAsked,
        raisedHands: results.raisedHands,
        practiceAttempts: results.practiceAttempts,
        practiceCorrect: results.practiceCorrect,
        confidenceChecks: results.confidenceChecks.length,
        timeSpentSeconds: Math.round((Date.now() - startTimeRef.current) / 1000),
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }, [currentIndex, writtenLines, progress, currentSection, phase, transcript.length, results]);

  // Auto-save every 10 seconds
  useEffect(() => {
    if (!started) return;
    const interval = setInterval(saveProgress, 10000);
    return () => clearInterval(interval);
  }, [started, saveProgress]);

  // Save on phase changes
  useEffect(() => {
    if (started) saveProgress();
  }, [phase, started, saveProgress]);

  const [savedProgress, setSavedProgress] = useState<{
    exists: boolean;
    section?: string;
    progress?: number;
    savedAt?: string;
  } | null>(null);

  // Check for saved progress on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setSavedProgress({
          exists: true,
          section: data.currentSection,
          progress: data.progress,
          savedAt: data.savedAt,
        });
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Load cross-lesson learner profile (real sessions only, not demo)
  useEffect(() => {
    if (!sessionId) return; // demo mode: skip
    loadLearnerProfile({
      data: { course_id: (lesson as any).courseId, lesson_id: lesson.lessonId },
    })
      .then((result) => {
        if (result.profile) setLearnerProfile(result.profile);
      })
      .catch(() => {
        /* profile unavailable, teach with defaults */
      });
  }, [sessionId, lesson.lessonId]);

  // Apply learner profile to initial teaching parameters.
  useEffect(() => {
    if (!learnerProfile || learnerProfileAppliedRef.current) return;
    learnerProfileAppliedRef.current = true;

    setTeacherVoiceSpeed(clampTeacherSpeed(learnerProfile.optimalPace));
    setVoiceSpeed(speechBucketForPace(learnerProfile.optimalPace));

    const recommendedMode = learnerModeForProfile(learnerProfile);
    if (recommendedMode && learningMode === "standard") {
      setLearningMode(recommendedMode);
      logEvent(`Adaptive learning mode selected: ${recommendedMode}`);
    }
  }, [learnerProfile, learningMode, logEvent]);

  // -- Refs ----------------------------------------------
  const writingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sequenceRef = useRef(0);
  // Always-fresh index + function refs so the teaching chain never runs on a
  // stale closure (this is what caused the lesson to repeat one section).
  const currentIndexRef = useRef(0);
  const readBoardRef = useRef<(item: MathTeachingItem, seq: number, idx: number) => void>(() => {});
  const explainStepRef = useRef<(item: MathTeachingItem, seq: number, idx: number) => void>(
    () => {},
  );
  const showWarningRef = useRef<(item: MathTeachingItem, seq: number, idx: number) => void>(
    () => {},
  );
  const advanceRef = useRef<(seq: number, idx: number) => void>(() => {});
  const resumeAfterInterjectionRef = useRef<() => void>(() => {});

  // -- Cleanup -------------------------------------------
  useEffect(() => {
    return () => {
      if (writingTimerRef.current) clearTimeout(writingTimerRef.current);
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
      raiseHandTimersRef.current.forEach(clearTimeout);
      stopListening(recognizerRef.current);
    };
  }, []);

  // -- Auto-scroll board ---------------------------------
  useEffect(() => {
    if (boardRef.current) {
      boardRef.current.scrollTop = boardRef.current.scrollHeight;
    }
  }, [writtenLines, currentWritingText, boardSpeech]);

  // -- Auto-play on mount --------------------------------
  useEffect(() => {
    if (autoPlay && !started) {
      const t = setTimeout(() => handleStartLesson(), 500);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay]);

  // ------------------------------------------------------
  // Teaching Engine
  // ------------------------------------------------------

  const addTranscript = useCallback(
    (role: TranscriptEntry["role"], text: string, boardItemId?: string) => {
      setTranscript((prev) => [
        ...prev,
        {
          id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          role,
          text,
          timestamp: new Date().toLocaleTimeString(),
          boardItemId,
        },
      ]);
    },
    [],
  );

  const clearTimers = useCallback(() => {
    if (writingTimerRef.current) clearTimeout(writingTimerRef.current);
    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    boardSpeechTimersRef.current.forEach(clearTimeout);
    boardSpeechTimersRef.current = [];
  }, []);

  const writeSpeechOnBoard = useCallback(
    (itemId: string, text: string, tone: BoardSpeechLine["tone"], seq?: number) => {
      const lineId = `${tone}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      setBoardSpeech((prev) => ({
        ...prev,
        [itemId]: [...(prev[itemId] ?? []), { id: lineId, text: "", tone }],
      }));

      let charIdx = 0;
      const speed = tone === "warning" ? 18 : 14;
      const writeChar = () => {
        if (seq !== undefined && seq !== sequenceRef.current) return;
        charIdx += 1;
        setBoardSpeech((prev) => ({
          ...prev,
          [itemId]: (prev[itemId] ?? []).map((line) =>
            line.id === lineId ? { ...line, text: text.slice(0, charIdx) } : line,
          ),
        }));
        if (charIdx < text.length) {
          boardSpeechTimersRef.current.push(setTimeout(writeChar, speed));
        }
      };
      boardSpeechTimersRef.current.push(setTimeout(writeChar, 80));
    },
    [],
  );

  const speakTeacher = useCallback(
    (
      text: string,
      speechType: TeacherSpeechType,
      teachingItemId?: string,
      onSpeechEnd?: () => void,
    ) => {
      if (learningMode === "deaf" || !voiceEnabled) {
        // In deaf mode or voice disabled, fire callback immediately so the teaching chain continues
        onSpeechEnd?.();
        return;
      }
      void teacherVoice.speak({
        sessionId: sessionId ?? "demo-session",
        lessonId: lesson.lessonId,
        teachingItemId,
        teacherProfileId: TEACHER_PROFILE_ID,
        voiceProfileId: TEACHER_VOICE_PROFILE_ID,
        voiceGender: TEACHER_VOICE,
        text,
        speechType,
        voiceEnabled,
        speed: teacherVoiceSpeed,
        onCaption: setCaptionText,
        onEnd: onSpeechEnd,
      });
    },
    [
      learningMode,
      lesson.lessonId,
      sessionId,
      teacherVoice,
      voiceEnabled,
      teacherVoiceSpeed,
      TEACHER_PROFILE_ID,
      TEACHER_VOICE_PROFILE_ID,
      TEACHER_VOICE,
    ],
  );

  const createProceduralSpeechEnd = useCallback(
    (text: string, onComplete: () => void, pauseMs = PROCEDURAL_PHASE_PAUSE_MS) => {
      let completed = false;
      const fallbackTimer = setTimeout(finish, estimateProceduralSpeechMs(text, teacherVoiceSpeed));
      phaseTimerRef.current = fallbackTimer;

      function finish() {
        if (completed) return;
        completed = true;

        if (phaseTimerRef.current === fallbackTimer) {
          clearTimeout(fallbackTimer);
          phaseTimerRef.current = null;
        }

        if (pauseMs <= 0) {
          onComplete();
          return;
        }

        const pauseTimer = setTimeout(onComplete, pauseMs);
        phaseTimerRef.current = pauseTimer;
      }

      return finish;
    },
    [teacherVoiceSpeed],
  );

  /** Write text letter by letter onto the board. `idx` is threaded through the
   *  whole teaching chain so flow control never reads stale `currentIndex`. */
  const writeOnBoard = useCallback(
    (item: MathTeachingItem, seq: number, idx: number) => {
      if (seq !== sequenceRef.current) return;

      currentIndexRef.current = idx;
      setCurrentIndex(idx);
      setPhase("writing");
      setTeacherState("writing");
      setIsWriting(true);
      setCurrentWritingText("");
      setBoardSpeech((prev) => {
        if (!prev[item.id]) return prev;
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
      setCaptionText("Writing on board...");
      setCaptionSpeaker(TEACHER_NAME);

      const speed = SPEED_MAP[item.writingSpeed ?? "normal"];
      const text = item.boardText;
      let charIdx = 0;

      const writeChar = () => {
        if (seq !== sequenceRef.current) return;
        if (charIdx < text.length) {
          setCurrentWritingText(text.slice(0, charIdx + 1));
          charIdx++;
          writingTimerRef.current = setTimeout(writeChar, speed);
        } else {
          // Writing complete
          setIsWriting(false);
          setWrittenLines((prev) => (prev.some((l) => l.id === item.id) ? prev : [...prev, item]));
          setCurrentWritingText("");
          addTranscript("board", item.boardText, item.id);

          // Move to reading phase
          phaseTimerRef.current = setTimeout(() => readBoardRef.current(item, seq, idx), 600);
        }
      };

      writingTimerRef.current = setTimeout(writeChar, speed);
    },
    [addTranscript],
  );

  /** Teacher reads the board text exactly */
  const readBoard = useCallback(
    (item: MathTeachingItem, seq: number, idx: number) => {
      if (seq !== sequenceRef.current) return;

      setPhase("reading");
      setTeacherState("speaking");
      setCaptionText(item.exactSpokenText);
      setCaptionSpeaker(TEACHER_NAME);
      setShowExplanation(false);
      setShowWarning(false);
      addTranscript("teacher", item.exactSpokenText, item.id);
      writeSpeechOnBoard(item.id, item.exactSpokenText, "read", seq);

      // Wait for narration to finish before moving on. The fallback is only a
      // stall guard; it is deliberately slower than the expected speech length.
      const advanceAfterReading = createProceduralSpeechEnd(item.exactSpokenText, () => {
        if (seq === sequenceRef.current) {
          explainStepRef.current(item, seq, idx);
        }
      });

      speakTeacher(item.exactSpokenText, "board_reading", item.id, advanceAfterReading);
    },
    [addTranscript, createProceduralSpeechEnd, speakTeacher, writeSpeechOnBoard],
  );

  /** Teacher gives deeper narrative explanation */
  const explainStep = useCallback(
    (item: MathTeachingItem, seq: number, idx: number) => {
      if (seq !== sequenceRef.current) return;

      setPhase("explaining");
      setTeacherState("explaining");
      setCurrentExplanation(item);
      setShowExplanation(true);
      setCaptionText(item.teacherExplanation);
      setCaptionSpeaker(TEACHER_NAME);
      addTranscript("teacher", item.teacherExplanation, item.id);
      writeSpeechOnBoard(item.id, item.teacherExplanation, "explain", seq);

      const advanceAfterExplanation = createProceduralSpeechEnd(item.teacherExplanation, () => {
        if (seq !== sequenceRef.current) return;
        if (item.commonMistake) {
          showWarningRef.current(item, seq, idx);
        } else {
          advanceRef.current(seq, idx);
        }
      });

      speakTeacher(item.teacherExplanation, "explanation", item.id, advanceAfterExplanation);
    },
    [addTranscript, createProceduralSpeechEnd, speakTeacher, writeSpeechOnBoard],
  );

  /** Show common mistake warning */
  const showWarningPhase = useCallback(
    (item: MathTeachingItem, seq: number, idx: number) => {
      if (seq !== sequenceRef.current) return;

      setPhase("warning");
      setTeacherState("warning");
      setShowWarning(true);
      const warningText = `Watch out: ${item.commonMistake}`;
      setCaptionText(warningText);
      setCaptionSpeaker(TEACHER_NAME);
      addTranscript("teacher", `Warning: ${item.commonMistake}`, item.id);
      writeSpeechOnBoard(item.id, warningText, "warning", seq);

      const advanceAfterWarning = createProceduralSpeechEnd(warningText, () => {
        if (seq === sequenceRef.current) advanceRef.current(seq, idx);
      });
      speakTeacher(warningText, "clarification", item.id, advanceAfterWarning);
    },
    [addTranscript, createProceduralSpeechEnd, speakTeacher, writeSpeechOnBoard],
  );

  /** Start practice session � in auto-mode, practice is shown as caption and auto-continues */
  const startPractice = useCallback(
    (mode: PracticeMode, seq: number) => {
      if (seq !== sequenceRef.current) return;

      setPhase("practice");
      setTeacherState("asking_question");
      setPracticeMode(mode);
      setPracticeIndex(0);
      setPracticeAnswer("");
      setPracticeFeedback(null);

      const problem = practiceProblems[0];
      let practicePrompt =
        mode === "guided" ? "Let's try one together!" : "Your turn to try alone!";
      if (problem) {
        const caption =
          mode === "guided" ? `Practice: ${problem.question}` : `Your turn: ${problem.question}`;
        practicePrompt = caption;
        setCaptionText(caption);
        setCaptionSpeaker(TEACHER_NAME);
        addTranscript(
          "system",
          mode === "guided" ? "Guided practice started" : "Independent practice started",
        );
        addTranscript("teacher", caption);
      } else {
        setCaptionText(mode === "guided" ? "Let's try one together!" : "Your turn to try alone!");
        setCaptionSpeaker(TEACHER_NAME);
        addTranscript(
          "system",
          mode === "guided" ? "Guided practice started" : "Independent practice started",
        );
      }
      setHintLevel(0);

      // Auto-mode: show practice as caption, then auto-continue to reflection/exit
      const completeAutoPractice = () => {
        if (seq !== sequenceRef.current) return;
        // Record as attempted
        setResults((prev) => ({
          ...prev,
          practiceAttempts: prev.practiceAttempts + 1,
          practiceCorrect: prev.practiceCorrect + 1,
        }));
        addTranscript("system", `${mode} practice completed (auto)`);
        logEvent(`${mode} practice auto-completed`);

        // Move to next practice or end lesson
        if (mode === "guided" && practiceProblems.length > 1) {
          startPractice("independent", seq);
        } else {
          // End the lesson � trigger completion inline
          clearTimers();
          ++sequenceRef.current;
          setPhase("complete");
          setTeacherState("paused");
          setCaptionText("Lesson complete! Great work today.");
          setCompletionOpen(true);
          addTranscript("system", "Lesson completed");
          logEvent("Lesson completed (auto)");
        }
      };
      const continueAfterPracticePrompt = createProceduralSpeechEnd(
        practicePrompt,
        completeAutoPractice,
        mode === "guided" ? 2500 : 2000,
      );
      speakTeacher(practicePrompt, "question", undefined, continueAfterPracticePrompt);
    },
    [
      addTranscript,
      practiceProblems,
      clearTimers,
      logEvent,
      createProceduralSpeechEnd,
      speakTeacher,
    ],
  );

  /**
   * Open a teaching interjection (recap / thinking pause / middle question /
   * confidence check). In auto-mode (default), interjections are shown as
   * captions only � no modal overlays � and auto-resume after a short delay.
   * This keeps the lesson flowing like a real video without interruptions.
   */
  const openInterjection = useCallback(
    (kind: Interjection, nextIdx: number, recapKey?: string) => {
      clearTimers();
      pendingNextIndexRef.current = nextIdx;
      setIsPaused(false);
      const seqAtOpen = sequenceRef.current;

      if (kind === "recap" && recapKey) {
        // Auto-mode: caption only, no popup overlay
        setTeacherState("explaining");
        const recap = SECTION_RECAPS[recapKey];
        const spoken = recap
          ? `${recap.title}. ${recap.points.join(". ")}.`
          : "Let's quickly recap what we just covered.";
        setCaptionText(spoken);
        setCaptionSpeaker(TEACHER_NAME);
        logEvent(`Section recap shown: ${recapKey}`);
        const continueAfterRecap = createProceduralSpeechEnd(spoken, () => {
          if (sequenceRef.current === seqAtOpen) resumeAfterInterjectionRef.current();
        });
        speakTeacher(spoken, "summary", undefined, continueAfterRecap);
      } else if (kind === "thinking_pause") {
        // Auto-mode: caption only, no popup
        const text =
          THINKING_PAUSES[nextIdx] ?? "Take a moment to think about what we've seen so far.";
        setTeacherState("thinking");
        setCaptionText(text);
        setCaptionSpeaker(TEACHER_NAME);
        logEvent("Thinking pause");
        const continueAfterPause = createProceduralSpeechEnd(text, () => {
          if (sequenceRef.current === seqAtOpen) resumeAfterInterjectionRef.current();
        });
        speakTeacher(text, "encouragement", undefined, continueAfterPause);
      } else if (kind === "middle_question") {
        if (!MIDDLE_QUESTION) {
          resumeAfterInterjectionRef.current();
          return;
        }
        // GATED: teacher asks the question and waits for learner's answer.
        // The lesson will NOT advance until onEngagementAction handles it.
        setTeacherState("asking_question");
        setCaptionText(MIDDLE_QUESTION.question);
        setCaptionSpeaker(TEACHER_NAME);
        logEvent("Required middle question asked � waiting for learner");
        // Open the inline engagement prompt so the learner can answer
        setMiddleQuestionOpen(true);
        // Speak the question, then wait (no auto-resume)
        speakTeacher(MIDDLE_QUESTION.question, "question", undefined, undefined);
      } else if (kind === "confidence") {
        // GATED: teacher asks the confidence check and waits for learner input.
        setTeacherState("asking_question");
        const c = "How confident are you with this part so far? Pick an option below � this is just for you, not a grade.";
        setCaptionText(c);
        setCaptionSpeaker(TEACHER_NAME);
        logEvent("Confidence check � waiting for learner");
        // Open the inline engagement prompt
        setConfidenceOpen(true);
        // Speak, then wait � learner must respond before lesson continues
        speakTeacher(c, "question", undefined, undefined);
      }
    },
    [clearTimers, createProceduralSpeechEnd, logEvent, speakTeacher],
  );

  /** Close any open interjection and resume teaching from the pending point. */
  const resumeAfterInterjection = useCallback(() => {
    setRecapOpen(null);
    setThinkingPauseText(null);
    setConfidenceOpen(false);
    setMiddleQuestionOpen(false);
    setMiddleFeedback(null);

    const seq = sequenceRef.current;
    const pending = pendingNextIndexRef.current;
    pendingNextIndexRef.current = null;
    if (pending === null) return;

    setTeacherState("preparing");
    if (pending === -1) {
      // Sentinel: proceed to guided practice (or the exit reflection when the
      // lesson carries no practice problems).
      phaseTimerRef.current = setTimeout(() => {
        if (practiceProblems.length > 0) startPractice("guided", seq);
        else setReflectionOpen(true);
      }, 800);
      return;
    }
    phaseTimerRef.current = setTimeout(() => {
      if (seq === sequenceRef.current) {
        writeOnBoard(sequence[pending], seq, pending);
      }
    }, 500);
  }, [writeOnBoard, startPractice, practiceProblems.length, sequence]);

  /** Advance to next board item, inserting teaching moments at boundaries.
   *  `idx` is the index that just finished (threaded, never stale). */
  const advanceToNext = useCallback(
    (seq: number, idx: number) => {
      if (seq !== sequenceRef.current) return;

      const nextIdx = idx + 1;
      setShowExplanation(false);
      setShowWarning(false);

      if (nextIdx >= sequence.length) {
        // End of teaching ? confidence check, then guided practice (or, when the
        // lesson has no practice problems, straight to the exit reflection).
        if (!firedInterjectionsRef.current.has("confidence_final")) {
          firedInterjectionsRef.current.add("confidence_final");
          openInterjection("confidence", -1);
          return;
        }
        if (practiceProblems.length > 0) {
          phaseTimerRef.current = setTimeout(() => startPractice("guided", seq), 1000);
        } else {
          phaseTimerRef.current = setTimeout(() => setReflectionOpen(true), 1000);
        }
        return;
      }

      // -- Teaching-moment schedule (each fires once). When auto-mode is on
      // (default, accessibility-friendly), non-blocking moments self-resume. --
      if (
        RECAP_AT_INDEX >= 0 &&
        nextIdx === RECAP_AT_INDEX &&
        !firedInterjectionsRef.current.has("recap_concept")
      ) {
        firedInterjectionsRef.current.add("recap_concept");
        openInterjection("recap", nextIdx, "concept");
        return;
      }
      if (THINKING_PAUSES[nextIdx] && !firedInterjectionsRef.current.has(`pause_${nextIdx}`)) {
        firedInterjectionsRef.current.add(`pause_${nextIdx}`);
        openInterjection("thinking_pause", nextIdx);
        return;
      }
      if (
        MIDDLE_QUESTION &&
        nextIdx === MIDDLE_QUESTION_AT_INDEX &&
        !firedInterjectionsRef.current.has("middle_question")
      ) {
        firedInterjectionsRef.current.add("middle_question");
        openInterjection("middle_question", nextIdx);
        return;
      }

      // -- Pacing Stretching Engine --
      const startTime = startTimeRef.current || Date.now();
      const timeElapsedSec = (Date.now() - startTime) / 1000;
      const targetMin = PACING_PLAN?.targetDurationMinutes ?? 30;
      const targetSec = targetMin * 60;
      const progressRatio = nextIdx / sequence.length;
      const expectedElapsedSec = targetSec * progressRatio;

      // If running 25% ahead of target pacing timeline, slow down
      const isAhead = nextIdx > 0 && timeElapsedSec < expectedElapsedSec * 0.75;
      
      if (isAhead && !firedInterjectionsRef.current.has(`pacing_pause_${nextIdx}`)) {
        firedInterjectionsRef.current.add(`pacing_pause_${nextIdx}`);
        clearTimers();
        pendingNextIndexRef.current = nextIdx;
        setTeacherState("explaining");
        
        let pacingText = "";
        if (activeVisual) {
          pacingText = `Let us slow down for a moment here and look at this visual: "${activeVisual.title}". Notice the details in the focus cue: ${activeVisual.teacherCue}. Spend a moment reflecting on how this relates to our objectives.`;
        } else {
          pacingText = "Let us pause here for a moment to recap. Take a deep breath and review what we have written on the board so far. Make sure you have noted down the steps before we proceed.";
        }
        
        setCaptionText(pacingText);
        setCaptionSpeaker(TEACHER_NAME);
        addTranscript("teacher", pacingText);
        logEvent(`Pacing stretch injected (ahead of schedule: elapsed ${Math.round(timeElapsedSec)}s vs expected ${Math.round(expectedElapsedSec)}s)`);
        
        const continueAfterPacing = createProceduralSpeechEnd(pacingText, () => {
          if (sequenceRef.current === seq) {
            resumeAfterInterjectionRef.current();
          }
        }, 3000); // add 3 seconds extra delay
        
        speakTeacher(pacingText, "explanation", undefined, continueAfterPacing);
        return;
      }

      // -- Adaptive confusion-driven interjection ----------------------
      // If the confusion tracker has accumulated enough signals, trigger
      // an extra interjection regardless of the pre-set schedule. Each
      // adaptive interjection fires at most once per board index.
      const confusion = confusionTracker.getState();
      if (confusion.shouldIntervene && !firedInterjectionsRef.current.has(`confusion_${nextIdx}`)) {
        firedInterjectionsRef.current.add(`confusion_${nextIdx}`);
        clearTimers();
        pendingNextIndexRef.current = nextIdx;
        setTeacherState("explaining");
        const spoken = deriveAdaptiveIntervention(confusion, currentSection, sequence[idx]);
        if (spoken) {
          setCaptionText(spoken);
          setCaptionSpeaker(TEACHER_NAME);
          logEvent(
            `Adaptive interjection (confusion: ${confusion.confusionScore.toFixed(2)}, type: ${confusion.interventionType})`,
          );
          // Fire-and-forget AI-powered enrichment for next time
          void generateAdaptiveIntervention({
            data: {
              confusionState: confusion,
              context: {
                lessonTitle: LESSON_TITLE,
                currentSection,
                currentBoardItem: sequence[idx]?.boardText,
                teacherExplanation: sequence[idx]?.teacherExplanation,
                academicLevel: ACADEMIC_LEVEL,
              },
            },
          }).catch(() => {});
        }
        const continueAfterClarification = createProceduralSpeechEnd(spoken ?? "", () => {
          if (sequenceRef.current === seq) resumeAfterInterjectionRef.current();
        });
        if (spoken) speakTeacher(spoken, "clarification", undefined, continueAfterClarification);
        else continueAfterClarification();
        return;
      }

      // -- Teacher Brain: natural aside between steps ------------------
      // The teacher adds warmth, encouragement, or a check-in between
      // scripted steps. Deterministic (no AI call), picks from templates.
      const aside = decideAside({
        phase,
        currentIndex: idx,
        totalItems: sequence.length,
        sectionKey: currentSection,
        confusionScore: confusionTracker.getState().confusionScore,
        lastSentiment: lastSentiment?.tone ?? null,
        consecutiveCorrect,
        timeSinceLastInteraction: Date.now() - lastInteractionRef.current,
        courseType: LESSON_COURSE_TYPE,
      });
      if (aside && !firedInterjectionsRef.current.has(`aside_${idx}`)) {
        firedInterjectionsRef.current.add(`aside_${idx}`);
        clearTimers();
        pendingNextIndexRef.current = nextIdx;
        setTeacherState("explaining");
        setTeacherAside(aside);
        setCaptionText(aside.text);
        setCaptionSpeaker(TEACHER_NAME);
        addTranscript("teacher", aside.text);
        logEvent(`Teacher aside (${aside.type}): ${aside.text.slice(0, 50)}`);
        const continueAfterAside = createProceduralSpeechEnd(aside.text, () => {
          if (sequenceRef.current === seq) {
            setTeacherAside(null);
            resumeAfterInterjectionRef.current();
          }
        });
        speakTeacher(aside.text, aside.speechType, undefined, continueAfterAside);
        return;
      }

      const pause = sequence[nextIdx].pauseAfter ?? 800;
      phaseTimerRef.current = setTimeout(() => {
        if (seq === sequenceRef.current) {
          writeOnBoard(sequence[nextIdx], seq, nextIdx);
        }
      }, pause);
    },
    [writeOnBoard, openInterjection, startPractice, createProceduralSpeechEnd, speakTeacher],
  );

  // Keep the function refs fresh so the timer-driven chain always calls the
  // latest version (prevents stale closures / repeated sections).
  useEffect(() => {
    readBoardRef.current = readBoard;
    explainStepRef.current = explainStep;
    showWarningRef.current = showWarningPhase;
    advanceRef.current = advanceToNext;
    resumeAfterInterjectionRef.current = resumeAfterInterjection;
  });

  // ------------------------------------------------------
  // Teaching-moment resolvers
  // ------------------------------------------------------

  /** Auto-start teaching with a short spoken prerequisite reminder � no blocking
   *  popup, so blind learners are never stuck waiting for a click. */
  const beginTeaching = useCallback(() => {
    const seq = ++sequenceRef.current;
    const intro = lesson.prerequisiteReview;
    if (intro) {
      setTeacherState("explaining");
      setCaptionText(intro);
      setCaptionSpeaker(TEACHER_NAME);
      addTranscript("teacher", intro);
      logEvent("Prerequisite reminder (auto)");
      const continueAfterIntro = createProceduralSpeechEnd(
        intro,
        () => {
          if (seq === sequenceRef.current) writeOnBoard(sequence[0], seq, 0);
        },
        PROCEDURAL_START_PAUSE_MS,
      );
      speakTeacher(intro, "welcome", undefined, continueAfterIntro);
    } else {
      // No prerequisite review for this lesson ? start writing right away.
      writeOnBoard(sequence[0], seq, 0);
    }
  }, [
    addTranscript,
    logEvent,
    writeOnBoard,
    createProceduralSpeechEnd,
    speakTeacher,
    lesson.prerequisiteReview,
    sequence,
  ]);

  /** Thinking pause buttons (Continue / Read again / I need help). */
  const handleThinkingPause = useCallback(
    (action: "continue" | "repeat" | "help") => {
      if (action === "continue") {
        resumeAfterInterjection();
        return;
      }
      if (action === "repeat") {
        if (thinkingPauseText && learningMode !== "deaf")
          speak(thinkingPauseText, undefined, undefined, TEACHER_VOICE);
        return;
      }
      // "help" � keep the pause open, offer a nudge
      const nudge =
        "No problem. Look at the two conditions: the numbers must multiply to the last value and add to the middle value.";
      setCaptionText(nudge);
      if (learningMode !== "deaf") speak(nudge, undefined, undefined, TEACHER_VOICE);
      logEvent("Learner asked for help during thinking pause");
    },
    [resumeAfterInterjection, thinkingPauseText, learningMode, logEvent, TEACHER_VOICE],
  );

  /** Confidence check answered ? record learning data, then continue. */
  const handleConfidence = useCallback(
    (opt: ClassroomConfidenceOption) => {
      setResults((prev) => ({
        ...prev,
        confidenceChecks: [...prev.confidenceChecks, { section: currentSection, level: opt.value }],
      }));
      logEvent(`Confidence (${currentSection}): ${opt.label}`);
      addTranscript("student", `Confidence: ${opt.label}`);
      if (opt.value === "not_yet" || opt.value === "explain_again") {
        setCaptionText("No problem - let's keep going and I'll explain carefully.");
        addTranscript("teacher", "No problem � let's keep going and I'll explain carefully.");
      } else {
        setCaptionText("Wonderful. Let's continue.");
      }
      resumeAfterInterjection();
    },
    [currentSection, logEvent, addTranscript, resumeAfterInterjection],
  );

  /** Required middle question answered ? feedback (with misconception watch). */
  const handleMiddleAnswer = useCallback(
    (answer: string) => {
      if (!MIDDLE_QUESTION) {
        resumeAfterInterjection();
        return;
      }
      const correct = answer === MIDDLE_QUESTION.correct;
      const isMisconception = answer === MIDDLE_QUESTION.misconception?.answer;
      const text = correct
        ? MIDDLE_QUESTION.feedbackCorrect
        : isMisconception
          ? MIDDLE_QUESTION.misconception!.note
          : MIDDLE_QUESTION.feedbackIncorrect;

      setResults((prev) => ({
        ...prev,
        middleQuestionCorrect: correct,
        misconceptionsDetected: prev.misconceptionsDetected + (isMisconception ? 1 : 0),
      }));
      addTranscript("student", answer);
      addTranscript("teacher", text);
      const activeBoardItemId =
        writtenLines[writtenLines.length - 1]?.id ?? sequence[currentIndex]?.id;
      if (activeBoardItemId)
        writeSpeechOnBoard(activeBoardItemId, text, "answer", sequenceRef.current);
      setMiddleFeedback({ correct, text });
      logEvent(`Middle question: ${answer} (${correct ? "correct" : "incorrect"})`);

      const continueAfterFeedback = createProceduralSpeechEnd(text, () => {
        resumeAfterInterjection();
      });
      speakTeacher(text, "answer", activeBoardItemId, continueAfterFeedback);
    },
    [
      addTranscript,
      writeSpeechOnBoard,
      writtenLines,
      sequence,
      currentIndex,
      logEvent,
      resumeAfterInterjection,
      createProceduralSpeechEnd,
      speakTeacher,
    ],
  );

  // ------------------------------------------------------
  // Whiteboard Tool Handlers
  // ------------------------------------------------------

  const handleBoardLineClick = useCallback(
    (idx: number) => {
      if (boardTool === "cursor") {
        setSelectedLineIdx(idx === selectedLineIdx ? null : idx);
        // Scroll the clicked line into view
        const boardEl = boardRef.current;
        if (boardEl) {
          const lineEl = boardEl.children[idx] as HTMLElement | undefined;
          lineEl?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      } else if (boardTool === "pen") {
        setHighlightedLines((prev) => {
          const next = new Set(prev);
          if (next.has(idx)) next.delete(idx);
          else next.add(idx);
          return next;
        });
      } else if (boardTool === "text") {
        if (annotatingLineIdx === idx) {
          // Save annotation
          if (annotationText.trim()) {
            setBoardAnnotations((prev) => ({ ...prev, [idx]: annotationText.trim() }));
            const line = writtenLines[idx];
            if (line) {
              writeSpeechOnBoard(line.id, annotationText.trim(), "explain", sequenceRef.current);
              addTranscript("student", annotationText.trim(), line.id);
              logEvent(`Board annotation added: ${annotationText.trim().slice(0, 50)}`);
            }
          }
          setAnnotatingLineIdx(null);
          setAnnotationText("");
        } else {
          setAnnotatingLineIdx(idx);
          setAnnotationText(boardAnnotations[idx] ?? "");
        }
      } else if (boardTool === "chat") {
        // Open question box pre-filled with context about this line
        const line = writtenLines[idx];
        if (line) {
          setQuestionOpen(true);
          setTeacherState("listening");
          setCaptionText(`What would you like to know about: "${line.boardText.slice(0, 60)}"?`);
          setCaptionSpeaker(TEACHER_NAME);
        }
      } else if (boardTool === "image") {
        // Describe board � read aloud the board content
        const line = writtenLines[idx];
        if (line) {
          const description = `Board description: ${line.boardText}. ${line.teacherExplanation ?? ""}`;
          setCaptionText(description);
          setCaptionSpeaker(TEACHER_NAME);
          addTranscript("teacher", description, line.id);
          writeSpeechOnBoard(line.id, description, "explain", sequenceRef.current);
          speakTeacher(description, "explanation", line.id);
        }
      }
    },
    [
      boardTool,
      selectedLineIdx,
      annotatingLineIdx,
      annotationText,
      writtenLines,
      boardAnnotations,
      writeSpeechOnBoard,
      addTranscript,
      speakTeacher,
      logEvent,
    ],
  );

  // ------------------------------------------------------
  // Lesson Controls
  // ------------------------------------------------------

  const handleStartLesson = useCallback(() => {
    setStarted(true);
    setPhase("idle");
    setTeacherState("preparing");
    setCaptionText("Welcome! Let's begin today's lesson.");
    setCaptionSpeaker(TEACHER_NAME);
    addTranscript("system", "Lesson started");
    addTranscript("teacher", LESSON_OPENING_NARRATIVE);

    ++sequenceRef.current;
    startTimeRef.current = Date.now();
    firedInterjectionsRef.current = new Set();
    pendingNextIndexRef.current = null;
    currentIndexRef.current = 0;
    setCurrentIndex(0);
    setWrittenLines([]);
    setBoardSpeech({});
    setCurrentWritingText("");
    setBoardTool("cursor");
    setSelectedLineIdx(null);
    setHighlightedLines(new Set());
    setBoardAnnotations({});
    setAnnotatingLineIdx(null);
    confusionTracker.reset();
    resetTeacherBrain();
    setConsecutiveCorrect(0);
    setTeacherAside(null);
    lastInteractionRef.current = Date.now();
    logEvent("Lesson started");
    recordEvent("session_started", { lessonTitle: LESSON_TITLE, learningMode });

    // Auto-start teaching (no blocking popup � accessible for blind learners)
    const continueAfterOpening = createProceduralSpeechEnd(
      LESSON_OPENING_NARRATIVE,
      () => beginTeaching(),
      PROCEDURAL_START_PAUSE_MS,
    );
    speakTeacher(LESSON_OPENING_NARRATIVE, "welcome", undefined, continueAfterOpening);
  }, [
    addTranscript,
    speakTeacher,
    logEvent,
    beginTeaching,
    recordEvent,
    LESSON_TITLE,
    LESSON_OPENING_NARRATIVE,
    createProceduralSpeechEnd,
  ]);

  const handlePause = useCallback(() => {
    if (isPaused) {
      // Resume � restart the teaching chain from the current board item
      setIsPaused(false);
      setTeacherState("preparing");
      setCaptionText("Lesson resumed.");
      addTranscript("system", "Lesson resumed");
      const seq = ++sequenceRef.current;
      const idx = currentIndexRef.current;
      phaseTimerRef.current = setTimeout(() => {
        if (seq === sequenceRef.current && idx < sequence.length) {
          // Re-enter the teaching chain at the current item
          const item = sequence[idx];
          if (writtenLines.some((l) => l.id === item.id)) {
            // Item already on board � re-read it
            readBoardRef.current(item, seq, idx);
          } else {
            // Item not yet written � write it
            writeOnBoard(item, seq, idx);
          }
        }
      }, 500);
    } else {
      setIsPaused(true);
      setTeacherState("paused");
      clearTimers();
      teacherVoice.stop();
      setCaptionText("Lesson paused.");
    }
  }, [
    isPaused,
    clearTimers,
    sequence,
    writtenLines,
    readBoardRef,
    writeOnBoard,
    addTranscript,
    teacherVoice,
  ]);

  const handleReplay = useCallback(() => {
    clearTimers();
    const seq = ++sequenceRef.current;
    setWrittenLines([]);
    setBoardSpeech({});
    setCurrentWritingText("");
    setShowExplanation(false);
    setShowWarning(false);
    setCurrentExplanation(null);
    setIsPaused(false);
    setTeacherState("preparing");
    setCaptionText("Replaying lesson from the beginning...");
    setCaptionSpeaker(TEACHER_NAME);

    writeOnBoard(sequence[0], seq, 0);
  }, [clearTimers, writeOnBoard]);

  const handleReplayStep = useCallback(() => {
    if (currentIndex < 0) return;
    clearTimers();
    const seq = ++sequenceRef.current;
    setWrittenLines((prev) => prev.slice(0, currentIndex));
    setBoardSpeech((prev) => {
      const keepIds = new Set(sequence.slice(0, currentIndex).map((item) => item.id));
      return Object.fromEntries(Object.entries(prev).filter(([id]) => keepIds.has(id)));
    });
    setCurrentWritingText("");
    setShowExplanation(false);
    setShowWarning(false);
    setTeacherState("preparing");
    setCaptionText("Replaying current step...");
    setCaptionSpeaker(TEACHER_NAME);

    writeOnBoard(sequence[currentIndex], seq, currentIndex);
  }, [currentIndex, clearTimers, writeOnBoard]);

  const handleNextStep = useCallback(() => {
    if (
      pendingNextIndexRef.current !== null ||
      recapOpen ||
      thinkingPauseText ||
      confidenceOpen ||
      middleQuestionOpen
    ) {
      resumeAfterInterjection();
      return;
    }

    const nextIndex = Math.min(currentIndexRef.current + 1, sequence.length - 1);
    if (nextIndex === currentIndexRef.current) {
      resumeAfterInterjection();
      return;
    }

    clearTimers();
    const seq = ++sequenceRef.current;
    setShowExplanation(false);
    setShowWarning(false);
    setCurrentExplanation(null);
    setIsPaused(false);
    setWrittenLines((prev) => prev.slice(0, nextIndex));
    setBoardSpeech((prev) => {
      const keepIds = new Set(sequence.slice(0, nextIndex).map((item) => item.id));
      return Object.fromEntries(Object.entries(prev).filter(([id]) => keepIds.has(id)));
    });
    setCurrentWritingText("");
    writeOnBoard(sequence[nextIndex], seq, nextIndex);
  }, [
    recapOpen,
    thinkingPauseText,
    confidenceOpen,
    middleQuestionOpen,
    resumeAfterInterjection,
    sequence,
    clearTimers,
    writeOnBoard,
  ]);

  /** Jump to a section from the sidebar lesson plan. Completed and the current
   *  section are navigable; the immediate next is allowed (procedural), but you
   *  cannot skip far ahead. */
  const jumpToSection = useCallback(
    (key: LessonSectionKey) => {
      const targetIdx = SECTION_START_INDEX[key];
      if (targetIdx === undefined) return; // practice/exit handled by their own flow
      const sectionOrder = LESSON_PLAN_SECTIONS.findIndex((s) => s.key === key);
      const currentOrder = LESSON_PLAN_SECTIONS.findIndex((s) => s.key === currentSection);
      if (sectionOrder > currentOrder + 1) return; // no skipping ahead

      clearTimers();
      const seq = ++sequenceRef.current;
      // Rebuild the board up to (but not including) the target, then teach it.
      setWrittenLines(sequence.slice(0, targetIdx));
      setBoardSpeech((prev) => {
        const keepIds = new Set(sequence.slice(0, targetIdx).map((item) => item.id));
        return Object.fromEntries(Object.entries(prev).filter(([id]) => keepIds.has(id)));
      });
      setCurrentWritingText("");
      setShowExplanation(false);
      setShowWarning(false);
      setIsPaused(false);
      setTeacherState("preparing");
      setCaptionText(`Going to ${LESSON_PLAN_SECTIONS[sectionOrder].label}...`);
      setCaptionSpeaker(TEACHER_NAME);
      logEvent(`Jumped to section: ${key}`);
      writeOnBoard(sequence[targetIdx], seq, targetIdx);
    },
    [currentSection, clearTimers, writeOnBoard, logEvent],
  );

  const handleEndLesson = useCallback(() => {
    clearTimers();
    ++sequenceRef.current;
    setPhase("complete");
    setTeacherState("paused");
    setCaptionText("");

    // Calculate takeaway score (0-100)
    const timeMinutes = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 60000));
    const practiceAccuracy =
      results.practiceAttempts > 0 ? (results.practiceCorrect / results.practiceAttempts) * 100 : 0;
    const confidenceCount = results.confidenceChecks.length;

    // Scoring formula:
    // - Practice accuracy: 50 points max
    // - Hints penalty: -2 per hint (to -20 max)
    // - Misconceptions penalty: -5 per misconception (to -25 max)
    // - Engagement: questions + raised hands give bonus (up to 20)
    // - Time bonus: efficient time gives +10 (under 15 min)
    let score = 0;
    score += (practiceAccuracy / 100) * 50; // practice score
    score += Math.max(0, 20 - results.hintsUsed * 2); // hint penalty
    score += Math.max(0, 25 - results.misconceptionsDetected * 5); // misconception penalty
    score += Math.min(20, results.questionsAsked * 3 + results.raisedHands * 2); // engagement
    score += timeMinutes < 15 ? 10 : 5; // time bonus
    score = Math.max(0, Math.min(100, Math.round(score)));

    setTakeawayScore(score);
    setResults((prev) => ({ ...prev, score }));
    setCompletionOpen(true);
    addTranscript("system", `Lesson ended with score: ${score}/100`);

    // Persist the full learning-evidence summary for this session.
    const confusionState = confusionTracker.getState();
    recordEvent("session_completed", {
      score,
      timeMinutes,
      questionsAsked: results.questionsAsked,
      raisedHands: results.raisedHands,
      practiceAttempts: results.practiceAttempts,
      practiceCorrect: results.practiceCorrect,
      hintsUsed: results.hintsUsed,
      confidenceChecks: results.confidenceChecks.length,
      misconceptionsDetected: results.misconceptionsDetected,
      middleQuestionCorrect: results.middleQuestionCorrect,
      confusionScore: confusionState.confusionScore,
      confusedSections: confusionState.confusedSections,
    });

    // Save cross-lesson learner profile (best-effort, never blocks the lesson)
    if (sessionId) {
      saveLearnerSessionSummary({
        data: {
          course_id: (lesson as any).courseId,
          lesson_id: lesson.lessonId,
          score,
          time_minutes: timeMinutes,
          questions_asked: results.questionsAsked,
          practice_correct: results.practiceCorrect,
          practice_attempts: results.practiceAttempts,
          confusion_score: confusionState.confusionScore,
          weak_topics: confusionState.confusedSections,
          strong_topics:
            score >= 80
              ? Array.from(new Set([currentSection, ...results.confidenceChecks.map((c) => c.section)]))
              : [],
          learning_mode: learningMode,
          preferred_style_signal:
            learningMode === "blind"
              ? "auditory"
              : learningMode === "speech_difficulty" || learningMode === "dyslexia"
                ? "reading"
                : activeVisual
                  ? "visual"
                  : undefined,
        },
      }).catch(() => {
        /* best-effort */
      });
    }
  }, [
    clearTimers,
    addTranscript,
    results,
    startTimeRef,
    recordEvent,
    confusionTracker,
    sessionId,
    lesson.lessonId,
    currentSection,
    learningMode,
    activeVisual,
  ]);

  // -- Question handlers ---------------------------------
  const handleAskQuestion = useCallback(() => {
    // Pause teaching flow while the learner is asking a question
    setQuestionPaused(true);
    clearTimers();
    setQuestionOpen(true);
    setTeacherState("listening");
    setCaptionText("What is your question?");
    setCaptionSpeaker(TEACHER_NAME);
  }, [clearTimers]);

  const handleRaiseHand = useCallback(() => {
    if (raiseHand === "idle") {
      setRaiseHand("raised");
      setResults((prev) => ({ ...prev, raisedHands: prev.raisedHands + 1 }));
      confusionTracker.recordSignal({
        type: "raise_hand",
        weight: 0.2,
        boardIndex: currentIndex,
        section: currentSection,
      });
      logEvent("Learner raised hand");
      addTranscript("system", "Learner raised hand");
      raiseHandTimersRef.current.push(
        setTimeout(() => {
          setRaiseHand("acknowledged");
          setCaptionText("I see your hand! Let me finish this step, then I'll take your question.");
          addTranscript("teacher", "I see your hand! What would you like to ask?");
          raiseHandTimersRef.current.push(
            setTimeout(() => {
              setRaiseHand("resolved");
              handleAskQuestion();
            }, 3000),
          );
        }, 2000),
      );
      return;
    }

    raiseHandTimersRef.current.forEach(clearTimeout);
    raiseHandTimersRef.current = [];
    setRaiseHand("idle");
  }, [addTranscript, handleAskQuestion, logEvent, raiseHand]);

  /** Toggle voice capture for asking a question. Transcribes speech into the
   *  question box so the learner can review and send (works in standard and
   *  blind modes; deaf mode stays text-only). */
  const toggleMic = useCallback(() => {
    if (learningMode === "deaf") return;
    if (isListening) {
      stopListening(recognizerRef.current);
      recognizerRef.current = null;
      setIsListening(false);
      return;
    }
    setQuestionOpen(true);
    setTeacherState("listening");
    setCaptionText("Listening... ask your question now.");
    setCaptionSpeaker(TEACHER_NAME);
    setIsListening(true);
    recognizerRef.current = startListening(
      (transcript, isFinal) => {
        setQuestionText(transcript);
        if (isFinal) {
          stopListening(recognizerRef.current);
          recognizerRef.current = null;
          setIsListening(false);
        }
      },
      () => {
        setIsListening(false);
        setCaptionText("Voice input isn't available here - please type your question.");
      },
      () => setIsListening(false),
    );
  }, [isListening, learningMode]);

  const handleSubmitQuestion = useCallback(() => {
    const q = questionText.trim();
    if (!q) return;
    lastInteractionRef.current = Date.now();
    addTranscript("student", q);

    // Sentiment analysis (synchronous, zero-latency)
    const sentiment = analyzeSentimentKeywords(q);
    setLastSentiment(sentiment);
    if (sentiment.frustrationScore > 0.5) {
      confusionTracker.recordSignal({
        type: "sentiment_frustrated",
        weight: sentiment.frustrationScore,
        boardIndex: currentIndex,
        section: currentSection,
      });
    }

    // A clarification reply isn't a new question � only count fresh questions.
    const isClarificationReply = clarify !== null;
    if (!isClarificationReply) {
      setResults((prev) => ({ ...prev, questionsAsked: prev.questionsAsked + 1 }));
      recordEvent("question_asked", { question: q, sentiment: sentiment.tone });
    }
    logEvent(isClarificationReply ? `Learner clarified: ${q}` : `Learner asked: ${q}`);
    setQuestionOpen(false);
    setQuestionText("");
    setFollowUp(null);
    setFollowUpActive(false);
    setQuestionPaused(false);
    // Cancel any running follow-up timer
    if (followUpTimerRef.current) {
      clearTimeout(followUpTimerRef.current);
      followUpTimerRef.current = null;
    }
    setTeacherState("thinking");
    setCaptionText("Let me think about that...");

    // Build the current classroom context and ask the AI teacher. The teacher may
    // either answer (clear) or ask ONE clarifying question (unclear) � just like a
    // real tutor who won't guess at a vague question.
    const boardItem =
      writtenLines[writtenLines.length - 1]?.boardText ?? sequence[currentIndex]?.boardText;
    const activeBoardItemId =
      writtenLines[writtenLines.length - 1]?.id ?? sequence[currentIndex]?.id;
    const previousQuestions = transcript
      .filter((t) => t.role === "student")
      .map((t) => t.text)
      .slice(-5);

    // If this is a clarification round, send the original question + the prior
    // clarifying prompt so the model answers directly instead of re-asking.
    const effectiveQuestion = isClarificationReply
      ? `${clarify!.original} � specifically: ${q}`
      : q;
    const priorClarification = isClarificationReply ? clarify!.question : undefined;
    setClarify(null);

    const ask = async () => {
      try {
        const res = await answerLearnerQuestion({
          data: {
            context: {
              institution: INSTITUTION,
              course: COURSE,
              lessonTitle: LESSON_TITLE,
              currentSection,
              currentBoardItem: boardItem,
              teacherExplanation: currentExplanation?.teacherExplanation,
              learnerNotes: FULL_LEARNER_NOTES.slice(0, 600),
              previousQuestions,
              // Ground answers in the institution's own approved material (RAG),
              // so the AI teacher does not drift into general knowledge.
              materialContext: lesson.materialContext,
              imageDescriptions: activeVisual
                ? [
                    `Active visual: ${activeVisual.title}. ${activeVisual.description}. ${activeVisual.teacherCue}`,
                    ...visualDescriptions,
                  ].slice(0, 10)
                : visualDescriptions,
              learningMode,
              learnerLevel: COURSE_LEVEL,
              academicLevel: ACADEMIC_LEVEL,
              priorClarification,
              // Sentiment-aware context so the AI teacher adjusts tone
              learnerSentiment: {
                tone: sentiment.tone,
                frustrationScore: sentiment.frustrationScore,
              },
              // Cross-lesson profile for personalization
              learnerProfile: learnerProfile
                ? {
                    weakTopics: learnerProfile.weakTopics,
                    strongTopics: learnerProfile.strongTopics,
                    preferredStyle: learnerProfile.preferredStyle,
                    lastEmotion: learnerProfile.lastEmotion,
                  }
                : undefined,
            },
            question: effectiveQuestion,
          },
        });

        // -- Teacher needs the learner to clarify --------------------------
        if (res.clarity === "unclear" && res.clarificationQuestion) {
          setTeacherState("clarifying");
          setCaptionText(res.clarificationQuestion);
          setCaptionSpeaker(TEACHER_NAME);
          addTranscript("teacher", res.clarificationQuestion);
          if (activeBoardItemId)
            writeSpeechOnBoard(
              activeBoardItemId,
              res.clarificationQuestion,
              "answer",
              sequenceRef.current,
            );
          logEvent("Teacher asked for clarification");
          setClarify({
            question: res.clarificationQuestion,
            original: effectiveQuestion,
            options: res.clarificationOptions ?? [],
          });
          const listenAfterClarification = createProceduralSpeechEnd(
            res.clarificationQuestion,
            () => {
              setTeacherState("listening");
              setQuestionOpen(true);
            },
          );
          speakTeacher(
            res.clarificationQuestion,
            "clarification",
            activeBoardItemId,
            listenAfterClarification,
          );
          return;
        }

        // -- Teacher answers (clear or a steered off-topic reply) ----------
        const answer = res.answer;
        setTeacherState("answering");
        setCaptionText(answer);
        setCaptionSpeaker(TEACHER_NAME);
        addTranscript("teacher", answer);
        if (activeBoardItemId)
          writeSpeechOnBoard(activeBoardItemId, answer, "answer", sequenceRef.current);
        if (res.saveToNotes) logEvent("Answer saved to notes");
        // After answering, show the follow-up bar and start a 30-second
        // auto-continue timer so blind/accessibility learners aren't blocked.
        const followUpText = res.suggestedFollowUp || "Does that help?";
        setFollowUp(followUpText);
        const settleAfterAnswer = createProceduralSpeechEnd(answer, () => {
          setTeacherState("speaking");
          setFollowUpActive(true);
          // Auto-continue after 30 seconds if learner doesn't respond
          followUpTimerRef.current = setTimeout(() => {
            setFollowUpActive(false);
            setFollowUp(null);
          }, 30_000);
        });
        speakTeacher(answer, "answer", activeBoardItemId, settleAfterAnswer);
      } catch {
        const fallback =
          "That's a great question. Let's connect it back to what we're doing in this step � look carefully at what's currently on the board, and check each part against the idea we just covered. If it still feels unclear, raise your hand and we'll work through another example together.";
        setTeacherState("answering");
        setCaptionText(fallback);
        addTranscript("teacher", fallback);
        if (activeBoardItemId)
          writeSpeechOnBoard(activeBoardItemId, fallback, "answer", sequenceRef.current);
        const settleAfterFallback = createProceduralSpeechEnd(fallback, () =>
          setTeacherState("speaking"),
        );
        speakTeacher(fallback, "answer", activeBoardItemId, settleAfterFallback);
      }
    };
    void ask();
  }, [
    questionText,
    clarify,
    addTranscript,
    writeSpeechOnBoard,
    speakTeacher,
    logEvent,
    transcript,
    writtenLines,
    sequence,
    currentIndex,
    currentSection,
    currentExplanation,
    learningMode,
    COURSE_LEVEL,
    recordEvent,
    createProceduralSpeechEnd,
  ]);

  const handleQuickAction = useCallback(
    (action: string) => {
      setQuestionOpen(false);
      addTranscript("student", action);

      if (action === "Continue" || action === "No question") {
        setTeacherState("speaking");
        return;
      }
      if (action === "Repeat") {
        handleReplayStep();
        return;
      }
      if (action === "Slow down") {
        const activeBoardItemId =
          writtenLines[writtenLines.length - 1]?.id ?? sequence[currentIndex]?.id;
        setCaptionText("I'll slow down. Let me explain again more carefully.");
        addTranscript("teacher", "I'll slow down. Let me explain again more carefully.");
        if (activeBoardItemId)
          writeSpeechOnBoard(
            activeBoardItemId,
            "I'll slow down. Let me explain again more carefully.",
            "answer",
            sequenceRef.current,
          );
        setTimeout(() => handleReplayStep(), 2000);
        return;
      }
      if (
        action === "Explain simpler" ||
        action === "Give example" ||
        action === "I don't understand"
      ) {
        // Record confusion signal for adaptive interjections
        confusionTracker.recordSignal({
          type: "quick_action_confused",
          weight: action === "I don't understand" ? 0.5 : 0.3,
          boardIndex: currentIndex,
          section: currentSection,
        });
        // Route through the real, lesson-grounded AI teacher so the response is
        // correct for ANY subject (not a hardcoded maths example).
        const mapped =
          action === "Give example"
            ? "Can you give me another example of what we are doing in this step?"
            : action === "Explain simpler"
              ? "Can you explain this current step more simply?"
              : "I don't understand this step. Can you explain it a different way?";
        setResults((prev) => ({ ...prev, questionsAsked: prev.questionsAsked + 1 }));
        setTeacherState("thinking");
        setCaptionText("Let me think about how best to explain that...");
        setCaptionSpeaker(TEACHER_NAME);
        logEvent(`Quick action: ${action}`);

        const boardItem =
          writtenLines[writtenLines.length - 1]?.boardText ?? sequence[currentIndex]?.boardText;
        const activeBoardItemId =
          writtenLines[writtenLines.length - 1]?.id ?? sequence[currentIndex]?.id;
        void (async () => {
          try {
            const res = await answerLearnerQuestion({
              data: {
                context: {
                  institution: INSTITUTION,
                  course: COURSE,
                  lessonTitle: LESSON_TITLE,
                  currentSection,
                  currentBoardItem: boardItem,
                  teacherExplanation: currentExplanation?.teacherExplanation,
                  learnerNotes: FULL_LEARNER_NOTES.slice(0, 600),
                  materialContext: lesson.materialContext,
                  imageDescriptions: activeVisual
                    ? [
                        `Active visual: ${activeVisual.title}. ${activeVisual.description}. ${activeVisual.teacherCue}`,
                        ...visualDescriptions,
                      ].slice(0, 10)
                    : visualDescriptions,
                  learningMode,
                  learnerLevel: COURSE_LEVEL,
                  academicLevel: ACADEMIC_LEVEL,
                  learnerSentiment: lastSentiment
                    ? { tone: lastSentiment.tone, frustrationScore: lastSentiment.frustrationScore }
                    : undefined,
                  learnerProfile: learnerProfile
                    ? {
                        weakTopics: learnerProfile.weakTopics,
                        strongTopics: learnerProfile.strongTopics,
                        preferredStyle: learnerProfile.preferredStyle,
                        lastEmotion: learnerProfile.lastEmotion,
                      }
                    : undefined,
                },
                question: mapped,
              },
            });
            const answer =
              res.answer || res.clarificationQuestion || "Let's look at this step again together.";
            setTeacherState("answering");
            setCaptionText(answer);
            setCaptionSpeaker(TEACHER_NAME);
            addTranscript("teacher", answer);
            if (activeBoardItemId)
              writeSpeechOnBoard(activeBoardItemId, answer, "answer", sequenceRef.current);
            setFollowUp(
              res.suggestedFollowUp || "Does that help, or should I show another example?",
            );
            const settleAfterAnswer = createProceduralSpeechEnd(answer, () =>
              setTeacherState("speaking"),
            );
            speakTeacher(answer, "answer", activeBoardItemId, settleAfterAnswer);
          } catch {
            // If the AI is unavailable, simply re-teach the current step.
            handleReplayStep();
          }
        })();
        return;
      }
    },
    [
      addTranscript,
      handleReplayStep,
      writeSpeechOnBoard,
      speakTeacher,
      createProceduralSpeechEnd,
      writtenLines,
      sequence,
      currentIndex,
      currentSection,
      currentExplanation,
      learningMode,
      lesson.materialContext,
      INSTITUTION,
      COURSE,
      COURSE_LEVEL,
      LESSON_TITLE,
      FULL_LEARNER_NOTES,
      ACADEMIC_LEVEL,
      TEACHER_VOICE,
      logEvent,
    ],
  );

  // -- Practice handlers ---------------------------------
  const handlePracticeSubmit = useCallback(() => {
    const problem = practiceProblems[practiceIndex];
    if (!problem) return;

    const norm = (s: string) => s.replace(/\s/g, "").split(/[,;]/).filter(Boolean).sort().join(",");
    const isCorrect = norm(practiceAnswer) === norm(problem.correctAnswer);
    const isMisconception = norm(practiceAnswer) === norm(problem.misconception.answer);
    const activeBoardItemId =
      writtenLines[writtenLines.length - 1]?.id ?? sequence[currentIndex]?.id;

    setResults((prev) => ({
      ...prev,
      practiceAttempts: prev.practiceAttempts + 1,
      practiceCorrect: prev.practiceCorrect + (isCorrect ? 1 : 0),
      misconceptionsDetected: prev.misconceptionsDetected + (isMisconception ? 1 : 0),
    }));

    let teacherFeedback = "";
    if (isCorrect) {
      teacherFeedback = "Correct! Well done!";
      setPracticeFeedback("correct");
      setPracticeFeedbackText("Correct! Well done! ??");
      setConsecutiveCorrect((c) => c + 1);
      lastInteractionRef.current = Date.now();
      addTranscript("student", practiceAnswer);
      addTranscript("teacher", "Correct! Well done!");
      if (activeBoardItemId)
        writeSpeechOnBoard(activeBoardItemId, "Correct! Well done!", "answer", sequenceRef.current);
      logEvent(`Practice correct: ${problem.equation}`);
    } else {
      setConsecutiveCorrect(0);
      // Track confusion from wrong practice answers
      confusionTracker.recordSignal({
        type: "practice_wrong",
        weight: 0.4,
        boardIndex: currentIndex,
        section: currentSection,
      });
      // Misconception watch: targeted correction when the answer is a known trap
      const feedback = isMisconception ? problem.misconception.note : `Not quite. ${problem.hint}`;
      teacherFeedback = feedback;
      setPracticeFeedback("incorrect");
      setPracticeFeedbackText(feedback);
      addTranscript("student", practiceAnswer);
      addTranscript("teacher", feedback);
      if (activeBoardItemId)
        writeSpeechOnBoard(activeBoardItemId, feedback, "answer", sequenceRef.current);
      logEvent(
        isMisconception
          ? `Misconception detected: ${practiceAnswer} for ${problem.equation}`
          : `Practice incorrect: ${problem.equation}`,
      );
    }

    const continueAfterPracticeFeedback = createProceduralSpeechEnd(teacherFeedback, () => {
      if (practiceIndex < practiceProblems.length - 1) {
        setPracticeIndex((i) => i + 1);
        setPracticeAnswer("");
        setPracticeFeedback(null);
        setHintLevel(0);
      } else if (practiceMode === "guided") {
        // Move to independent practice
        setPracticeOpen(false);
        const seq = sequenceRef.current;
        setTimeout(() => startPractice("independent", seq), 1000);
      } else {
        // Move to exit ticket
        setPracticeOpen(false);
        setTimeout(() => {
          setExitTicketOpen(true);
          setPhase("exit_ticket");
          setTeacherState("asking_question");
          setCaptionText("Final check before we finish!");
          setCaptionSpeaker(TEACHER_NAME);
          speakTeacher("Final check before we finish!", "question");
        }, 1000);
      }
    });
    speakTeacher(teacherFeedback, "answer", activeBoardItemId, continueAfterPracticeFeedback);
  }, [
    practiceAnswer,
    practiceIndex,
    practiceMode,
    writtenLines,
    sequence,
    currentIndex,
    addTranscript,
    writeSpeechOnBoard,
    startPractice,
    logEvent,
    createProceduralSpeechEnd,
    speakTeacher,
  ]);

  // -- Exit ticket handler -------------------------------
  const handleExitTicketSubmit = useCallback(
    (answer: string) => {
      if (!EXIT_TICKET_QUESTION) {
        setExitTicketOpen(false);
        setReflectionOpen(true);
        return;
      }
      const norm = (s: string) => s.replace(/\s/g, "").toLowerCase();
      const isCorrect = norm(answer) === norm(EXIT_TICKET_QUESTION.correct);
      const feedback = isCorrect
        ? EXIT_TICKET_QUESTION.feedbackCorrect
        : EXIT_TICKET_QUESTION.feedbackIncorrect;
      const activeBoardItemId =
        writtenLines[writtenLines.length - 1]?.id ?? sequence[currentIndex]?.id;
      setExitTicketAnswer(answer);
      setExitTicketFeedback(isCorrect ? "correct" : "incorrect");

      addTranscript("student", answer);
      logEvent(`Exit ticket: ${answer} (${isCorrect ? "correct" : "incorrect"})`);
      addTranscript("teacher", feedback);
      if (activeBoardItemId)
        writeSpeechOnBoard(activeBoardItemId, feedback, "answer", sequenceRef.current);

      const continueAfterExitFeedback = createProceduralSpeechEnd(feedback, () => {
        setExitTicketOpen(false);
        setReflectionOpen(true);
        setTeacherState("asking_question");
        setCaptionText(EXIT_REFLECTION.question);
        setCaptionSpeaker(TEACHER_NAME);
        addTranscript("teacher", EXIT_REFLECTION.question);
        speakTeacher(EXIT_REFLECTION.question, "question");
      });
      speakTeacher(feedback, "answer", activeBoardItemId, continueAfterExitFeedback);
    },
    [
      addTranscript,
      writeSpeechOnBoard,
      writtenLines,
      sequence,
      currentIndex,
      logEvent,
      createProceduralSpeechEnd,
      speakTeacher,
    ],
  );

  /** Exit reflection answered ? record weak area, then end the lesson. */
  const handleReflection = useCallback(
    (option: string) => {
      addTranscript("student", `Wants to review: ${option}`);
      logEvent(`Exit reflection: ${option}`);
      setReflectionOpen(false);
      handleEndLesson();
    },
    [addTranscript, logEvent, handleEndLesson],
  );

  // ------------------------------------------------------
  // Render: Start Screen
  // ------------------------------------------------------

  const handleResumeLesson = useCallback(() => {
    setStarted(true);
    setSavedProgress(null);
    // Resume from where they left off - start fresh but acknowledge progress
    setPhase("idle");
    setTeacherState("preparing");
    setCaptionText("Welcome back! Resuming your lesson...");
    setCaptionSpeaker(TEACHER_NAME);
    addTranscript("system", "Lesson resumed from previous session");

    const seq = ++sequenceRef.current;
    setCurrentIndex(0);
    setWrittenLines([]);
    setBoardSpeech({});
    setCurrentWritingText("");

    const resumeText = "Welcome back! Let's continue our lesson.";
    const continueAfterResume = createProceduralSpeechEnd(
      resumeText,
      () => {
        if (seq === sequenceRef.current) {
          writeOnBoard(sequence[0], seq, 0);
        }
      },
      PROCEDURAL_START_PAUSE_MS,
    );
    speakTeacher(resumeText, "welcome", undefined, continueAfterResume);
  }, [addTranscript, createProceduralSpeechEnd, speakTeacher, writeOnBoard, sequence]);

  const handleStartFresh = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setSavedProgress(null);
    handleStartLesson();
  }, [handleStartLesson]);

  // -- Inline engagement (non-modal) ---------------------
  // Derive a single inline prompt from the existing interjection state. These
  // used to be modal overlays; now they render in the engagement area under the
  // whiteboard, so they never trap or interrupt the learner.
  const engagement = useMemo<EngagementPrompt | null>(() => {
    if (recapOpen && SECTION_RECAPS[recapOpen]) {
      return {
        kind: "recap",
        title: SECTION_RECAPS[recapOpen].title,
        bodyList: SECTION_RECAPS[recapOpen].points,
        actions: [{ id: "recap:resume", label: "Ready to continue ?", primary: true }],
      };
    }
    if (thinkingPauseText) {
      return {
        kind: "thinking_pause",
        title: thinkingPauseText,
        actions: [
          { id: "pause:continue", label: "Continue", primary: true },
          { id: "pause:repeat", label: "Read again" },
          { id: "pause:help", label: "I need help" },
        ],
      };
    }
    if (middleQuestionOpen && MIDDLE_QUESTION) {
      return {
        kind: "middle_question",
        title: MIDDLE_QUESTION.question,
        actions: MIDDLE_QUESTION.options.map((opt) => ({ id: `middle:${opt}`, label: opt })),
        feedback: middleFeedback
          ? { tone: middleFeedback.correct ? "correct" : "incorrect", text: middleFeedback.text }
          : undefined,
      };
    }
    if (confidenceOpen) {
      return {
        kind: "confidence_check",
        title: "How confident are you with this so far?",
        body: "This is learning data, not a grade.",
        actions: CONFIDENCE_OPTIONS.map((opt) => ({
          id: `conf:${opt.value}`,
          label: `${opt.emoji} ${opt.label}`,
        })),
      };
    }
    if (reflectionOpen) {
      return {
        kind: "exit_reflection",
        title: EXIT_REFLECTION.question,
        actions: EXIT_REFLECTION.options.map((opt) => ({ id: `reflect:${opt}`, label: opt })),
      };
    }
    if (followUpActive && followUp) {
      return {
        kind: "after_answer",
        title: followUp,
        actions: [
          { id: "after:continue", label: "Yes, continue", primary: true },
          { id: "after:example", label: "Show an example" },
          { id: "after:simpler", label: "Explain simpler" },
          { id: "after:ask", label: "Ask again" },
        ],
      };
    }
    return null;
  }, [
    recapOpen,
    thinkingPauseText,
    middleQuestionOpen,
    middleFeedback,
    confidenceOpen,
    reflectionOpen,
    followUp,
    followUpActive,
    SECTION_RECAPS,
    MIDDLE_QUESTION,
    CONFIDENCE_OPTIONS,
    EXIT_REFLECTION,
  ]);

  const onEngagementAction = useCallback(
    (actionId: string) => {
      const [group, value] = actionId.split(/:(.+)/);
      switch (group) {
        case "recap":
          resumeAfterInterjection();
          break;
        case "pause":
          handleThinkingPause(value as "continue" | "repeat" | "help");
          break;
        case "middle":
          if (!middleFeedback) handleMiddleAnswer(value);
          break;
        case "conf": {
          const opt = CONFIDENCE_OPTIONS.find((o) => o.value === value);
          if (opt) handleConfidence(opt);
          break;
        }
        case "reflect":
          handleReflection(value);
          break;
        case "after":
          setFollowUp(null);
          if (value === "ask") handleAskQuestion();
          else
            handleQuickAction(
              value === "continue"
                ? "Continue"
                : value === "example"
                  ? "Give example"
                  : "Explain simpler",
            );
          break;
      }
    },
    [
      resumeAfterInterjection,
      handleThinkingPause,
      handleMiddleAnswer,
      middleFeedback,
      handleConfidence,
      handleReflection,
      handleAskQuestion,
      handleQuickAction,
      CONFIDENCE_OPTIONS,
    ],
  );

  if (!started) {
    // Resume prompt if there's saved progress
    if (savedProgress?.exists && savedProgress.progress && savedProgress.progress > 5) {
      const sectionLabel =
        LESSON_PLAN_SECTIONS.find((s) => s.key === savedProgress.section)?.label ??
        savedProgress.section ??
        "Unknown";
      return (
        <div className="min-h-screen bg-[#F6F8FB] px-4 py-10 text-[#132033] sm:px-6">
          <div className="mx-auto max-w-3xl rounded-[32px] border border-[#E6EDF4] bg-[#FFFDFC] p-6 shadow-[0_24px_60px_rgba(25, 19, 20,0.08)] sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E7EEF5] bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#6B7F92]">
              <Sparkles className="h-3.5 w-3.5 text-[#8AA0B4]" />
              Continue lesson
            </div>

            <div className="mt-5 grid gap-6 lg:grid-cols-[1.4fr_.9fr]">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Welcome back to your classroom.
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-7 text-[#61758A] sm:text-base">
                  Your progress has been saved, so you can continue in a calm and familiar lesson
                  space without restarting from the beginning.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <button
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-[#1D3E5C] px-5 text-sm font-bold text-white transition-all hover:bg-[#17324A]"
                    onClick={handleResumeLesson}
                  >
                    Resume learning
                  </button>
                  <button
                    className="text-sm font-semibold text-[#365978] transition-colors hover:text-[#1D3E5C]"
                    onClick={handleStartFresh}
                  >
                    Start again
                  </button>
                </div>
              </div>

              <div className="rounded-[24px] border border-[#E9EFF5] bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7A8FA3]">
                  Saved lesson status
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="rounded-2xl bg-[#FAFCFE] p-4 ring-1 ring-[#EDF3F8]">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#7A8FA3]">
                      Progress
                    </p>
                    <p className="mt-2 text-lg font-extrabold text-[#132033]">
                      {savedProgress.progress}%
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#FAFCFE] p-4 ring-1 ring-[#EDF3F8]">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#7A8FA3]">
                      Current section
                    </p>
                    <p className="mt-2 text-sm font-bold text-[#132033]">{sectionLabel}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F6F8FB] px-4 py-10 text-[#132033] sm:px-6">
        <div className="mx-auto max-w-5xl rounded-[32px] border border-[#E6EDF4] bg-[#FFFDFC] p-6 shadow-[0_24px_60px_rgba(25, 19, 20,0.08)] sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.35fr_.95fr] lg:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E7EEF5] bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#6B7F92]">
                <Sparkles className="h-3.5 w-3.5 text-[#8AA0B4]" />
                Live classroom
              </div>
              <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-[#132033] sm:text-4xl">
                {LESSON_TITLE}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#61758A] sm:text-base">
                {LESSON_OPENING_NARRATIVE}
              </p>

              <div className="mt-6 grid gap-4 rounded-[24px] border border-[#E8EEF4] bg-white p-5 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#FAFCFE] p-4 ring-1 ring-[#EDF3F8]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#7A8FA3]">
                    Lesson goal
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#132033]">
                    {lesson.lessonGoal}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#FAFCFE] p-4 ring-1 ring-[#EDF3F8]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#7A8FA3]">
                    Why this matters
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#132033]">
                    {lesson.whyItMatters}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-[#6E8193]">
                <span className="rounded-full bg-[#F7FAFC] px-3 py-1 ring-1 ring-[#E8EEF4]">
                  {INSTITUTION}
                </span>
                <span className="rounded-full bg-[#F7FAFC] px-3 py-1 ring-1 ring-[#E8EEF4]">
                  {COURSE}
                </span>
                <span className="rounded-full bg-[#F7FAFC] px-3 py-1 ring-1 ring-[#E8EEF4]">
                  {LESSON_SUBJECT}
                </span>
                <span className="rounded-full bg-[#F7FAFC] px-3 py-1 ring-1 ring-[#E8EEF4]">
                  ~{estimatedMinutes} min
                </span>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1D3E5C] px-5 text-sm font-bold text-white transition-all hover:bg-[#17324A]"
                  onClick={handleStartLesson}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Start learning
                </button>
                <button
                  className="text-sm font-semibold text-[#365978] transition-colors hover:text-[#1D3E5C]"
                  onClick={() => setModeSelectorOpen(true)}
                >
                  Review learning mode
                </button>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#E8EEF4] bg-[#FCFDFC] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7A8FA3]">
                Learning setup
              </p>
              <div className="mt-4 grid gap-3">
                {LEARNING_MODES.slice(0, 4).map((m) => (
                  <button
                    key={m.value}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm transition-all ${
                      learningMode === m.value
                        ? "bg-[#EEF5FB] text-[#1D3E5C] ring-1 ring-[#CFE0EE]"
                        : "bg-white text-[#54677A] ring-1 ring-[#E8EEF4] hover:bg-[#FAFCFE]"
                    }`}
                    onClick={() => setLearningMode(m.value)}
                  >
                    <span className="font-semibold">
                      {m.icon} {m.label}
                    </span>
                    {learningMode === m.value ? (
                      <span className="text-xs font-bold uppercase tracking-wider">Selected</span>
                    ) : null}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-xs leading-6 text-[#6E8193]">
                The same classroom layout is shared across demo lessons, with support settings
                available whenever a learner needs them.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------
  // Render: Main Classroom
  // ------------------------------------------------------



  const isSpeaking =
    teacherState === "speaking" ||
    teacherState === "explaining" ||
    teacherState === "answering" ||
    teacherState === "reading";

  const stateColors: Record<string, { bg: string; text: string }> = {
    preparing: { bg: "rgba(31,124,128,0.15)", text: "var(--crimson)" },
    writing: { bg: "rgba(124,58,237,0.15)", text: "#a78bfa" },
    speaking: { bg: "rgba(34,197,94,0.15)", text: "#4ade80" },
    explaining: { bg: "rgba(31,124,128,0.15)", text: "var(--crimson)" },
    listening: { bg: "rgba(234,179,8,0.15)", text: "#facc15" },
    thinking: { bg: "rgba(168,85,247,0.15)", text: "#c084fc" },
    asking_question: { bg: "rgba(249,115,22,0.15)", text: "#fb923c" },
    paused: { bg: "rgba(168, 152, 144,0.15)", text: "#A89890" },
    answering: { bg: "rgba(34,197,94,0.15)", text: "#4ade80" },
    encouraging: { bg: "rgba(34,197,94,0.15)", text: "#4ade80" },
    warning: { bg: "rgba(239,68,68,0.15)", text: "#f87171" },
    correcting: { bg: "rgba(239,68,68,0.15)", text: "#f87171" },
  };

  const stateLabel = teacherState.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());



  return (
    <div className={`vc-root ${classroomView === "simple" ? "vc-simple-view" : "vc-full-view"}`}>
      {/* -- Top Bar ---------------------------------------- */}
      <ClassroomTopBar
        institution={INSTITUTION}
        course={COURSE}
        subject={LESSON_SUBJECT}
        title={LESSON_TITLE}
        progress={progress}
        phase={phase}
        equation={LESSON_EQUATION}
        courseType={LESSON_COURSE_TYPE}
        clock={clock}
        learningMode={learningMode}
        onBack={onExit}
        onOpenSettings={() => setModeSelectorOpen(true)}
        onOpenNotes={() => setLearningDrawerTab("notes")}
        onOpenTranscript={() => setLearningDrawerTab("transcript")}
        onEndLesson={handleEndLesson}
      />

      {/* -- Main Layout ------------------------------------ */}
      <div className="vc-main">
        {/* -- Teacher Panel (26%) --------------------------- */}
        <div className="vc-teacher-panel">
          {/* Panel header � teacher presence */}
          <div className="vc-panel-header">
            <span className="vc-panel-header-title">Your Teacher</span>
            <span className="vc-panel-header-status">
              <span className="vc-panel-header-dot" />
              Online
            </span>
          </div>

          {/* Video / portrait frame */}
          <div className="vc-teacher-frame">
            <div className={`vc-teacher-frame-inner vc-voice-${teacherVoice.state}`}>
              {TEACHER_VIDEO ? (
                /* Real teacher ? their video feed plays here */
                <video
                  src={TEACHER_VIDEO}
                  className="vc-teacher-image-real"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                /* Lesson teacher ? a portrait matched to the lesson's voice */
                <img
                  src={TEACHER_IMAGE}
                  alt={TEACHER_NAME}
                  className="vc-teacher-image-real"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent && !parent.querySelector(".vc-teacher-image-placeholder")) {
                      const fallback = document.createElement("div");
                      fallback.className = "vc-teacher-image-placeholder";
                      fallback.textContent = TEACHER_NAME.slice(0, 2).toUpperCase();
                      parent.appendChild(fallback);
                    }
                  }}
                />
              )}

              {/* Speaking Ring */}
              <div className={`vc-speaking-ring ${isSpeaking ? "vc-speaking-ring-active" : ""}`} />

              {/* Live presence badge */}
              <div className="vc-teacher-badge">
                <span className="vc-teacher-badge-dot" />
                Live
              </div>

              {teacherVoice.state === "fallback" && (
                <div className="vc-teacher-fallback-badge">Browser Voice</div>
              )}

              <div
                className={`vc-teacher-voice-indicator ${isSpeaking || teacherVoice.isSpeaking ? "vc-teacher-voice-indicator-active" : ""}`}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path
                    d="M19 10v2a7 7 0 0 1-14 0v-2"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" />
                </svg>
                Speaking
              </div>
            </div>
          </div>

          {/* Teacher identity � name, subject subtitle, live status */}
          <div className="vc-teacher-identity">
            <div className="vc-teacher-name-row">
              <span className="vc-teacher-name">{TEACHER_NAME}</span>
            </div>
            <div className="vc-teacher-subtitle">{LESSON_SUBJECT} Teacher</div>
            <div className="vc-teacher-live-status">
              <span
                className="vc-teacher-live-dot"
                style={{ background: stateColors[teacherState]?.text ?? "#16a34a" }}
              />
              {stateLabel}
            </div>
            <div className={`vc-teaching-mode-badge vc-teaching-mode-${teachingMode}`}>
              <span>{teachingMode}</span>
            </div>
          </div>

          {/* Course contents sit directly below the teacher image/identity.
              Keep a compact version visible even in simple view so the sidebar
              always feels useful and structured. */}
          <CourseOutline
            course={COURSE}
            lessonTitle={LESSON_TITLE}
            sections={LESSON_PLAN_SECTIONS}
            currentSection={currentSection}
            canRevisit={(key) => SECTION_START_INDEX[key] !== undefined}
            onRevisit={jumpToSection}
            compact={classroomView === "simple"}
          />

          {/* Three mini status cards � Voice / Captions / Listening */}
          <div className="vc-mini-cards">
            <div className={`vc-mini-card ${isSpeaking ? "vc-mini-card-on" : ""}`}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
              </svg>
              <span>Voice Active</span>
            </div>
            <div
              className={`vc-mini-card ${captionsOn || learningMode === "deaf" ? "vc-mini-card-on" : ""}`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="4" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="18" x2="12" y2="21" />
              </svg>
              <span>Captions On</span>
            </div>
            <div
              className={`vc-mini-card ${isListening || teacherState === "listening" ? "vc-mini-card-on" : ""}`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M2 12a10 10 0 0 1 20 0" />
                <path d="M5 12a7 7 0 0 1 14 0" />
                <path d="M8 12a4 4 0 0 1 8 0" />
              </svg>
              <span>Listening</span>
            </div>
          </div>

          {/* Step Info */}
          <div className="vc-teacher-step-info">
            <div className="vc-teacher-step-top">
              <span className="vc-teacher-step-label">Current Step</span>
              <span className="vc-teacher-step-count">
                {currentIndex + 1} of {sequence.length}
              </span>
            </div>
            <span className="vc-teacher-step-value">
              {currentItem
                ? currentItem.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                : "�"}
            </span>
            <div className="vc-teacher-step-bar">
              <div className="vc-teacher-step-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Raise Hand Status */}
          {raiseHand === "raised" && (
            <div className="vc-raise-hand-status">
              <span className="vc-raise-hand-status-dot" />
              Hand raised � waiting for teacher...
            </div>
          )}
          {raiseHand === "acknowledged" && (
            <div className="vc-raise-hand-status vc-raise-hand-status-ok">
              ?? Teacher sees your hand!
            </div>
          )}

          {/* Quick Help � simplified for a calmer shared classroom */}
          <div className="vc-quick-help">
            <div className="vc-quick-help-title">Quick Help</div>
            <div className="vc-quick-help-grid">
              <button className="vc-quick-help-btn" onClick={handleAskQuestion}>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Ask Question
              </button>
              <button
                className="vc-quick-help-btn"
                onClick={() => handleQuickAction("Explain simpler")}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 18h6" />
                  <path d="M10 22h4" />
                  <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z" />
                </svg>
                Explain Simpler
              </button>
            </div>
            <div className="mt-3 rounded-2xl bg-[#FBFCFE] px-4 py-3 text-xs leading-6 text-[#66798C] ring-1 ring-[#EEF3F7]">
              Need more support? Use{" "}
              <span className="font-semibold text-[#365978]">More Support</span> in the bottom bar
              for notes, transcript, learning mode, and extra help.
            </div>
          </div>
        </div>

        {/* -- Whiteboard Area (74%) ------------------------ */}
        <div className="vc-whiteboard-area">
          {/* Current goal banner � keeps the learner focused on the now */}
          <div className="vc-current-goal">
            <span className="vc-current-goal-icon" aria-hidden>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              </svg>
            </span>
            <span className="vc-current-goal-label">Current Goal:</span>
            <span className="vc-current-goal-text">
              {SECTION_GOALS[currentSection] ?? "Follow along with the teacher."}
            </span>
            <span className="vc-current-goal-info" aria-hidden>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </span>
          </div>
          <div className="vc-board-row">
            <div className="vc-whiteboard">
              {/* Whiteboard Header */}
              <div className="vc-whiteboard-header">
                <div className="vc-whiteboard-header-left">
                  <span className="vc-whiteboard-label">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden
                    >
                      <rect x="3" y="4" width="18" height="14" rx="2" />
                      <line x1="3" y1="20" x2="21" y2="20" />
                    </svg>
                    Learning Whiteboard
                  </span>
                  <span className="vc-whiteboard-sep">�</span>
                  <span className="vc-whiteboard-section">
                    {LESSON_PLAN_SECTIONS.find((s) => s.key === currentSection)?.label ?? "Lesson"}
                  </span>
                  <span className="vc-whiteboard-sep">�</span>
                  {isWriting ? (
                    <span className="vc-whiteboard-writing-indicator">
                      <span className="vc-whiteboard-writing-dot" />
                      Writing�
                    </span>
                  ) : (
                    <span className="vc-whiteboard-count">
                      {writtenLines.length} of {sequence.length} items
                    </span>
                  )}
                </div>
                <div className="vc-whiteboard-header-right">
                  <button className="vc-board-tool-btn" onClick={handleReplayStep}>
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="1 4 1 10 7 10" />
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                    Replay This Item
                  </button>
                  <button
                    className="vc-board-tool-btn"
                    onClick={() => {
                      const last = writtenLines[writtenLines.length - 1];
                      if (!last) return;
                      const description = `Board description: ${last.boardText}. ${last.teacherExplanation ?? ""}`;
                      setCaptionText(description);
                      setCaptionSpeaker(TEACHER_NAME);
                      addTranscript("teacher", description, last.id);
                      writeSpeechOnBoard(last.id, description, "explain", sequenceRef.current);
                      speakTeacher(description, "explanation", last.id);
                    }}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M11 5L6 9H2v6h4l5 4V5z" />
                      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                    </svg>
                    Describe Board
                  </button>
                  <div className="vc-board-zoom">
                    <button
                      className="vc-board-zoom-btn"
                      aria-label="Zoom out"
                      onClick={() => setBoardZoom((z) => Math.max(80, z - 10))}
                    >
                      -
                    </button>
                    <span className="vc-board-zoom-val">{boardZoom}%</span>
                    <button
                      className="vc-board-zoom-btn"
                      aria-label="Zoom in"
                      onClick={() => setBoardZoom((z) => Math.min(140, z + 10))}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="vc-board-stage">
                {/* Vertical tool strip � functional whiteboard tools */}
                <div className="vc-board-toolstrip">
                  <button
                    className={`vc-board-tool ${boardTool === "pen" ? "vc-board-tool-active" : ""}`}
                    title="Highlight"
                    onClick={() => setBoardTool(boardTool === "pen" ? "cursor" : "pen")}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 19l7-7 3 3-7 7-3-3z" />
                      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                      <path d="M2 2l7.586 7.586" />
                      <circle cx="11" cy="11" r="2" />
                    </svg>
                  </button>
                  <button
                    className={`vc-board-tool ${boardTool === "cursor" ? "vc-board-tool-active" : ""}`}
                    title="Select"
                    onClick={() => setBoardTool("cursor")}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                    </svg>
                  </button>
                  <button
                    className={`vc-board-tool ${boardTool === "chat" ? "vc-board-tool-active" : ""}`}
                    title="Ask about this"
                    onClick={() => setBoardTool(boardTool === "chat" ? "cursor" : "chat")}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>
                  <button
                    className={`vc-board-tool ${boardTool === "text" ? "vc-board-tool-active" : ""}`}
                    title="Add note"
                    onClick={() => setBoardTool(boardTool === "text" ? "cursor" : "text")}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="4 7 4 4 20 4 20 7" />
                      <line x1="9" y1="20" x2="15" y2="20" />
                      <line x1="12" y1="4" x2="12" y2="20" />
                    </svg>
                  </button>
                  <button
                    className={`vc-board-tool ${boardTool === "image" ? "vc-board-tool-active" : ""}`}
                    title="Describe board"
                    onClick={() => setBoardTool(boardTool === "image" ? "cursor" : "image")}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </button>
                  {/* Tool hint */}
                  <div className="vc-board-tool-hint">
                    {boardTool === "pen" && "Click lines to highlight"}
                    {boardTool === "cursor" && "Click to select"}
                    {boardTool === "chat" && "Click a line to ask"}
                    {boardTool === "text" && "Click a line to annotate"}
                    {boardTool === "image" && "Click a line to describe"}
                  </div>
                </div>

                {/* Whiteboard Content */}
                <div
                  className="vc-whiteboard-content"
                  ref={boardRef}
                  style={{ "--vc-board-zoom": boardZoom / 100 } as Record<string, number>}
                >
                  {writtenLines.length === 0 && !isWriting && (
                    <div className="vc-whiteboard-empty">
                      The whiteboard is ready. The teacher will start writing shortly...
                    </div>
                  )}

                  {writtenLines.map((item, idx) => (
                    <BoardLine
                      key={item.id}
                      item={item}
                      lineIndex={idx + 1}
                      isActive={idx === writtenLines.length - 1 && !isWriting}
                      courseType={LESSON_COURSE_TYPE}
                      speechLines={boardSpeech[item.id] ?? []}
                      highlighted={highlightedLines.has(idx)}
                      selected={selectedLineIdx === idx}
                      annotation={boardAnnotations[idx]}
                      onClick={() => handleBoardLineClick(idx)}
                      onAnnotationSave={(text) => {
                        if (text.trim()) {
                          setBoardAnnotations((prev) => ({ ...prev, [idx]: text.trim() }));
                          writeSpeechOnBoard(item.id, text.trim(), "explain", sequenceRef.current);
                          addTranscript("student", text.trim(), item.id);
                          logEvent(`Board annotation: ${text.trim().slice(0, 50)}`);
                        } else {
                          setBoardAnnotations((prev) => {
                            const next = { ...prev };
                            delete next[idx];
                            return next;
                          });
                        }
                      }}
                    />
                  ))}

                  {/* Currently writing line */}
                  {isWriting && currentWritingText && (
                    <div className="vc-board-line vc-board-line-active">
                      <span className="vc-board-line-number">{writtenLines.length + 1}</span>
                      <div className="vc-handwriting-container">
                        <span className="vc-handwriting-text">{currentWritingText}</span>
                        <MarkerPen />
                      </div>
                    </div>
                  )}
                </div>

                {/* Markers + eraser resting in the board's tray */}
                <div className="vc-whiteboard-tray" aria-hidden>
                  <span className="vc-tray-marker vc-tray-marker-teal" />
                  <span className="vc-tray-marker vc-tray-marker-black" />
                  <span className="vc-tray-marker vc-tray-marker-red" />
                  <span className="vc-tray-eraser" />
                </div>
              </div>
              {/* /vc-board-stage */}
            </div>
            {/* Smaller right section � lesson visuals (graphs / diagrams /
              illustrations) and live bullet summaries of what's on the board.
              The classroom decides the content automatically from the subject. */}
            {classroomView === "full" && (
              <LearningDrawer
                activeTab={learningDrawerTab}
                onTabChange={setLearningDrawerTab}
                notes={FULL_LEARNER_NOTES}
                transcript={transcript}
                progress={progress}
                currentSectionLabel={
                  LESSON_PLAN_SECTIONS.find((s) => s.key === currentSection)?.label ?? "Lesson"
                }
                results={results}
                courseType={LESSON_COURSE_TYPE}
                isDemo={lesson.lessonId === "demo"}
                keyPoints={boardKeyPoints}
                lessonTitle={LESSON_TITLE}
                currentGoal={SECTION_GOALS[currentSection]}
                activeVisual={activeVisual}
                visualPlan={VISUAL_PLAN}
                onAskQuestion={handleAskQuestion}
                onDownloadNotes={() => {
                  const blob = new Blob([FULL_LEARNER_NOTES], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${LESSON_TITLE} - Notes.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* -- Inline engagement area (replaces engagement popups) ----------
          The teacher's checks, recaps, hints, and after-answer prompts render
          here � non-modal, screen-reader announced, keyboard friendly. */}
      <InlineEngagementArea
        prompt={engagement}
        learningMode={learningMode}
        onAction={onEngagementAction}
      />

      {/* -- Caption Bar ------------------------------------ */}
      {(captionsOn || learningMode === "deaf") && (
        <div className={`vc-caption-bar vc-cap-${captionSize}`}>
          <div className="vc-caption-bar-inner">
            <span className="vc-caption-badge">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path
                  d="M19 10v2a7 7 0 0 1-14 0v-2"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
              {captionSpeaker}
            </span>
            {captionText ? (
              <span className={`vc-caption-text ${teacherAside ? "vc-caption-aside" : ""}`}>
                {captionText}
              </span>
            ) : (
              <span className="vc-caption-empty">Captions will appear here</span>
            )}
          </div>
          <div className="vc-caption-footer">
            <span>
              <span className="vc-caption-footer-label">Captions</span>
              <span className="vc-caption-footer-link">English</span>
            </span>
            <span>
              <span className="vc-caption-footer-label">Speed</span>
              <span className="vc-caption-footer-link">1.0x</span>
            </span>
          </div>
        </div>
      )}

      {/* -- Bottom Controls � four labelled clusters (matches reference) -- */}
      <div className="vc-controls">
        {/* Lesson Controls */}
        <div className="vc-control-cluster">
          <span className="vc-cluster-label">Lesson Controls</span>
          <div className="vc-cluster-row">
            <button className="vc-ctl vc-ctl-primary" onClick={handlePause}>
              {isPaused ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              )}
              <span>{isPaused ? "Play" : "Pause"}</span>
            </button>
            <button className="vc-ctl" onClick={handleReplay} title="Replay lesson from the start">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              <span>Replay</span>
            </button>
            <button className="vc-ctl" onClick={handleNextStep} title="Next">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="13 5 22 12 13 19 13 5" />
                <polygon points="2 5 11 12 2 19 2 5" />
              </svg>
              <span>Step</span>
            </button>
          </div>
        </div>

        <div className="vc-controls-divider" />

        {/* Help & Interaction */}
        <div className="vc-control-cluster vc-control-cluster-help">
          <span className="vc-cluster-label">Help &amp; Interaction</span>
          <div className="vc-cluster-row">
            <button className="vc-ctl" onClick={handleAskQuestion}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>Ask Question</span>
            </button>
            <button
              className="vc-ctl vc-ctl-danger-soft"
              onClick={() => handleQuickAction("I don't understand")}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>I Don't Understand</span>
            </button>
            <button
              className="vc-ctl vc-ctl-amber"
              onClick={() => setSupportMenuOpen((open) => !open)}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="5" cy="12" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="19" cy="12" r="1.5" />
              </svg>
              <span>More Support</span>
            </button>
          </div>
        </div>

        <div className="vc-controls-divider" />

        {/* Learning Support */}
        <div className="vc-control-cluster">
          <span className="vc-cluster-label">Learning Support</span>
          <div className="vc-cluster-row">
            <button
              className={`vc-ctl ${captionsOn || learningMode === "deaf" ? "vc-ctl-active" : ""}`}
              onClick={() => setCaptionsOn((v) => !v)}
              disabled={learningMode === "deaf"}
              aria-pressed={captionsOn || learningMode === "deaf"}
              title={
                learningMode === "deaf"
                  ? "Captions are always on in Deaf mode"
                  : captionsOn
                    ? "Hide captions"
                    : "Show captions"
              }
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="4" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="18" x2="12" y2="21" />
              </svg>
              <span>Captions</span>
            </button>
            <div className="vc-support-menu-wrap">
              <button
                className={`vc-ctl ${supportMenuOpen ? "vc-ctl-active" : ""}`}
                onClick={() => setSupportMenuOpen((open) => !open)}
                aria-expanded={supportMenuOpen}
                title="More learning support"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="5" cy="12" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="19" cy="12" r="1.5" />
                </svg>
                <span>More Support</span>
              </button>
              {supportMenuOpen && (
                <div className="vc-support-menu" role="menu" aria-label="More learning support">
                  <button
                    role="menuitem"
                    onClick={() => {
                      if (learningMode !== "deaf") setVoiceEnabled((v) => !v);
                      setSupportMenuOpen(false);
                    }}
                  >
                    <span>
                      {voiceEnabled && learningMode !== "deaf" ? "Turn Voice Off" : "Turn Voice On"}
                    </span>
                  </button>
                  <button role="menuitem" onClick={handleRaiseHand}>
                    <span>
                      {raiseHand === "idle"
                        ? "Raise Hand"
                        : raiseHand === "raised"
                          ? "Raised..."
                          : "Hand Seen"}
                    </span>
                  </button>
                  <button
                    role="menuitem"
                    onClick={() => {
                      handleQuickAction("Give example");
                      setSupportMenuOpen(false);
                    }}
                  >
                    <span>Another Example</span>
                  </button>
                  <button
                    role="menuitem"
                    onClick={() => {
                      setLearningDrawerTab("notes");
                      setSupportMenuOpen(false);
                    }}
                  >
                    <span>Open Notes</span>
                  </button>
                  <button
                    role="menuitem"
                    onClick={() => {
                      setLearningDrawerTab("transcript");
                      setSupportMenuOpen(false);
                    }}
                  >
                    <span>Open Transcript</span>
                  </button>
                  <button
                    role="menuitem"
                    onClick={() => {
                      setModeSelectorOpen(true);
                      setSupportMenuOpen(false);
                    }}
                  >
                    <span>Learning Mode</span>
                  </button>
                </div>
              )}
            </div>
            <button
              className="vc-ctl"
              title="Playback speed"
              onClick={() =>
                setTeacherVoiceSpeed((speed) => {
                  const speeds = [0.75, 0.9, 1, 1.15];
                  const index = speeds.findIndex((value) => Math.abs(value - speed) < 0.01);
                  return speeds[(index + 1) % speeds.length];
                })
              }
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 8 12 12 15 13" />
              </svg>
              <span>Speed {teacherVoiceSpeed.toFixed(2).replace(/0$/, "")}x</span>
            </button>
            <button
              className={`vc-ctl ${classroomView === "simple" ? "vc-ctl-active" : ""}`}
              onClick={() => setClassroomView((view) => (view === "simple" ? "full" : "simple"))}
              aria-pressed={classroomView === "simple"}
              title={
                classroomView === "simple"
                  ? "Show full classroom tools"
                  : "Switch to simple classroom view"
              }
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M8 9h8M8 13h5" />
              </svg>
              <span>{classroomView === "simple" ? "Full View" : "Simple View"}</span>
            </button>
          </div>
        </div>

        <div className="vc-controls-divider" />

        {/* Session */}
        <div className="vc-control-cluster">
          <span className="vc-cluster-label">Session</span>
          <div className="vc-cluster-row">
            <button className="vc-ctl vc-ctl-end" onClick={handleEndLesson}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"
                  transform="rotate(135 12 12)"
                />
              </svg>
              <span>End Lesson</span>
            </button>
          </div>
        </div>
      </div>

      {/* -- Notes Drawer ----------------------------------- */}

      {/* -- Transcript Drawer ------------------------------ */}
      <Drawer open={false} onClose={() => undefined} title="Lesson Transcript">
        <div className="vc-drawer-content" style={{ fontFamily: "system-ui, sans-serif" }}>
          {transcript.length === 0 ? (
            <div style={{ color: "var(--muted)", fontStyle: "italic" }}>
              Transcript will populate as the lesson progresses...
            </div>
          ) : (
            transcript.map((entry) => (
              <div
                key={entry.id}
                style={{
                  marginBottom: 12,
                  padding: "8px 12px",
                  background:
                    entry.role === "board"
                      ? "rgba(124,58,237,0.1)"
                      : entry.role === "student"
                        ? "rgba(31,124,128,0.1)"
                        : entry.role === "system"
                          ? "rgba(168, 152, 144,0.1)"
                          : "transparent",
                  borderRadius: 8,
                  borderLeft:
                    entry.role === "board"
                      ? "3px solid #7c3aed"
                      : entry.role === "student"
                        ? "3px solid #C25565"
                        : entry.role === "system"
                          ? "3px solid #A89890"
                          : "3px solid #22c55e",
                }}
              >
                <div
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color:
                      entry.role === "board"
                        ? "#a78bfa"
                        : entry.role === "student"
                          ? "var(--crimson)"
                          : entry.role === "system"
                            ? "#A89890"
                            : "#4ade80",
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  {entry.role === "board"
                    ? "?? Board"
                    : entry.role === "student"
                      ? "?? Learner"
                      : entry.role === "system"
                        ? "?? System"
                        : "????? Teacher"}
                  <span style={{ marginLeft: 8, fontWeight: 400, color: "var(--muted)" }}>
                    {entry.timestamp}
                  </span>
                </div>
                <div style={{ color: "#D8CCC6", fontSize: "0.82rem" }}>{entry.text}</div>
              </div>
            ))
          )}
        </div>
      </Drawer>

      {/* -- Question Modal --------------------------------- */}
      {questionOpen && (
        <QuestionModal
          learningMode={learningMode}
          questionText={questionText}
          setQuestionText={setQuestionText}
          isListening={isListening}
          onToggleMic={toggleMic}
          onSubmit={handleSubmitQuestion}
          onClose={() => setQuestionOpen(false)}
          onQuickAction={handleQuickAction}
          clarify={clarify}
        />
      )}

      {/* -- Practice Panel --------------------------------- */}
      {practiceOpen && (
        <div
          className="vc-practice-overlay"
          onClick={(e) => e.target === e.currentTarget && setPracticeOpen(false)}
        >
          <div
            className={`vc-practice-card ${practiceMode === "guided" ? "vc-practice-guided" : "vc-practice-independent"}`}
          >
            <div className="vc-practice-badge">
              {practiceMode === "guided" ? "Guided Practice" : "Independent Practice"}
            </div>
            <div className="vc-practice-problem">
              {practiceProblems[practiceIndex]?.equation ?? ""}
            </div>
            <div className="vc-practice-question">
              {practiceProblems[practiceIndex]?.question ?? ""}
            </div>
            <input
              className="vc-practice-input"
              placeholder="Type your answer (e.g. 2, 5)"
              value={practiceAnswer}
              onChange={(e) => setPracticeAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePracticeSubmit()}
              autoFocus
            />
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                className="vc-question-action vc-question-action-primary"
                onClick={handlePracticeSubmit}
              >
                Submit Answer
              </button>
              <button
                className="vc-question-action vc-question-action-secondary"
                onClick={() => {
                  const problem = practiceProblems[practiceIndex];
                  const max = problem?.hints.length ?? 0;
                  if (hintLevel < max) {
                    setHintLevel((h) => h + 1);
                    setResults((prev) => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
                    logEvent(`Hint ${hintLevel + 1} used: ${problem?.equation}`);
                  }
                }}
                disabled={hintLevel >= (practiceProblems[practiceIndex]?.hints.length ?? 0)}
              >
                ?? {hintLevel === 0 ? "Show hint" : "Next hint"}
              </button>
              <button
                className="vc-question-action vc-question-action-secondary"
                onClick={() => setPracticeOpen(false)}
              >
                Skip
              </button>
            </div>

            {/* Progressive hints � guidance before answers */}
            {hintLevel > 0 && (
              <div className="vc-hint-box">
                {practiceProblems[practiceIndex]?.hints.slice(0, hintLevel).map((h, i) => (
                  <div key={i} className="vc-hint-item">
                    <span className="vc-hint-level">Hint {i + 1}</span>
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            )}

            {practiceFeedback && (
              <div
                className={`vc-practice-feedback ${practiceFeedback === "correct" ? "vc-practice-feedback-correct" : "vc-practice-feedback-incorrect"}`}
              >
                {practiceFeedbackText}
              </div>
            )}
          </div>
        </div>
      )}

      {/* -- Exit Ticket ------------------------------------ */}
      {exitTicketOpen && EXIT_TICKET_QUESTION && (
        <div
          className="vc-question-overlay"
          onClick={(e) => e.target === e.currentTarget && setExitTicketOpen(false)}
        >
          <div className="vc-exit-ticket-card">
            <div className="vc-exit-badge">Exit Ticket</div>
            <div className="vc-question-title">{EXIT_TICKET_QUESTION.question}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {EXIT_TICKET_QUESTION.options.map((opt, i) => (
                <button
                  key={i}
                  className={`vc-question-action vc-question-action-secondary ${
                    exitTicketAnswer === opt
                      ? exitTicketFeedback === "correct"
                        ? "vc-practice-feedback-correct"
                        : exitTicketFeedback === "incorrect"
                          ? "vc-practice-feedback-incorrect"
                          : ""
                      : ""
                  }`}
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => handleExitTicketSubmit(opt)}
                  disabled={exitTicketFeedback !== null}
                >
                  {opt}
                </button>
              ))}
            </div>
            {exitTicketFeedback && (
              <div
                className={`vc-practice-feedback ${exitTicketFeedback === "correct" ? "vc-practice-feedback-correct" : "vc-practice-feedback-incorrect"}`}
                style={{ marginTop: 12 }}
              >
                {exitTicketFeedback === "correct"
                  ? EXIT_TICKET_QUESTION.feedbackCorrect
                  : EXIT_TICKET_QUESTION.feedbackIncorrect}
              </div>
            )}
          </div>
        </div>
      )}

      {/* -- Completion Summary (clean floating card) ------ */}
      {completionOpen && (
        <div className="vc-completion-overlay" role="dialog" aria-label="Lesson completed">
          <div className="vc-completion-card">
            <div className="vc-completion-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="vc-completion-title">That brings us to the end of today's lesson</div>
            <div className="vc-completion-subtitle">{LESSON_TITLE}</div>

            {/* Takeaway Score Card */}
            {takeawayScore !== null && (
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(31,124,128,0.15) 100%)",
                  border: "2px solid rgba(34,197,94,0.3)",
                  borderRadius: 0,
                  padding: "16px",
                  marginBottom: "16px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#A89890",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  Lesson Takeaway
                </div>
                <div
                  style={{
                    fontSize: "2.2rem",
                    fontWeight: 800,
                    background: "linear-gradient(120deg, #34d399, var(--crimson))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    marginBottom: 4,
                  }}
                >
                  {takeawayScore}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#D8CCC6", fontWeight: 500 }}>
                  out of 100
                </div>
                <div
                  style={{ fontSize: "0.72rem", color: "#A89890", marginTop: 8, lineHeight: 1.4 }}
                >
                  Based on practice accuracy, engagement, and efficiency.
                </div>
              </div>
            )}

            <div className="vc-completion-stats">
              <div className="vc-completion-stat">
                <div className="vc-completion-stat-value">{writtenLines.length}</div>
                <div className="vc-completion-stat-label">Board Steps</div>
              </div>
              <div className="vc-completion-stat">
                <div className="vc-completion-stat-value">{results.questionsAsked}</div>
                <div className="vc-completion-stat-label">Questions Asked</div>
              </div>
              <div className="vc-completion-stat">
                <div className="vc-completion-stat-value">{results.raisedHands}</div>
                <div className="vc-completion-stat-label">Hands Raised</div>
              </div>
              <div className="vc-completion-stat">
                <div className="vc-completion-stat-value">
                  {results.practiceCorrect}/{results.practiceAttempts}
                </div>
                <div className="vc-completion-stat-label">Practice Correct</div>
              </div>
            </div>

            {/* Learning evidence - results without exams */}
            <div className="vc-completion-evidence">
              <div className="vc-completion-evidence-title">Your learning journey</div>
              <ul className="vc-completion-evidence-list">
                <li>
                  <span>Time on lesson</span>
                  <strong>
                    {Math.max(1, Math.round((Date.now() - startTimeRef.current) / 60000))} min
                  </strong>
                </li>
                <li>
                  <span>Hints used</span>
                  <strong>{results.hintsUsed}</strong>
                </li>
                <li>
                  <span>Confidence checks</span>
                  <strong>{results.confidenceChecks.length}</strong>
                </li>
                <li>
                  <span>Middle question</span>
                  <strong>
                    {results.middleQuestionCorrect === null
                      ? "Not answered"
                      : results.middleQuestionCorrect
                        ? "Correct"
                        : "Reviewed"}
                  </strong>
                </li>
                {results.misconceptionsDetected > 0 && (
                  <li>
                    <span>Misconceptions caught</span>
                    <strong>{results.misconceptionsDetected}</strong>
                  </li>
                )}
              </ul>
            </div>
            <div className="vc-completion-actions">
              <button
                className="vc-completion-btn vc-completion-btn-primary"
                onClick={handleReplay}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
                Replay Lesson
              </button>
              <button
                className="vc-completion-btn vc-completion-btn-secondary"
                onClick={() => {
                  setCompletionOpen(false);
                  setLearningDrawerTab("notes");
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                View Notes
              </button>
              <button
                className="vc-completion-btn vc-completion-btn-secondary"
                onClick={() => {
                  setCompletionOpen(false);
                  setLearningDrawerTab("transcript");
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="4 17 10 11 4 5" />
                  <line x1="12" y1="19" x2="20" y2="19" />
                </svg>
                View Transcript
              </button>
              {onExit && (
                <button className="vc-completion-btn vc-completion-btn-primary" onClick={onExit}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Finish &amp; exit
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* -- Settings panel � display, sound, captions, accessibility -- */}
      {modeSelectorOpen && (
        <SettingsPanel
          onClose={() => setModeSelectorOpen(false)}
          a11y={a11y}
          setA11y={setA11y}
          narrationOn={narrationOn}
          setNarrationOn={setNarrationOn}
          voiceSpeed={voiceSpeed}
          setVoiceSpeed={setVoiceSpeed}
          captionsOn={captionsOn}
          setCaptionsOn={setCaptionsOn}
          captionSize={captionSize}
          setCaptionSize={setCaptionSize}
          learningMode={learningMode}
          setLearningMode={setLearningMode}
        />
      )}

      {/* Engagement moments (recap, thinking pause, confidence, middle question,
          exit reflection) are no longer modal overlays � they render inline in
          the engagement area beneath the whiteboard (see <InlineEngagementArea/>),
          so they never trap or interrupt the learner. */}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Sub-Components
// -----------------------------------------------------------------------------

/** Classroom Top Bar � matches the Klassruum reference:
 *  brand � breadcrumb  |  Live � AI Teacher � clock � progress  |  Mode � Notes � Transcript � End */
function ClassroomTopBar({
  institution,
  course,
  subject,
  title,
  progress,
  clock,
  learningMode,
  onBack,
  onOpenSettings,
  onOpenNotes,
  onOpenTranscript,
  onEndLesson,
}: {
  institution: string;
  course: string;
  subject: string;
  title: string;
  progress: number;
  phase: TeachingPhase;
  equation: string;
  courseType: CourseType;
  clock: string;
  learningMode: LearningMode;
  onBack?: () => void;
  onOpenSettings: () => void;
  onOpenNotes: () => void;
  onOpenTranscript: () => void;
  onEndLesson: () => void;
}) {
  const modeLabel = LEARNING_MODES.find((m) => m.value === learningMode)?.label ?? "Standard";

  return (
    <div className="vc-top-bar">
      {/* Left � brand + breadcrumb */}
      <div className="vc-top-bar-left">
        {onBack ? (
          <button type="button" className="vc-back-btn" onClick={onBack} title="Go back">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
        ) : null}
        <Link to="/" className="vc-top-bar-brand" title="Klassruum home">
          <Logo size={34} variant="dark" />
        </Link>

        <div className="vc-top-bar-breadcrumb">
          <span>{institution}</span>
          <span className="vc-top-bar-separator">�</span>
          <span>{course}</span>
          <span className="vc-top-bar-separator">�</span>
          <span className="vc-top-bar-crumb-active">{subject || title}</span>
        </div>
      </div>

      {/* Center � live status, clock, progress */}
      <div className="vc-top-bar-center">
        <span className="vc-live-pill">
          <span className="vc-live-dot" />
          Live Lesson
        </span>
        <span className="vc-clock" title="Time in this lesson">
          {clock}
        </span>
        <div className="vc-top-bar-progress-wrap">
          <div className="vc-top-bar-progress-bar">
            <div className="vc-top-bar-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="vc-top-bar-progress-text">{progress}%</span>
        </div>
      </div>

      {/* Right � learning mode, notes, transcript, end */}
      <div className="vc-top-bar-right">
        <button
          className="vc-top-pill-btn vc-top-pill-mode"
          onClick={onOpenSettings}
          title="Learning mode & access"
        >
          <span className="vc-top-pill-label">Learning Mode</span>
          <span className="vc-top-pill-value">{modeLabel}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <button className="vc-top-pill-btn" onClick={onOpenNotes} title="Lesson notes">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Notes
        </button>
        <button className="vc-top-pill-btn" onClick={onOpenTranscript} title="Lesson transcript">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="4" width="18" height="14" rx="2" />
            <line x1="7" y1="9" x2="17" y2="9" />
            <line x1="7" y1="13" x2="13" y2="13" />
          </svg>
          Transcript
        </button>
        <button className="vc-top-end-btn" onClick={onEndLesson} title="End this lesson">
          End Lesson
        </button>
      </div>
    </div>
  );
}

/**
 * CourseOutline � the left-sidebar course navigation.
 *
 * Three collapsible levels: Course ? Lesson ? Sections. The learner's
 * registered course and the active lesson expand by default; the section list
 * is an auto-advancing progress outline (the lesson teaches itself through to
 * the end). Completed sections can be revisited; the learner never has to push
 * the lesson forward section by section.
 */
function CourseOutline({
  course,
  lessonTitle,
  sections,
  currentSection,
  canRevisit,
  onRevisit,
  compact = false,
}: {
  course: string;
  lessonTitle: string;
  sections: typeof LESSON_PLAN_SECTIONS;
  currentSection: LessonSectionKey;
  canRevisit: (key: LessonSectionKey) => boolean;
  onRevisit: (key: LessonSectionKey) => void;
  compact?: boolean;
}) {
  const [courseOpen, setCourseOpen] = useState(true);
  const [lessonOpen, setLessonOpen] = useState(true);
  const currentIdx = sections.findIndex((s) => s.key === currentSection);
  const doneCount = Math.max(0, currentIdx);
  const visibleSections = compact
    ? sections.filter((sec, idx) => {
        const current = sec.key === currentSection;
        const completed = idx < currentIdx;
        const next = idx === currentIdx + 1;
        return completed || current || next;
      })
    : sections;

  return (
    <nav
      className={`vc-outline ${compact ? "vc-outline-compact" : ""}`}
      aria-label="Course contents"
    >
      <div className="vc-outline-title">My Course</div>

      {/* Level 1 � Course */}
      <button
        type="button"
        className={`vc-outline-course ${courseOpen ? "is-open" : ""}`}
        onClick={() => setCourseOpen((v) => !v)}
        aria-expanded={courseOpen}
      >
        <svg
          className="vc-outline-chev"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
        >
          <polyline points="9 6 15 12 9 18" />
        </svg>
        <svg
          className="vc-outline-ico"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        <span className="vc-outline-course-name">{course}</span>
      </button>

      {courseOpen && (
        <div className="vc-outline-lessons">
          {/* Level 2 � Lesson (the one being taught now) */}
          <button
            type="button"
            className={`vc-outline-lesson ${lessonOpen ? "is-open" : ""} is-current`}
            onClick={() => setLessonOpen((v) => !v)}
            aria-expanded={lessonOpen}
          >
            <svg
              className="vc-outline-chev"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
            >
              <polyline points="9 6 15 12 9 18" />
            </svg>
            <span className="vc-outline-lesson-name">{lessonTitle}</span>
            <span className="vc-outline-lesson-count">
              {doneCount}/{sections.length}
            </span>
          </button>

          {lessonOpen && (
            <ol className="vc-outline-sections">
              {/* Level 3 � Sections (auto-advancing outline) */}
              {visibleSections.map((sec) => {
                const sectionIdx = sections.findIndex((s) => s.key === sec.key);
                const completed = sectionIdx < currentIdx;
                const current = sec.key === currentSection;
                const revisitable = completed && canRevisit(sec.key);
                return (
                  <li key={sec.key}>
                    <button
                      type="button"
                      className={`vc-outline-section ${completed ? "is-done" : ""} ${current ? "is-current" : ""}`}
                      disabled={!revisitable}
                      onClick={() => revisitable && onRevisit(sec.key)}
                      title={
                        revisitable
                          ? `Revisit ${sec.label}`
                          : current
                            ? "Now teaching"
                            : "Coming up"
                      }
                    >
                      <span className="vc-outline-mark" aria-hidden>
                        {completed ? (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : current ? (
                          <span className="vc-outline-playing" />
                        ) : (
                          <span className="vc-outline-pending" />
                        )}
                      </span>
                      <span className="vc-outline-section-name">{sec.label}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      )}
    </nav>
  );
}

/**
 * SettingsPanel � the learner's control room.
 *
 * Big, clearly-labelled, plain-language controls so it works for a grade-one
 * child as much as a tertiary student: reading size, contrast, motion, the
 * teacher's voice (on/off + speed), captions (on/off + size) and an
 * accessibility profile. Everything applies live.
 */
function SettingsPanel({
  onClose,
  a11y,
  setA11y,
  narrationOn,
  setNarrationOn,
  voiceSpeed,
  setVoiceSpeed,
  captionsOn,
  setCaptionsOn,
  captionSize,
  setCaptionSize,
  learningMode,
  setLearningMode,
}: {
  onClose: () => void;
  a11y: AccessibilityPrefs;
  setA11y: React.Dispatch<React.SetStateAction<AccessibilityPrefs>>;
  narrationOn: boolean;
  setNarrationOn: (v: boolean) => void;
  voiceSpeed: "slow" | "normal" | "fast";
  setVoiceSpeed: (v: "slow" | "normal" | "fast") => void;
  captionsOn: boolean;
  setCaptionsOn: (v: boolean) => void;
  captionSize: "sm" | "md" | "lg";
  setCaptionSize: (v: "sm" | "md" | "lg") => void;
  learningMode: LearningMode;
  setLearningMode: (m: LearningMode) => void;
}) {
  const textScales: { value: TextScale; label: string; sample: string }[] = [
    { value: "default", label: "Normal", sample: "A" },
    { value: "large", label: "Large", sample: "A" },
    { value: "xlarge", label: "Largest", sample: "A" },
  ];
  const speeds: { value: "slow" | "normal" | "fast"; label: string }[] = [
    { value: "slow", label: "Slow" },
    { value: "normal", label: "Normal" },
    { value: "fast", label: "Fast" },
  ];
  const capSizes: { value: "sm" | "md" | "lg"; label: string }[] = [
    { value: "sm", label: "Small" },
    { value: "md", label: "Medium" },
    { value: "lg", label: "Large" },
  ];

  return (
    <div className="vc-settings-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="vc-settings" role="dialog" aria-label="Lesson settings">
        <div className="vc-settings-head">
          <div>
            <h2 className="vc-settings-title">Settings</h2>
            <p className="vc-settings-sub">
              Make the lesson comfortable for you. Changes apply right away.
            </p>
          </div>
          <button className="vc-settings-close" onClick={onClose} aria-label="Close settings">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="vc-settings-body">
          {/* Reading & display */}
          <section className="vc-set-group">
            <h3 className="vc-set-group-title">?? Reading &amp; Display</h3>

            <div className="vc-set-row">
              <span className="vc-set-label">Text size</span>
              <div className="vc-seg">
                {textScales.map((t) => (
                  <button
                    key={t.value}
                    className={`vc-seg-btn ${a11y.textScale === t.value ? "is-on" : ""}`}
                    onClick={() => setA11y((p) => ({ ...p, textScale: t.value }))}
                  >
                    <span
                      style={{
                        fontSize:
                          t.value === "default"
                            ? "0.9rem"
                            : t.value === "large"
                              ? "1.1rem"
                              : "1.3rem",
                        fontWeight: 800,
                      }}
                    >
                      {t.sample}
                    </span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="vc-set-row">
              <span className="vc-set-label">High contrast</span>
              <Toggle
                on={a11y.highContrast}
                onChange={(v) => setA11y((p) => ({ ...p, highContrast: v }))}
              />
            </div>

            <div className="vc-set-row">
              <span className="vc-set-label">Reduce motion</span>
              <Toggle
                on={a11y.reducedMotion}
                onChange={(v) => setA11y((p) => ({ ...p, reducedMotion: v }))}
              />
            </div>
          </section>

          {/* Sound & voice */}
          <section className="vc-set-group">
            <h3 className="vc-set-group-title">?? Sound &amp; Voice</h3>

            <div className="vc-set-row">
              <span className="vc-set-label">Teacher's voice</span>
              <Toggle on={narrationOn} onChange={setNarrationOn} />
            </div>

            <div className="vc-set-row">
              <span className="vc-set-label">Voice speed</span>
              <div className="vc-seg">
                {speeds.map((s) => (
                  <button
                    key={s.value}
                    className={`vc-seg-btn ${voiceSpeed === s.value ? "is-on" : ""}`}
                    disabled={!narrationOn}
                    onClick={() => setVoiceSpeed(s.value)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Captions */}
          <section className="vc-set-group">
            <h3 className="vc-set-group-title">?? Captions</h3>

            <div className="vc-set-row">
              <span className="vc-set-label">Show captions</span>
              <Toggle
                on={captionsOn || learningMode === "deaf"}
                disabled={learningMode === "deaf"}
                onChange={setCaptionsOn}
              />
            </div>

            <div className="vc-set-row">
              <span className="vc-set-label">Caption size</span>
              <div className="vc-seg">
                {capSizes.map((c) => (
                  <button
                    key={c.value}
                    className={`vc-seg-btn ${captionSize === c.value ? "is-on" : ""}`}
                    onClick={() => setCaptionSize(c.value)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Accessibility profile */}
          <section className="vc-set-group vc-mode-selector-group">
            <h3 className="vc-set-group-title">? Learning Mode</h3>
            <p className="vc-set-hint">
              Pick the classroom setup that fits this lesson. We'll adjust the teacher, captions,
              pacing, and controls right away.
            </p>
            <div className="vc-profile-grid">
              {LEARNING_MODES.map((m) => {
                const selected = learningMode === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    aria-pressed={selected}
                    className={`vc-profile-card ${selected ? "is-on" : ""}`}
                    onClick={() => setLearningMode(m.value)}
                  >
                    <span className="vc-profile-ico" aria-hidden="true">
                      {m.icon}
                    </span>
                    <span className="vc-profile-copy">
                      <span className="vc-profile-label">{m.label}</span>
                      <span className="vc-profile-desc">{m.description}</span>
                    </span>
                    {selected && <span className="vc-profile-status">Selected</span>}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="vc-settings-foot">
          <button className="vc-settings-done" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/** A large, clearly-on/off toggle switch (accessible, keyboard-operable). */
function Toggle({
  on,
  onChange,
  disabled,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      className={`vc-toggle ${on ? "is-on" : ""}`}
      onClick={() => onChange(!on)}
    >
      <span className="vc-toggle-knob" />
      <span className="vc-toggle-text">{on ? "On" : "Off"}</span>
    </button>
  );
}

/**
 * Subject-aware right rail � present for every subject. The classroom decides
 * its content automatically:
 *   � demo mathematics lesson ? a live graph + the worked strategy
 *   � science / technical      ? an illustration slot + live key points
 *   � theory / everything else ? live key points and a running summary
 * For real (non-demo) lessons the points are built from what the teacher has
 * actually written on the board, so the rail always reflects the current lesson.
 */
function LearningDrawer({
  activeTab,
  onTabChange,
  notes,
  transcript,
  progress,
  currentSectionLabel,
  results,
  courseType,
  isDemo,
  keyPoints,
  lessonTitle,
  currentGoal,
  activeVisual,
  visualPlan,
  onAskQuestion,
  onDownloadNotes,
}: {
  activeTab: LearningDrawerTab;
  onTabChange: (tab: LearningDrawerTab) => void;
  notes: string;
  transcript: TranscriptEntry[];
  progress: number;
  currentSectionLabel: string;
  results: LearningResults;
  courseType: CourseType;
  isDemo: boolean;
  keyPoints: string[];
  lessonTitle: string;
  currentGoal?: string;
  activeVisual: ClassroomVisualAsset | null;
  visualPlan: ClassroomVisualAsset[];
  onAskQuestion: () => void;
  onDownloadNotes: () => void;
}) {
  const tabs: { id: LearningDrawerTab; label: string }[] = [
    { id: "notes", label: "Notes" },
    { id: "transcript", label: "Transcript" },
    { id: "progress", label: "Progress" },
    { id: "resources", label: "Resources" },
    { id: "questions", label: "Questions" },
  ];

  return (
    <aside className="vc-learning-drawer" aria-label="Learning drawer">
      <div className="vc-learning-drawer-tabs" role="tablist" aria-label="Learning support tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`vc-learning-tab ${activeTab === tab.id ? "is-active" : ""}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="vc-learning-drawer-body">
        {activeTab === "notes" && (
          <section className="vc-learning-panel" aria-label="Lesson notes">
            <div className="vc-learning-panel-head">
              <div>
                <p className="vc-learning-eyebrow">Saved lesson notes</p>
                <h3 className="vc-learning-title">Organized notes</h3>
              </div>
              <button className="vc-learning-action" onClick={onDownloadNotes}>
                Download
              </button>
            </div>
            <article className="vc-note-block vc-continuous-notes">
              {notes
                .split("\n")
                .filter(Boolean)
                .slice(0, 12)
                .map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
            </article>
          </section>
        )}

        {activeTab === "transcript" && (
          <section className="vc-learning-panel" aria-label="Lesson transcript">
            <div className="vc-learning-panel-head">
              <div>
                <p className="vc-learning-eyebrow">Live record</p>
                <h3 className="vc-learning-title">Transcript</h3>
              </div>
              <span className="vc-learning-count">{transcript.length}</span>
            </div>
            <article className="vc-transcript-list vc-continuous-transcript">
              {transcript.length === 0 ? (
                <p className="vc-learning-empty">
                  Teacher, board, and learner turns will appear here as the lesson runs.
                </p>
              ) : (
                transcript.slice(-14).map((entry) => (
                  <p key={entry.id} className={`vc-transcript-line role-${entry.role}`}>
                    <span className="vc-transcript-role">{entry.role}</span>
                    <span>{entry.text}</span>
                  </p>
                ))
              )}
            </article>
          </section>
        )}

        {activeTab === "progress" && (
          <section className="vc-learning-panel" aria-label="Lesson progress">
            <div className="vc-learning-panel-head">
              <div>
                <p className="vc-learning-eyebrow">Learning journey</p>
                <h3 className="vc-learning-title">{currentSectionLabel}</h3>
              </div>
              <span className="vc-learning-count">{progress}%</span>
            </div>
            <div className="vc-drawer-progress">
              <div className="vc-drawer-progress-track">
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="vc-progress-grid">
              <div>
                <strong>{results.questionsAsked}</strong>
                <span>Questions</span>
              </div>
              <div>
                <strong>{results.raisedHands}</strong>
                <span>Hands</span>
              </div>
              <div>
                <strong>{results.practiceAttempts}</strong>
                <span>Practice</span>
              </div>
              <div>
                <strong>{results.hintsUsed}</strong>
                <span>Hints</span>
              </div>
            </div>
          </section>
        )}

        {activeTab === "resources" && (
          <section className="vc-learning-panel" aria-label="Lesson resources">
            <SubjectVisual
              courseType={courseType}
              isDemo={isDemo}
              keyPoints={keyPoints}
              lessonTitle={lessonTitle}
              currentGoal={currentGoal}
              activeVisual={activeVisual}
              visualPlan={visualPlan}
            />
          </section>
        )}

        {activeTab === "questions" && (
          <section className="vc-learning-panel" aria-label="Questions">
            <div className="vc-learning-panel-head">
              <div>
                <p className="vc-learning-eyebrow">Ask anytime</p>
                <h3 className="vc-learning-title">Questions</h3>
              </div>
              <button className="vc-learning-action" onClick={onAskQuestion}>
                Ask
              </button>
            </div>
            <div className="vc-question-history">
              {transcript.filter((entry) => entry.role === "student").length === 0 ? (
                <p className="vc-learning-empty">
                  Your questions will be saved here with the teacher's answers.
                </p>
              ) : (
                transcript
                  .filter((entry) => entry.role === "student")
                  .slice(-8)
                  .map((entry) => (
                    <article key={entry.id} className="vc-question-card-inline">
                      <p>{entry.text}</p>
                    </article>
                  ))
              )}
            </div>
          </section>
        )}
      </div>
    </aside>
  );
}

function SubjectVisual({
  courseType,
  isDemo,
  keyPoints,
  lessonTitle,
  currentGoal,
  activeVisual,
  visualPlan,
}: {
  courseType: CourseType;
  isDemo: boolean;
  keyPoints: string[];
  lessonTitle: string;
  currentGoal?: string;
  activeVisual: ClassroomVisualAsset | null;
  visualPlan: ClassroomVisualAsset[];
}) {
  const meta = COURSE_TYPE_META[courseType];

  // -- Demo mathematics lesson: the original graph + worked strategy ----------
  if (isDemo && courseType === "mathematics") {
    return (
      <aside className="vc-subject-visual">
        <div className="vc-visual-header">
          <span className="vc-visual-icon">{meta.icon}</span>
          {meta.visualTitle}
        </div>
        <MathGraph />
        <div className="vc-visual-note">
          <span className="vc-visual-note-label">Strategy</span>
          Two numbers that <strong>multiply to 6</strong> and <strong>add to 5</strong>:
          <div className="vc-visual-chips">
            <span>2 x 3 = 6</span>
            <span>2 + 3 = 5</span>
          </div>
          <div className="vc-visual-solution">Solution: x = -2 or x = -3</div>
        </div>
      </aside>
    );
  }

  // -- Every other lesson: illustration slot (science/technical) + live points -
  const showIllustration = courseType === "science" || courseType === "technical";
  return (
    <aside className="vc-subject-visual">
      <div className="vc-visual-header">
        <span className="vc-visual-icon">{meta.icon}</span>
        {showIllustration ? "Illustration & Key Points" : "Key Points"}
      </div>

      {activeVisual && (
        <div className="vc-active-visual-section" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span className="vc-visual-note-label">
            {activeVisual.kind.replace(/_/g, " ")} / {activeVisual.source.replace(/_/g, " ")}
          </span>
          
          {activeVisual.imageUrl ? (
            <div className="vc-visual-frame">
              <div className="vc-visual-browser-bar">
                <span className="vc-browser-dot dot-red"></span>
                <span className="vc-browser-dot dot-yellow"></span>
                <span className="vc-browser-dot dot-green"></span>
                <span className="vc-browser-title">{activeVisual.title}</span>
              </div>
              <div className="vc-visual-image-wrapper">
                <img
                  src={activeVisual.imageUrl}
                  alt={activeVisual.alt}
                  className="vc-visual-image"
                />
              </div>
            </div>
          ) : (
            <div className="vc-visual-fallback-container">
              {activeVisual.kind === "formula" ? (
                <div className="vc-visual-formula-card">
                  {activeVisual.alt || "y = mx + c"}
                </div>
              ) : activeVisual.kind === "table" ? (
                <table className="vc-visual-table-card">
                  <thead>
                    <tr>
                      <th>Focus Area</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeVisual.labels ? (
                      activeVisual.labels.map((label, idx) => (
                        <tr key={idx}>
                          <td><strong>{label}</strong></td>
                          <td>Reference point description</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td><strong>{activeVisual.title}</strong></td>
                        <td>{activeVisual.alt}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <div className="vc-visual-fallback-box">
                  <span className="vc-visual-fallback-icon">
                    {activeVisual.kind === "screenshot" ? "Image" : activeVisual.kind === "chart" ? "Chart" : "Visual"}
                  </span>
                  <div className="vc-visual-fallback-title">{activeVisual.title}</div>
                  <div className="vc-visual-fallback-desc">{activeVisual.description}</div>
                </div>
              )}
            </div>
          )}

          <div className="vc-visual-cue-box">
            <span className="vc-visual-cue-icon">Teacher Focus Cue</span>
            <p>{activeVisual.teacherCue}</p>
          </div>

          <p className="vc-visual-description">{activeVisual.description}</p>

          {activeVisual.labels && activeVisual.labels.length > 0 && (
            <div className="vc-visual-labels">
              {activeVisual.labels.map((label) => (
                <span key={label} className="vc-visual-label-chip">
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {!activeVisual && showIllustration && (
        <div className="vc-visual-illustration">
          <img
            src="/images/scenes/scene-1.png"
            alt={`Illustration for ${lessonTitle}`}
            onError={(e) => {
              const el = e.currentTarget.parentElement;
              if (el) el.style.display = "none";
            }}
          />
          <p>Illustration attached from the course materials for this step.</p>
        </div>
      )}

      {!!visualPlan.length && (
        <div className="vc-visual-note" style={{ marginTop: 12 }}>
          <span className="vc-visual-note-label">Lesson visual plan</span>
          <div className="vc-visual-point-list">
            {visualPlan.slice(0, 4).map((visual) => (
              <li key={visual.id}>
                <strong>{visual.title}:</strong> {visual.teacherCue}
              </li>
            ))}
          </div>
        </div>
      )}

      <div className="vc-visual-points">
        <span className="vc-visual-note-label">On the board so far</span>
        {keyPoints.length > 0 ? (
          <ul className="vc-visual-point-list">
            {keyPoints.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        ) : (
          <p className="vc-visual-points-empty">
            {currentGoal ?? "Key points will appear here as the teacher writes."}
          </p>
        )}
      </div>
    </aside>
  );
}

/** Live parabola for y = x� + 5x + 6, with its roots highlighted. */
function MathGraph() {
  const W = 240,
    H = 170,
    padL = 24,
    padR = 16,
    padT = 12,
    padB = 22;
  const xMin = -5,
    xMax = 0,
    yMin = -1,
    yMax = 6;
  const sx = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * (W - padL - padR);
  const sy = (y: number) => H - padB - ((y - yMin) / (yMax - yMin)) * (H - padT - padB);

  let d = "";
  for (let x = xMin; x <= xMax + 0.001; x += 0.25) {
    const y = x * x + 5 * x + 6;
    d += `${d ? "L" : "M"}${sx(x).toFixed(1)} ${sy(y).toFixed(1)} `;
  }

  return (
    <svg
      className="vc-math-graph"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Graph of y equals x squared plus 5 x plus 6, crossing the x-axis at minus 2 and minus 3"
    >
      {/* grid */}
      {[-4, -3, -2, -1].map((x) => (
        <line
          key={`gx${x}`}
          x1={sx(x)}
          y1={padT}
          x2={sx(x)}
          y2={H - padB}
          className="vc-graph-grid"
        />
      ))}
      {[0, 2, 4].map((y) => (
        <line
          key={`gy${y}`}
          x1={padL}
          y1={sy(y)}
          x2={W - padR}
          y2={sy(y)}
          className="vc-graph-grid"
        />
      ))}
      {/* axes */}
      <line x1={padL} y1={sy(0)} x2={W - padR} y2={sy(0)} className="vc-graph-axis" />
      <line x1={sx(0)} y1={padT} x2={sx(0)} y2={H - padB} className="vc-graph-axis" />
      {/* curve */}
      <path d={d} className="vc-graph-curve" fill="none" />
      {/* roots */}
      <circle cx={sx(-2)} cy={sy(0)} r="4" className="vc-graph-root" />
      <circle cx={sx(-3)} cy={sy(0)} r="4" className="vc-graph-root" />
      <text x={sx(-2)} y={sy(0) + 16} className="vc-graph-label" textAnchor="middle">
        -2
      </text>
      <text x={sx(-3)} y={sy(0) + 16} className="vc-graph-label" textAnchor="middle">
        -3
      </text>
    </svg>
  );
}

/** A realistic marker pen that sits at the end of the line being written. */
function MarkerPen() {
  return (
    <svg
      className="vc-hand-cursor"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Writing tip (touching the board, bottom-left) */}
      <path d="M14 50 L19 45 L23 49 L18 54 Z" fill="#7D2233" />
      {/* Nib holder */}
      <path d="M18 46 L24 40 L29 45 L23 51 Z" fill="var(--muted)" />
      {/* Barrel of the marker */}
      <rect
        x="24"
        y="14"
        width="14"
        height="30"
        rx="3"
        transform="rotate(45 31 29)"
        fill="#7D2233"
      />
      <rect
        x="27"
        y="16"
        width="5"
        height="26"
        rx="2.5"
        transform="rotate(45 31 29)"
        fill="var(--crimson-dark)"
        opacity="0.7"
      />
      {/* Cap end */}
      <path d="M44 14 L52 6 L58 12 L50 20 Z" fill="var(--crimson-dark)" />
      {/* Highlight along the barrel */}
      <rect
        x="26"
        y="15"
        width="2"
        height="26"
        rx="1"
        transform="rotate(45 31 29)"
        fill="var(--crimson-soft)"
        opacity="0.8"
      />
    </svg>
  );
}

/** Board Line � the written item PLUS everything the teacher says about it,
 *  typed permanently beneath it so deaf learners and readers get the full lesson
 *  in clean, flowing notes (not chat-style messages).
 *
 *  � technical / calculation / math / science ? the item is a short heading and
 *    the spoken explanation is written as a small subtitle caption under it.
 *  � theory / social ? the spoken explanation is written as a flowing paragraph,
 *    the way notes appear in the course content.
 */
function BoardLine({
  item,
  lineIndex,
  isActive,
  courseType,
  speechLines,
  highlighted,
  selected,
  annotation,
  onClick,
  onAnnotationSave,
}: {
  item: MathTeachingItem;
  lineIndex: number;
  isActive: boolean;
  courseType: CourseType;
  speechLines: BoardSpeechLine[];
  highlighted?: boolean;
  selected?: boolean;
  annotation?: string;
  onClick?: () => void;
  onAnnotationSave?: (text: string) => void;
}) {
  const typeClass =
    item.type === "equation"
      ? "vc-board-line-equation"
      : item.type === "calculation"
        ? "vc-board-line-calculation"
        : item.type === "answer"
          ? "vc-board-line-answer"
          : item.type === "question" || item.type === "concept"
            ? "vc-board-line-question"
            : item.type === "instruction"
              ? "vc-board-line-instruction"
              : "";

  const isTheory = courseType === "social";
  const mistake = "";
  const [localAnnotation, setLocalAnnotation] = useState(annotation ?? "");
  const [showAnnotationInput, setShowAnnotationInput] = useState(false);

  return (
    <div
      className={`vc-board-line ${typeClass} ${isActive ? "vc-board-line-active" : ""} ${highlighted ? "vc-board-line-highlighted" : ""} ${selected ? "vc-board-line-selected" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <span className="vc-board-line-number">{lineIndex}</span>
      <div className="vc-board-line-body">
        <span className="vc-board-line-text">{item.boardText}</span>
        {speechLines.map((line) => (
          <div
            key={line.id}
            className={`vc-board-note vc-board-note-hand vc-board-note-${line.tone} ${
              isTheory ? "vc-board-note-paragraph" : "vc-board-note-caption"
            }`}
          >
            {line.text}
          </div>
        ))}
        {mistake && (
          <div className="vc-board-note vc-board-note-mistake">
            <span className="vc-board-note-mistake-label">Watch out:</span> {mistake}
          </div>
        )}
        {/* User annotation */}
        {annotation && !showAnnotationInput && (
          <div
            className="vc-board-note vc-board-note-annotation"
            onClick={(e) => {
              e.stopPropagation();
              setShowAnnotationInput(true);
            }}
          >
            ?? {annotation}
          </div>
        )}
        {showAnnotationInput && (
          <div className="vc-board-annotation-input-wrap">
            <input
              className="vc-board-annotation-input"
              value={localAnnotation}
              onChange={(e) => setLocalAnnotation(e.target.value)}
              placeholder="Add a note..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onAnnotationSave?.(localAnnotation);
                  setShowAnnotationInput(false);
                }
                if (e.key === "Escape") setShowAnnotationInput(false);
              }}
              onBlur={() => {
                if (localAnnotation.trim()) onAnnotationSave?.(localAnnotation);
                setShowAnnotationInput(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/** Generic Drawer */
function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <>
      <div
        className={`vc-drawer-overlay ${open ? "vc-drawer-overlay-open" : ""}`}
        onClick={onClose}
      />
      <div className={`vc-drawer ${open ? "vc-drawer-open" : ""}`}>
        <div className="vc-drawer-header">
          <span className="vc-drawer-title">{title}</span>
          <button className="vc-drawer-close" onClick={onClose}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </>
  );
}

/** Mode-adaptive Question Panel � slides in from the right so the whiteboard
 *  stays fully visible while the learner formulates their question. */
function QuestionModal({
  learningMode,
  questionText,
  setQuestionText,
  isListening,
  onToggleMic,
  onSubmit,
  onClose,
  onQuickAction,
  clarify,
}: {
  learningMode: LearningMode;
  questionText: string;
  setQuestionText: (v: string) => void;
  isListening: boolean;
  onToggleMic: () => void;
  onSubmit: () => void;
  onClose: () => void;
  onQuickAction: (action: string) => void;
  /** When set, the teacher is asking the learner to clarify a vague question. */
  clarify?: { question: string; original: string; options: string[] } | null;
}) {
  // -- Blind mode: 45-second auto-mic countdown ----------------------------
  // If the learner has not recorded any speech, the mic activates automatically.
  const [blindCountdown, setBlindCountdown] = useState(45);
  const blindTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const blindAutoMicFiredRef = useRef(false);

  useEffect(() => {
    if (learningMode !== "blind") return;
    // Start countdown
    blindTimerRef.current = setInterval(() => {
      setBlindCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(blindTimerRef.current!);
          blindTimerRef.current = null;
          // Auto-activate mic if not already listening and no question typed
          if (!blindAutoMicFiredRef.current && !isListening) {
            blindAutoMicFiredRef.current = true;
            onToggleMic();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (blindTimerRef.current) clearInterval(blindTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [learningMode]);

  // Cancel countdown once listening starts (speech recorded)
  useEffect(() => {
    if (isListening && blindTimerRef.current) {
      clearInterval(blindTimerRef.current);
      blindTimerRef.current = null;
    }
  }, [isListening]);

  /**
   * Clarification banner � shown above any mode's question UI when the teacher
   * has asked the learner to narrow down a vague question.
   */
  const clarifyBanner = clarify ? (
    <div className="vc-clarify-banner">
      <div className="vc-clarify-title">?? {clarify.question}</div>
      {clarify.options.length > 0 && (
        <div className="vc-clarify-options">
          {clarify.options.map((opt) => (
            <button
              key={opt}
              className="vc-clarify-option"
              onClick={() => {
                if (/type my question/i.test(opt)) {
                  setQuestionText("");
                } else {
                  setQuestionText(opt);
                  onSubmit();
                }
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  ) : null;

  // -- Shared slide-in panel wrapper ---------------------------------------
  // The backdrop is semi-transparent and only covers the non-board area.
  // Clicking outside the panel closes it.
  const PanelWrapper = ({ children }: { children: ReactNode }) => (
    <div className="vc-question-panel-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="vc-question-panel" role="dialog" aria-label="Ask your teacher a question">
        {/* Close button */}
        <button className="vc-question-panel-close" onClick={onClose} aria-label="Close question panel">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );

  // Deaf mode: text-only with extra options
  if (learningMode === "deaf") {
    return (
      <PanelWrapper>
        <div className="vc-question-badge">Deaf Mode</div>
        <div className="vc-question-title">Any question?</div>
        {clarifyBanner}
        <textarea
          className="vc-question-input"
          rows={4}
          placeholder="Type your question..."
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          autoFocus
        />
        <button
          className="vc-question-submit-btn"
          onClick={onSubmit}
          aria-label="Submit your question to the teacher"
          disabled={!questionText.trim()}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          Submit Question
        </button>
        <div className="vc-question-actions" style={{ marginTop: 8 }}>
          <button
            className="vc-question-action vc-question-action-secondary"
            onClick={() => onQuickAction("No question")}
          >
            No Question
          </button>
          <button
            className="vc-question-action vc-question-action-secondary"
            onClick={() => onQuickAction("Repeat")}
          >
            Repeat Board Step
          </button>
          <button
            className="vc-question-action vc-question-action-secondary"
            onClick={() => onQuickAction("Explain simpler")}
          >
            Simpler Explanation
          </button>
        </div>
      </PanelWrapper>
    );
  }

  // Blind mode: voice-first with auto-mic countdown
  if (learningMode === "blind") {
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const progress = blindCountdown / 45;
    const dashOffset = circumference * (1 - progress);

    return (
      <PanelWrapper>
        <div className="vc-question-badge">Blind Mode - Voice First</div>
        <div className="vc-question-title">Ask your question verbally</div>
        <p style={{ color: "#A89890", fontSize: "0.85rem", margin: "0 0 16px", lineHeight: 1.5 }}>
          Speak your question or say <strong style={{ color: "#E7DAD1" }}>"no question"</strong> to continue the lesson.
        </p>

        {/* Countdown ring - shows how long until mic auto-activates */}
        {!isListening && blindCountdown > 0 && (
          <div className="vc-blind-countdown">
            <svg width="56" height="56" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r={radius} fill="none" stroke="rgba(154, 50, 71,0.2)" strokeWidth="4" />
              <circle
                cx="28"
                cy="28"
                r={radius}
                fill="none"
                stroke={blindCountdown <= 10 ? "#f87171" : "#9A3247"}
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                style={{ transform: "rotate(-90deg)", transformOrigin: "28px 28px", transition: "stroke-dashoffset 1s linear" }}
              />
              <text x="28" y="33" textAnchor="middle" fill={blindCountdown <= 10 ? "#f87171" : "#D9798A"} fontSize="14" fontWeight="700">
                {blindCountdown}s
              </text>
            </svg>
            <p className="vc-blind-countdown-label">
              {blindCountdown <= 10
                ? "Mic activating soon..."
                : `Mic auto-activates in ${blindCountdown}s`}
            </p>
          </div>
        )}

        <div className="vc-mic-active" style={{ marginTop: 12 }}>
          <button
            className="vc-mic-pulse"
            onClick={onToggleMic}
            aria-label={isListening ? "Stop listening" : "Start listening"}
            style={{ background: isListening ? "#16a34a" : "#7D2233" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </button>
          <span className="vc-mic-text" style={{ color: isListening ? "#4ade80" : "#D9798A" }}>
            {isListening ? "Listening... speak now" : "Click to start listening"}
          </span>
        </div>

        {/* Show transcribed text if any */}
        {questionText && (
          <div style={{ marginTop: 12, padding: "10px 12px", background: "rgba(154, 50, 71,0.1)", borderRadius: 8, color: "#E7DAD1", fontSize: "0.875rem" }}>
            <span style={{ color: "#D9798A", fontWeight: 600, fontSize: "0.7rem", textTransform: "uppercase" }}>Heard: </span>
            {questionText}
          </div>
        )}

        {questionText && (
          <button
            className="vc-question-submit-btn"
            onClick={onSubmit}
            aria-label="Submit your spoken question"
            style={{ marginTop: 12 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            Submit Question
          </button>
        )}

        <div className="vc-question-actions" style={{ marginTop: 16 }}>
          <button
            className="vc-question-action vc-question-action-secondary"
            onClick={() => onQuickAction("No question")}
          >
            No Question (Continue)
          </button>
          <button
            className="vc-question-action vc-question-action-secondary"
            onClick={() => onQuickAction("Repeat")}
          >
            Repeat
          </button>
        </div>
      </PanelWrapper>
    );
  }

  // ADHD Focus mode: minimal, only essential options
  if (learningMode === "adhd_focus") {
    return (
      <PanelWrapper>
        <div className="vc-question-badge">Focus Mode</div>
        <div className="vc-question-title">Quick Question?</div>
        <div className="vc-question-quick-actions" style={{ flexDirection: "column" }}>
          {["I don't understand", "Repeat", "Explain simpler", "Continue"].map((action) => (
            <button
              key={action}
              className="vc-question-quick-btn"
              style={{ width: "100%", textAlign: "left", padding: "12px 16px", fontSize: "0.9rem" }}
              onClick={() => onQuickAction(action)}
            >
              {action}
            </button>
          ))}
        </div>
      </PanelWrapper>
    );
  }

  // Speech difficulty mode: text-only with specific actions
  if (learningMode === "speech_difficulty") {
    return (
      <PanelWrapper>
        <div className="vc-question-badge">Speech Difficulty</div>
        <div className="vc-question-title">Type your question</div>
        <textarea
          className="vc-question-input"
          rows={3}
          placeholder="Type your question..."
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          autoFocus
        />
        <button
          className="vc-question-submit-btn"
          onClick={onSubmit}
          aria-label="Submit your written question"
          disabled={!questionText.trim()}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          Submit Question
        </button>
        <div className="vc-question-quick-actions" style={{ marginTop: 12 }}>
          {["No Question", "Repeat", "Explain simpler", "Give example", "Continue"].map(
            (action) => (
              <button
                key={action}
                className="vc-question-quick-btn"
                onClick={() => onQuickAction(action)}
              >
                {action}
              </button>
            ),
          )}
        </div>
      </PanelWrapper>
    );
  }

  // Standard mode: full question UI
  return (
    <PanelWrapper>
      <div className="vc-question-badge">Ask Your Teacher</div>
      <div className="vc-question-title">
        {clarify ? "Help me understand" : "What is your question?"}
      </div>
      {clarifyBanner}
      <textarea
        className="vc-question-input"
        rows={3}
        placeholder="Ask your teacher... (press Enter to send)"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSubmit()}
        autoFocus
      />

      {/* Large, prominent submit button */}
      <button
        className="vc-question-submit-btn"
        onClick={onSubmit}
        aria-label="Submit your question to the teacher"
        disabled={!questionText.trim()}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
        Submit Question
      </button>

      {/* Secondary actions row */}
      <div className="vc-question-actions" style={{ marginTop: 10 }}>
        <button
          className="vc-question-action vc-question-action-secondary"
          onClick={onToggleMic}
          aria-label={isListening ? "Stop voice input" : "Use microphone to dictate your question"}
          style={{ background: isListening ? "rgba(22,163,74,0.15)" : undefined, color: isListening ? "#4ade80" : undefined }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          </svg>
          {isListening ? "?? Listening�" : "Use Mic"}
        </button>
        <button
          className="vc-question-action vc-question-action-secondary"
          onClick={() => onQuickAction("No question")}
        >
          No Question
        </button>
      </div>

      <div className="vc-question-quick-actions">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action}
            className="vc-question-quick-btn"
            onClick={() => onQuickAction(action)}
          >
            {action}
          </button>
        ))}
      </div>
    </PanelWrapper>
  );
}
