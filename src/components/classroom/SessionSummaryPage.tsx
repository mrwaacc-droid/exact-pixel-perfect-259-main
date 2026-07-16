import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Lightbulb,
  MessageSquare,
  Star,
  Target,
  TrendingUp,
  Download,
  Share2,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface SessionSummaryPageProps {
  sessionId: string;
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  summary?: {
    duration: number;
    correctAnswers: number;
    totalQuestions: number;
    confusionScore: number;
    completedSteps: number;
    totalSteps: number;
    keyTakeaways: string[];
    nextLessonRecommendation?: string;
    performanceInsights: string[];
    boardSnapshots: Array<{ title: string; description: string }>;
  };
}

export function SessionSummaryPage({
  sessionId,
  courseId,
  lessonId,
  lessonTitle,
  summary,
}: SessionSummaryPageProps) {
  const [showDetails, setShowDetails] = useState(false);

  const defaultSummary = {
    duration: 45,
    correctAnswers: 8,
    totalQuestions: 10,
    confusionScore: 0.35,
    completedSteps: 8,
    totalSteps: 8,
    keyTakeaways: [
      "Mastered factoring quadratic equations",
      "Improved pattern recognition",
      "Better understanding of standard form",
    ],
    nextLessonRecommendation: "Solving Complex Quadratics",
    performanceInsights: [
      "Strong performance on worked examples",
      "Need more practice with independent questions",
      "Consider review on edge cases",
    ],
    boardSnapshots: [
      { title: "Hook", description: "Lesson introduction" },
      { title: "Concept", description: "Standard quadratic form" },
      { title: "Example", description: "Worked example with solution" },
    ],
  };

  const data = summary || defaultSummary;
  const quizScore = Math.round((data.correctAnswers / data.totalQuestions) * 100);
  const completionPercentage = Math.round((data.completedSteps / data.totalSteps) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to={`/classroom/session/${sessionId}` as any}
            className="flex items-center gap-2 text-[#7D2233] hover:text-[var(--crimson-dark)] font-medium"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download size={16} />
              Download
            </Button>
            <Button variant="outline" size="sm">
              <Share2 size={16} />
              Share
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Great work! You completed {lessonTitle}
          </h1>
          <p className="text-lg text-gray-600">Here's a summary of what you learned today</p>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#7D2233] mb-2">{quizScore}%</div>
                <div className="text-sm text-gray-600">Quiz Score</div>
                <div className="text-xs text-gray-500 mt-1">
                  {data.correctAnswers}/{data.totalQuestions} correct
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {completionPercentage}%
                </div>
                <div className="text-sm text-gray-600">Completed</div>
                <div className="text-xs text-gray-500 mt-1">
                  {data.completedSteps}/{data.totalSteps} steps
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">{data.duration}m</div>
                <div className="text-sm text-gray-600">Time Spent</div>
                <div className="text-xs text-gray-500 mt-1">
                  {Math.round(data.duration / (data.totalSteps || 1))}m per step
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {Math.round((1 - data.confusionScore) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Confidence</div>
                <div className="text-xs text-gray-500 mt-1">Low confusion score</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Key Takeaways */}
          <Card className="lg:col-span-2">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="text-yellow-500" size={20} />
                <h2 className="text-lg font-semibold text-gray-900">Key Takeaways</h2>
              </div>
              <div className="space-y-3">
                {data.keyTakeaways.map((takeaway, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                    <p className="text-sm text-gray-700">{takeaway}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-[#7D2233]" size={20} />
                <h2 className="text-lg font-semibold text-gray-900">Insights</h2>
              </div>
              <div className="space-y-2">
                {data.performanceInsights.slice(0, 3).map((insight, i) => (
                  <p key={i} className="text-xs text-gray-600 leading-relaxed">
                    • {insight}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Board Snapshots */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Lesson Board</h2>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-[#7D2233] hover:text-[var(--crimson-dark)] text-sm font-medium flex items-center gap-1"
              >
                {showDetails ? "Hide" : "Show"} Details
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.boardSnapshots.map((snapshot, i) => (
                <div
                  key={i}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{snapshot.title}</h3>
                  <p className="text-sm text-gray-600">{snapshot.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card className="bg-gradient-to-br from-[#F7E7EA] to-[#F7E7EA] border-[#F7E7EA]">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Target className="text-[#7D2233] flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Recommended Next Lesson</h3>
                  <p className="text-sm text-gray-700 mb-4">{data.nextLessonRecommendation}</p>
                  <Link
                    to={`/classroom/${lessonId}` as any}
                    className="inline-flex items-center gap-2 text-[#7D2233] hover:text-[var(--crimson-dark)] font-medium text-sm"
                  >
                    Start Lesson
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <MessageSquare className="text-gray-600 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Keep Learning</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Review your notes or try another lesson from this course
                  </p>
                  <Link
                    to="/student/notes"
                    className="inline-flex items-center gap-2 text-[#7D2233] hover:text-[var(--crimson-dark)] font-medium text-sm"
                  >
                    View Notes
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 mt-8 pb-8">
          <Link to="/student/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
          <Button className="bg-[#7D2233] hover:bg-[var(--crimson-dark)]">
            <RotateCcw size={16} />
            Retake This Lesson
          </Button>
        </div>
      </main>
    </div>
  );
}
