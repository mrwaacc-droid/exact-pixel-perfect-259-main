import React, { useState } from "react";
import { CheckCircle2, AlertCircle, Target, BookOpen, Home } from "lucide-react";
import type { ExitTicket } from "@/lib/lesson-types";

interface ExitTicketPromptProps {
  ticket: ExitTicket;
  onSubmit: (answer: string) => void;
  isLoading?: boolean;
}

export function ExitTicketPrompt({ ticket, onSubmit, isLoading = false }: ExitTicketPromptProps) {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (answer.trim()) {
      setSubmitted(true);
      onSubmit(answer);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="flex items-center gap-3 mb-6">
          <Target className="h-6 w-6 text-[var(--crimson)]" />
          <h3 className="text-xl font-bold text-gray-900">Exit Ticket</h3>
        </div>

        <p className="text-sm text-gray-700 mb-6 leading-relaxed">{ticket.question}</p>

        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Your answer..."
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)] mb-4 h-28 resize-none"
          disabled={submitted || isLoading}
          autoFocus
        />

        <button
          onClick={handleSubmit}
          disabled={!answer.trim() || submitted || isLoading}
          className="w-full px-4 py-3 bg-[var(--crimson)] text-white rounded-lg font-semibold hover:bg-[var(--crimson-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Evaluating..." : "Submit"}
        </button>

        {submitted && (
          <div className="mt-3 p-3 bg-[var(--crimson-soft)] border border-[var(--crimson-soft)] rounded-lg">
            <p className="text-xs text-[var(--crimson-dark)]">✓ Answer submitted. Thank you!</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface HomeworkItem {
  id: string;
  problem: string;
  difficulty: "easy" | "medium" | "hard";
}

interface HomeworkPanelProps {
  title: string;
  problems: HomeworkItem[];
  estimatedMinutes: number;
  reviewMaterial?: string;
  onStartHomework?: () => void;
  onSaveForLater?: () => void;
}

export function HomeworkPanel({
  title,
  problems,
  estimatedMinutes,
  reviewMaterial,
  onStartHomework,
  onSaveForLater,
}: HomeworkPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const difficultyColor = {
    easy: "bg-green-50 text-green-700 border-green-200",
    medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
    hard: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-[var(--crimson)]" />
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500">
              {problems.length} problems · ~{estimatedMinutes} min
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? "▼" : "▶"}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-3 mb-4">
          {problems.map((problem, index) => (
            <div
              key={problem.id}
              className={`p-3 rounded-lg border ${difficultyColor[problem.difficulty]}`}
            >
              <p className="text-sm font-medium mb-1">
                Problem {index + 1} ({problem.difficulty})
              </p>
              <p className="text-sm">{problem.problem}</p>
            </div>
          ))}

          {reviewMaterial && (
            <div className="p-3 bg-[var(--crimson-soft)] border border-[var(--crimson-soft)] rounded-lg">
              <p className="text-xs font-semibold text-[#191314] mb-1">📖 Review Material</p>
              <p className="text-xs text-[var(--crimson-dark)]">{reviewMaterial}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onStartHomework}
          className="flex-1 px-4 py-2 bg-[var(--crimson)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--crimson-dark)] transition-colors"
        >
          Start Homework
        </button>
        <button
          onClick={onSaveForLater}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          Save for Later
        </button>
      </div>
    </div>
  );
}

interface LessonCompletionSummaryProps {
  lessonTitle: string;
  courseTitle: string;
  timeSpentMinutes: number;
  questionsAsked: number;
  midLessonQuestionCorrect: boolean;
  practiceScore: number; // 0-100
  exitTicketScore?: number;
  weakTopics?: string[];
  recommendedNext?: {
    type: "review" | "practice" | "nextLesson";
    title: string;
    reason: string;
  };
  onBackToDashboard?: () => void;
  onNextLesson?: () => void;
  onRetakeLesson?: () => void;
}

export function LessonCompletionSummary({
  lessonTitle,
  courseTitle,
  timeSpentMinutes,
  questionsAsked,
  midLessonQuestionCorrect,
  practiceScore,
  exitTicketScore,
  weakTopics = [],
  recommendedNext,
  onBackToDashboard,
  onNextLesson,
  onRetakeLesson,
}: LessonCompletionSummaryProps) {
  const overallScore = Math.round(
    (practiceScore + (exitTicketScore || 0)) / (exitTicketScore ? 2 : 1),
  );

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <h1 className="text-4xl font-bold text-gray-900">Lesson Complete!</h1>
        </div>
        <p className="text-lg text-gray-600">
          {lessonTitle} · {courseTitle}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--crimson-soft)] border border-[var(--crimson-soft)] rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-[#191314]">{timeSpentMinutes} min</p>
          <p className="text-xs text-[var(--crimson-dark)] mt-1">Time Spent</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-purple-900">{questionsAsked}</p>
          <p className="text-xs text-purple-700 mt-1">Questions Asked</p>
        </div>

        <div
          className={`rounded-lg p-4 text-center border ${
            midLessonQuestionCorrect
              ? "bg-green-50 border-green-200"
              : "bg-yellow-50 border-yellow-200"
          }`}
        >
          <p
            className={`text-2xl font-bold ${
              midLessonQuestionCorrect ? "text-green-900" : "text-yellow-900"
            }`}
          >
            {midLessonQuestionCorrect ? "✓" : "◐"}
          </p>
          <p
            className={`text-xs mt-1 ${
              midLessonQuestionCorrect ? "text-green-700" : "text-yellow-700"
            }`}
          >
            Mid Lesson Q
          </p>
        </div>

        <div className="bg-[var(--crimson-soft)] border border-[var(--crimson-soft)] rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-[#191314]">{overallScore}%</p>
          <p className="text-xs text-[var(--crimson-dark)] mt-1">Overall Score</p>
        </div>
      </div>

      {/* Practice Scores */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Performance Breakdown</h3>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Guided Practice</span>
              <span className="text-sm font-semibold text-gray-900">{practiceScore}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[var(--crimson-soft)]0" style={{ width: `${practiceScore}%` }} />
            </div>
          </div>

          {exitTicketScore !== undefined && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Exit Ticket</span>
                <span className="text-sm font-semibold text-gray-900">{exitTicketScore}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${exitTicketScore}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Weak Topics */}
      {weakTopics.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900 mb-2">Topics to Review</h4>
              <ul className="space-y-1">
                {weakTopics.map((topic, index) => (
                  <li key={index} className="text-sm text-amber-800">
                    • {topic}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-amber-700 mt-3">
                Consider revisiting these areas before moving forward.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recommendation */}
      {recommendedNext && (
        <div className="bg-[var(--crimson-soft)] border border-[var(--crimson-soft)] rounded-lg p-6">
          <p className="text-sm font-semibold text-[#191314] mb-2">🎯 Recommended Next Step</p>
          <p className="text-sm text-[var(--crimson-dark)] mb-1">{recommendedNext.title}</p>
          <p className="text-xs text-[var(--crimson-dark)]">{recommendedNext.reason}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={onBackToDashboard}
          className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          <Home className="h-4 w-4" />
          Dashboard
        </button>

        <button
          onClick={onRetakeLesson}
          className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          Retake
        </button>

        <button
          onClick={onNextLesson}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[var(--crimson)] text-white rounded-lg font-semibold hover:bg-[var(--crimson-dark)] transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
