/**
 * Klassruum Automated Classroom Engine
 *
 * Handles automated lesson flow with:
 * - Timed board item reveals
 * - Automatic teacher speech via TTS
 * - Question checkpoints every 5 minutes
 * - Required mid-lesson questions
 * - Practice blocks
 * - Mic auto-activation
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { speak, stopSpeech } from "./speech";
import type {
  BoardWriteItem,
  ClassroomEvent,
  Lesson,
  LessonStep,
  QuestionCheckpoint,
  RequiredLessonQuestion,
  PracticeBlock,
  LessonCompletionSummary,
} from "./lesson-models";

// Classroom state
export type ClassroomMode = "intro" | "teaching" | "question" | "practice" | "summary" | "complete";

export type QuestionState = {
  type: "checkpoint" | "required" | "practice" | "exit";
  isWaitingForAnswer: boolean;
  isRequired: boolean;
  promptText: string;
  correctAnswer?: string;
  acceptableAnswers?: string[];
  hint?: string;
  practiceId?: string;
};

export type AutomatedClassroomState = {
  mode: ClassroomMode;
  lesson: Lesson;
  stepIndex: number;
  boardItemIndex: number;

  // What's currently showing on the whiteboard
  visibleBoardItems: BoardWriteItem[];

  // What the teacher is currently saying
  currentSpeech: string;
  isTeacherSpeaking: boolean;

  // Progress
  elapsedSeconds: number;
  progressPercent: number;

  // Questions
  questionState: QuestionState | null;
  isMicActive: boolean;
  isListeningForAnswer: boolean;

  // Practice
  currentPractice: PracticeBlock | null;
  practiceResult: "correct" | "incorrect" | null;

  // Events tracking
  events: ClassroomEvent[];

  // Settings
  settings: {
    autoPlay: boolean;
    speechRate: number;
  };
};

export type ClassroomAction =
  | { type: "START_LESSON" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "NEXT_BOARD_ITEM" }
  | { type: "NEXT_STEP" }
  | { type: "TEACHER_FINISHED_SPEAKING" }
  | { type: "TRIGGER_QUESTION"; question: QuestionState }
  | { type: "SUBMIT_ANSWER"; answer: string }
  | { type: "SKIP_QUESTION" }
  | { type: "REPEAT_STEP" }
  | { type: "ASK_QUESTION"; question: string }
  | { type: "START_PRACTICE"; practice: PracticeBlock }
  | { type: "SET_SPEECH_RATE"; rate: number }
  | { type: "TOGGLE_AUTO_PLAY" }
  | { type: "TICK"; elapsedSeconds: number }
  | { type: "COMPLETE_LESSON" };

// Calculate when question checkpoints should trigger
function getCheckpointForMinute(lesson: Lesson, minute: number): QuestionCheckpoint | null {
  return lesson.questionCheckpoints.find((cp) => cp.triggerMinute === minute) || null;
}

// Check if a required question should trigger
function shouldTriggerRequiredQuestion(lesson: Lesson, stepIndex: number): boolean {
  const percent = (stepIndex / lesson.steps.length) * 100;
  return (
    percent >= lesson.requiredMidLessonQuestion.triggerPercentage &&
    percent < lesson.requiredMidLessonQuestion.triggerPercentage + 15
  );
}

// Main classroom engine hook
export function useAutomatedClassroomEngine(
  lesson: Lesson,
  onComplete?: (summary: LessonCompletionSummary) => void,
) {
  const [state, setState] = useState<AutomatedClassroomState>({
    mode: "intro",
    lesson,
    stepIndex: 0,
    boardItemIndex: -1,
    visibleBoardItems: [],
    currentSpeech: "",
    isTeacherSpeaking: false,
    elapsedSeconds: 0,
    progressPercent: 0,
    questionState: null,
    isMicActive: false,
    isListeningForAnswer: false,
    currentPractice: null,
    practiceResult: null,
    events: [],
    settings: {
      autoPlay: true,
      speechRate: 1,
    },
  });

  const timerRef = useRef<number | null>(null);
  const speechEndCallbackRef = useRef<(() => void) | null>(null);

  const currentStep = lesson.steps[state.stepIndex];

  // Start timed lesson progression
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = window.setInterval(() => {
      setState((prev) => ({
        ...prev,
        elapsedSeconds: prev.elapsedSeconds + 1,
      }));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Speak text and move to next on completion
  const speakAndContinue = useCallback(
    (text: string, onComplete?: () => void) => {
      stopSpeech();

      setState((prev) => ({
        ...prev,
        isTeacherSpeaking: true,
        currentSpeech: text,
      }));

      speechEndCallbackRef.current = () => {
        setState((prev) => ({
          ...prev,
          isTeacherSpeaking: false,
        }));
        onComplete?.();
      };

      speak(text, () => {
        speechEndCallbackRef.current?.();
      });
    },
    [state.settings.speechRate],
  );

  // Move to next board item
  const nextBoardItem = useCallback(() => {
    const step = lesson.steps[state.stepIndex];
    if (!step) return;

    const nextIndex = state.boardItemIndex + 1;

    if (nextIndex >= step.boardItems.length) {
      // Move to next step
      dispatch({ type: "NEXT_STEP" });
      return;
    }

    const item = step.boardItems[nextIndex];
    const newVisible = [...state.visibleBoardItems, item];

    setState((prev) => ({
      ...prev,
      boardItemIndex: nextIndex,
      visibleBoardItems: newVisible,
      events: [
        ...prev.events,
        {
          type: "board_item_written",
          itemId: item.id,
          timestamp: new Date().toISOString(),
        },
      ],
    }));

    // Speak the item text exactly if required
    if (item.readExactly) {
      speakAndContinue(item.text, () => {
        // After reading exactly, speak the explanation if any
        if (item.explanation) {
          speakAndContinue(item.explanation, () => {
            // Auto-continue to next item after pause
            if (state.settings.autoPlay && !state.questionState) {
              setTimeout(() => nextBoardItem(), item.pauseAfter || 1000);
            }
          });
        } else if (state.settings.autoPlay && !state.questionState) {
          // Auto-continue to next item after pause
          setTimeout(() => nextBoardItem(), item.pauseAfter || 800);
        }
      });
    } else if (item.explanation && state.settings.autoPlay) {
      speakAndContinue(item.explanation, () => {
        setTimeout(() => nextBoardItem(), item.pauseAfter || 500);
      });
    } else if (state.settings.autoPlay && !state.questionState) {
      setTimeout(() => nextBoardItem(), item.pauseAfter || 500);
    }
  }, [
    state.stepIndex,
    state.boardItemIndex,
    state.visibleBoardItems,
    state.settings.autoPlay,
    state.questionState,
    lesson,
    speakAndContinue,
  ]);

  // Move to next step
  const nextStep = useCallback(() => {
    const nextIndex = state.stepIndex + 1;

    if (nextIndex >= lesson.steps.length) {
      // Check for exit ticket
      if (lesson.exitTicket) {
        dispatch({
          type: "TRIGGER_QUESTION",
          question: {
            type: "exit",
            isWaitingForAnswer: true,
            isRequired: true,
            promptText: lesson.exitTicket.questionText,
            correctAnswer: lesson.exitTicket.correctAnswer,
            acceptableAnswers: lesson.exitTicket.acceptableAnswers,
          },
        });
        return;
      }

      dispatch({ type: "COMPLETE_LESSON" });
      return;
    }

    const step = lesson.steps[nextIndex];

    setState((prev) => ({
      ...prev,
      stepIndex: nextIndex,
      boardItemIndex: -1,
      visibleBoardItems: [],
      mode: "teaching",
      events: [
        ...prev.events,
        {
          type: "step_started",
          stepId: step.id,
          timestamp: new Date().toISOString(),
        } as ClassroomEvent,
      ],
    }));

    // Check for required question
    if (shouldTriggerRequiredQuestion(lesson, nextIndex)) {
      setTimeout(() => {
        dispatch({
          type: "TRIGGER_QUESTION",
          question: {
            type: "required",
            isWaitingForAnswer: true,
            isRequired: true,
            promptText: lesson.requiredMidLessonQuestion.questionText,
            correctAnswer: lesson.requiredMidLessonQuestion.correctAnswer,
            acceptableAnswers: lesson.requiredMidLessonQuestion.acceptableAnswers,
            hint: lesson.requiredMidLessonQuestion.hint,
          },
        });
      }, 1000);
      return;
    }

    // Check for practice
    if (step.practice) {
      dispatch({ type: "START_PRACTICE", practice: step.practice });
      return;
    }

    // Speak step title and then start board items
    speakAndContinue(`Alright. ${step.title}.`, () => {
      if (state.settings.autoPlay) {
        setTimeout(() => nextBoardItem(), 500);
      }
    });
  }, [state.stepIndex, lesson, state.settings.autoPlay, speakAndContinue]);

  // Process answer submission
  const processAnswer = useCallback(
    (answer: string) => {
      if (!state.questionState) return;

      const normalizedAnswer = answer.toLowerCase().trim();
      const acceptable = state.questionState.acceptableAnswers || [
        state.questionState.correctAnswer || "",
      ];

      const isCorrect = acceptable.some((a) => a.toLowerCase().trim() === normalizedAnswer);

      if (state.questionState.type === "required") {
        const feedback = isCorrect
          ? lesson.requiredMidLessonQuestion.feedbackCorrect
          : lesson.requiredMidLessonQuestion.feedbackIncorrect;

        speakAndContinue(feedback, () => {
          if (!isCorrect) {
            // Show correction on board
            setState((prev) => ({
              ...prev,
              visibleBoardItems: lesson.requiredMidLessonQuestion.boardCorrection,
              questionState: null,
              isMicActive: false,
              events: [
                ...prev.events,
                {
                  type: "required_question_answered",
                  questionId: lesson.requiredMidLessonQuestion.id,
                  correct: false,
                  timestamp: new Date().toISOString(),
                },
              ],
            }));
          } else {
            setState((prev) => ({
              ...prev,
              questionState: null,
              isMicActive: false,
              events: [
                ...prev.events,
                {
                  type: "required_question_answered",
                  questionId: lesson.requiredMidLessonQuestion.id,
                  correct: true,
                  timestamp: new Date().toISOString(),
                },
              ],
            }));
          }

          // Continue lesson
          if (state.settings.autoPlay) {
            setTimeout(() => nextBoardItem(), 1000);
          }
        });
      } else if (state.questionState.type === "checkpoint") {
        // Just note the answer and continue
        setState((prev) => ({
          ...prev,
          questionState: null,
          isMicActive: false,
          events: [
            ...prev.events,
            {
              type: "checkpoint_resolved",
              timestamp: new Date().toISOString(),
            },
          ],
        }));

        if (state.settings.autoPlay) {
          setTimeout(() => nextBoardItem(), 500);
        }
      } else if (state.questionState.type === "exit") {
        speakAndContinue(
          isCorrect ? lesson.exitTicket!.feedback : lesson.exitTicket!.feedback,
          () => {
            setState((prev) => ({
              ...prev,
              questionState: null,
              isMicActive: false,
              events: [
                ...prev.events,
                {
                  type: "exit_ticket_submitted",
                  correct: isCorrect,
                  timestamp: new Date().toISOString(),
                },
              ],
            }));
            dispatch({ type: "COMPLETE_LESSON" });
          },
        );
      } else if (state.questionState.type === "practice") {
        setState((prev) => ({
          ...prev,
          practiceResult: isCorrect ? "correct" : "incorrect",
          isMicActive: false,
          events: [
            ...prev.events,
            {
              type: "practice_answer_submitted",
              practiceId: state.questionState?.practiceId || "",
              correct: isCorrect,
              timestamp: new Date().toISOString(),
            },
          ],
        }));

        if (isCorrect) {
          speakAndContinue("Correct! Well done.", () => {
            setState((prev) => ({ ...prev, questionState: null, currentPractice: null }));
            if (state.settings.autoPlay) {
              setTimeout(() => nextStep(), 500);
            }
          });
        } else {
          const feedback =
            state.currentPractice?.hintOnIncorrect || "Let me show you the solution.";
          speakAndContinue(feedback, () => {
            // Show solution on board
            if (state.currentPractice) {
              setState((prev) => ({
                ...prev,
                visibleBoardItems: state.currentPractice!.boardSolution,
                questionState: null,
              }));
            }
          });
        }
      }
    },
    [
      state.questionState,
      state.currentPractice,
      state.settings.autoPlay,
      lesson,
      speakAndContinue,
      nextBoardItem,
      nextStep,
    ],
  );

  // Dispatch action
  const dispatch = useCallback(
    (action: ClassroomAction) => {
      switch (action.type) {
        case "START_LESSON":
          startTimer();
          setState((prev) => ({
            ...prev,
            mode: "teaching",
            events: [{ type: "session_started", timestamp: new Date().toISOString() }],
          }));

          // Welcome message
          speakAndContinue(
            `Welcome to today's lesson. We're working on ${lesson.objective}. I'll take it step by step with you.`,
            () => {
              if (state.settings.autoPlay) {
                setTimeout(() => nextBoardItem(), 1000);
              }
            },
          );
          break;

        case "PAUSE":
          stopTimer();
          stopSpeech();
          setState((prev) => ({ ...prev, settings: { ...prev.settings, autoPlay: false } }));
          break;

        case "RESUME":
          startTimer();
          setState((prev) => ({ ...prev, settings: { ...prev.settings, autoPlay: true } }));
          nextBoardItem();
          break;

        case "NEXT_BOARD_ITEM":
          nextBoardItem();
          break;

        case "NEXT_STEP":
          nextStep();
          break;

        case "TEACHER_FINISHED_SPEAKING":
          setState((prev) => ({ ...prev, isTeacherSpeaking: false }));
          break;

        case "TRIGGER_QUESTION":
          stopSpeech();
          setState((prev) => ({
            ...prev,
            mode: "question",
            questionState: action.question,
            // Activate mic automatically for voice response
            isMicActive: true,
            isListeningForAnswer: true,
            events: [
              ...prev.events,
              {
                type: "question_triggered",
                questionType: action.question.type,
                timestamp: new Date().toISOString(),
              } as ClassroomEvent,
            ],
          }));

          speakAndContinue(action.question.promptText, () => {
            // Mic is now active, listening for response
          });
          break;

        case "SUBMIT_ANSWER":
          processAnswer(action.answer);
          break;

        case "SKIP_QUESTION":
          if (state.questionState?.isRequired) {
            // Can't skip required questions
            speakAndContinue("Please answer this question before we continue.");
            return;
          }
          setState((prev) => ({
            ...prev,
            questionState: null,
            isMicActive: false,
            isListeningForAnswer: false,
          }));
          if (state.settings.autoPlay) {
            nextBoardItem();
          }
          break;

        case "REPEAT_STEP":
          setState((prev) => ({
            ...prev,
            boardItemIndex: -1,
            visibleBoardItems: [],
            events: [
              ...prev.events,
              {
                type: "lesson_replayed",
                fromStep: prev.stepIndex,
                timestamp: new Date().toISOString(),
              },
            ],
          }));
          speakAndContinue("Let me repeat this step.", () => {
            if (state.settings.autoPlay) {
              nextBoardItem();
            }
          });
          break;

        case "ASK_QUESTION":
          setState((prev) => ({
            ...prev,
            events: [
              ...prev.events,
              {
                type: "learner_asked_question",
                question: action.question,
                timestamp: new Date().toISOString(),
              },
            ],
          }));
          // Generate AI response for the question
          speakAndContinue(`That's a great question. ${action.question}. Let me explain.`, () => {
            if (state.settings.autoPlay) {
              // Continue after answering
            }
          });
          break;

        case "START_PRACTICE":
          setState((prev) => ({
            ...prev,
            mode: "practice",
            currentPractice: action.practice,
            events: [
              ...prev.events,
              {
                type:
                  action.practice.type === "guided"
                    ? "guided_practice_started"
                    : "independent_practice_started",
                practiceId: action.practice.id,
                timestamp: new Date().toISOString(),
              } as ClassroomEvent,
            ],
          }));

          speakAndContinue(
            action.practice.type === "guided"
              ? `Let's practice together. ${action.practice.problemText}`
              : `Now it's your turn. ${action.practice.problemText}`,
            () => {
              // Activate mic for answer
              setState((prev) => ({
                ...prev,
                questionState: {
                  type: "practice",
                  isWaitingForAnswer: true,
                  isRequired: true,
                  promptText: action.practice.problemText,
                  correctAnswer: action.practice.expectedAnswer,
                  acceptableAnswers: action.practice.acceptableAnswers,
                  practiceId: action.practice.id,
                },
                isMicActive: true,
                isListeningForAnswer: true,
              }));
            },
          );
          break;

        case "SET_SPEECH_RATE":
          setState((prev) => ({
            ...prev,
            settings: { ...prev.settings, speechRate: action.rate },
          }));
          break;

        case "TOGGLE_AUTO_PLAY":
          setState((prev) => ({
            ...prev,
            settings: { ...prev.settings, autoPlay: !prev.settings.autoPlay },
          }));
          break;

        case "TICK": {
          // Check for question checkpoints
          const currentMinute = Math.floor(action.elapsedSeconds / 60);
          const checkpoint = getCheckpointForMinute(lesson, currentMinute);

          if (checkpoint && !state.questionState && state.mode === "teaching") {
            dispatch({
              type: "TRIGGER_QUESTION",
              question: {
                type: "checkpoint",
                isWaitingForAnswer: true,
                isRequired: checkpoint.required,
                promptText: checkpoint.promptText,
              },
            });
          }
          break;
        }

        case "COMPLETE_LESSON": {
          stopTimer();
          stopSpeech();

          const summary: LessonCompletionSummary = {
            sessionId: crypto.randomUUID(),
            lessonId: lesson.id,
            timeSpentMinutes: Math.ceil(state.elapsedSeconds / 60),
            completedAt: new Date().toISOString(),
            middleQuestionAnswered: true,
            middleQuestionCorrect: true,
            guidedPracticeCompleted: true,
            guidedPracticeCorrect: true,
            independentPracticeCompleted: true,
            independentPracticeCorrect: true,
            exitTicketAnswered: !!lesson.exitTicket,
            exitTicketCorrect: true,
            questionsAskedCount: 0,
            weakAreas: [],
            recommendedNext: lesson.homework || [],
            notesSaved: false,
            transcriptGenerated: true,
          };

          setState((prev) => ({
            ...prev,
            mode: "complete",
            events: [
              ...prev.events,
              {
                type: "lesson_completed",
                summary,
                timestamp: new Date().toISOString(),
              },
            ],
          }));
          onComplete?.(summary);
          break;
        }
      }
    },
    [
      state,
      lesson,
      startTimer,
      stopTimer,
      nextBoardItem,
      nextStep,
      speakAndContinue,
      processAnswer,
      onComplete,
    ],
  );

  // Handle tick for checkpoints
  useEffect(() => {
    if (state.settings.autoPlay && state.mode === "teaching" && !state.questionState) {
      dispatch({ type: "TICK", elapsedSeconds: state.elapsedSeconds });
    }
  }, [state.elapsedSeconds]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopTimer();
      stopSpeech();
    };
  }, []);

  return {
    state,
    dispatch,
    // Convenience methods
    startLesson: () => dispatch({ type: "START_LESSON" }),
    pause: () => dispatch({ type: "PAUSE" }),
    resume: () => dispatch({ type: "RESUME" }),
    submitAnswer: (answer: string) => dispatch({ type: "SUBMIT_ANSWER", answer }),
    skipQuestion: () => dispatch({ type: "SKIP_QUESTION" }),
    repeatStep: () => dispatch({ type: "REPEAT_STEP" }),
    askQuestion: (question: string) => dispatch({ type: "ASK_QUESTION", question }),
    setSpeechRate: (rate: number) => dispatch({ type: "SET_SPEECH_RATE", rate }),
    toggleAutoPlay: () => dispatch({ type: "TOGGLE_AUTO_PLAY" }),
    nextItem: () => dispatch({ type: "NEXT_BOARD_ITEM" }),
  };
}
