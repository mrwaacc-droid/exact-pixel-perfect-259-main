import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingUp,
  BookOpen,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  studentAnswerIndex?: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

interface QuizReviewPageProps {
  sessionId: string;
  courseId: string;
  lessonId: string;
  quizData?: {
    title: string;
    score: number;
    totalQuestions: number;
    timeSpent: number;
    completedAt: string;
    questions: QuizQuestion[];
    performance: {
      easy: { correct: number; total: number };
      medium: { correct: number; total: number };
      hard: { correct: number; total: number };
    };
  };
}

export function QuizReviewPage({ sessionId, courseId, lessonId, quizData }: QuizReviewPageProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  const defaultData = {
    title: "Quadratic Equations Quiz",
    score: 85,
    totalQuestions: 10,
    timeSpent: 15,
    completedAt: "2 hours ago",
    questions: [
      {
        id: "1",
        question: "What is the standard form of a quadratic equation?",
        options: ["ax + b = 0", "ax² + bx + c = 0", "x² + y² = r²", "y = mx + b"],
        correctIndex: 1,
        studentAnswerIndex: 1,
        explanation: "The standard form includes the x² term with coefficient a.",
        difficulty: "easy",
      },
      {
        id: "2",
        question: "Factor x² - 5x + 6",
        options: ["(x-1)(x-6)", "(x-2)(x-3)", "(x+2)(x+3)", "(x+1)(x+6)"],
        correctIndex: 1,
        studentAnswerIndex: 1,
        explanation: "Find two numbers that multiply to 6 and add to -5: -2 and -3",
        difficulty: "medium",
      },
      {
        id: "3",
        question: "What is the discriminant of x² - 4x + 3?",
        options: ["1", "4", "9", "-3"],
        correctIndex: 2,
        studentAnswerIndex: 0,
        explanation: "Discriminant = b² - 4ac = (-4)² - 4(1)(3) = 16 - 12 = 4",
        difficulty: "hard",
      },
    ],
    performance: {
      easy: { correct: 4, total: 4 },
      medium: { correct: 3, total: 3 },
      hard: { correct: 2, total: 3 },
    },
  };

  const data = quizData || defaultData;
  const percentage = Math.round((data.score / 100) * 100);
  const scoreColor =
    percentage >= 80 ? "text-green-600" : percentage >= 60 ? "text-orange-600" : "text-red-600";

  const toggleQuestion = (id: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedQuestions(newExpanded);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to={`/classroom/session/${sessionId}` as any}
            className="flex items-center gap-2 text-[#7D2233] hover:text-[#521326] font-medium"
          >
            <ArrowLeft size={18} />
            Back to Session
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{data.title}</h1>
          <div className="w-32" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Score Card */}
        <Card className="mb-8 border-[#F7E7EA] bg-gradient-to-br from-[#F7E7EA] to-[#F7E7EA]">
          <CardContent className="pt-8 pb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className={`text-4xl font-bold ${scoreColor} mb-2`}>{percentage}%</div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#7D2233] mb-2">
                  {data.score}/{100}
                </div>
                <div className="text-sm text-gray-600">Points</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">{data.totalQuestions}</div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">{data.timeSpent}m</div>
                <div className="text-sm text-gray-600">Time Spent</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance by Difficulty */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Performance by Difficulty</h2>
            <div className="space-y-4">
              {[
                {
                  level: "Easy",
                  color: "bg-green-100",
                  barColor: "bg-green-600",
                  icon: "😊",
                  ...data.performance.easy,
                },
                {
                  level: "Medium",
                  color: "bg-orange-100",
                  barColor: "bg-orange-600",
                  icon: "😐",
                  ...data.performance.medium,
                },
                {
                  level: "Hard",
                  color: "bg-red-100",
                  barColor: "bg-red-600",
                  icon: "😤",
                  ...data.performance.hard,
                },
              ].map((perf, i) => (
                <div key={i} className={`p-4 rounded-lg ${perf.color}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{perf.icon}</span>
                      <span className="font-medium">{perf.level}</span>
                    </div>
                    <span className="text-sm font-semibold">
                      {perf.correct}/{perf.total} correct
                    </span>
                  </div>
                  <Progress
                    value={(perf.correct / perf.total) * 100}
                    className={`bg-opacity-30 ${perf.barColor}`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Question Review */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Question Review</h2>
          <div className="space-y-3">
            {data.questions.map((question, index) => {
              const isCorrect = question.studentAnswerIndex === question.correctIndex;
              const isExpanded = expandedQuestions.has(question.id);

              return (
                <Card key={question.id} className="overflow-hidden">
                  <button
                    onClick={() => toggleQuestion(question.id)}
                    className="w-full text-left p-4 flex items-start justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      {isCorrect ? (
                        <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
                      ) : (
                        <XCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900">Question {index + 1}</h3>
                        <p className="text-sm text-gray-600 mt-1">{question.question}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${
                              question.difficulty === "easy"
                                ? "bg-green-100 text-green-700"
                                : question.difficulty === "medium"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {question.difficulty}
                          </span>
                          {isCorrect ? (
                            <span className="text-xs font-medium px-2 py-1 rounded bg-green-100 text-green-700">
                              Correct
                            </span>
                          ) : (
                            <span className="text-xs font-medium px-2 py-1 rounded bg-red-100 text-red-700">
                              Incorrect
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={20} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-3">Options</h4>
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => {
                            const isStudentAnswer = optIndex === question.studentAnswerIndex;
                            const isCorrectAnswer = optIndex === question.correctIndex;

                            return (
                              <div
                                key={optIndex}
                                className={`p-3 rounded-lg border-2 ${
                                  isCorrectAnswer
                                    ? "border-green-500 bg-green-50"
                                    : isStudentAnswer
                                      ? "border-red-500 bg-red-50"
                                      : "border-gray-200 bg-white"
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  {isCorrectAnswer && (
                                    <CheckCircle2
                                      className="text-green-600 flex-shrink-0 mt-0.5"
                                      size={18}
                                    />
                                  )}
                                  {isStudentAnswer && !isCorrectAnswer && (
                                    <XCircle
                                      className="text-red-600 flex-shrink-0 mt-0.5"
                                      size={18}
                                    />
                                  )}
                                  {!isCorrectAnswer && !isStudentAnswer && (
                                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5" />
                                  )}
                                  <span className="text-sm">{option}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="bg-[#F7E7EA] border border-[#F7E7EA] rounded-lg p-3">
                        <div className="flex gap-2">
                          <HelpCircle className="text-[#7D2233] flex-shrink-0" size={18} />
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">Explanation</h4>
                            <p className="text-sm text-gray-700 mt-1">{question.explanation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 mt-8 pb-8">
          <Link to={`/classroom/${lessonId}` as any}>
            <Button variant="outline">Review Lesson</Button>
          </Link>
          <Button className="bg-[#7D2233] hover:bg-[#521326]">Retake Quiz</Button>
        </div>
      </main>
    </div>
  );
}
