import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  TrendingUp,
  Calendar,
  Target,
  Trophy,
  BarChart3,
  LineChart,
  PieChart,
  Zap,
  Medal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function ProgressAnalyticsPage() {
  const analyticsData = {
    totalLessonsCompleted: 42,
    totalCoursesEnrolled: 5,
    totalCoursesCompleted: 2,
    averageScore: 82,
    currentStreak: 7,
    longestStreak: 14,
    totalStudyMinutes: 1240,
    lastSessionDate: "Today at 2:30 PM",
    courseProgress: [
      {
        name: "Mathematics Form 2",
        progress: 65,
        lessons: 16,
        totalLessons: 24,
      },
      { name: "Physics Basics", progress: 0, lessons: 0, totalLessons: 20 },
      {
        name: "Chemistry Revision",
        progress: 100,
        lessons: 18,
        totalLessons: 18,
      },
      {
        name: "English Literature",
        progress: 45,
        lessons: 9,
        totalLessons: 20,
      },
      {
        name: "History & Geography",
        progress: 25,
        lessons: 5,
        totalLessons: 20,
      },
    ],
    weeklyActivity: [
      { day: "Mon", minutes: 120 },
      { day: "Tue", minutes: 150 },
      { day: "Wed", minutes: 180 },
      { day: "Thu", minutes: 90 },
      { day: "Fri", minutes: 200 },
      { day: "Sat", minutes: 240 },
      { day: "Sun", minutes: 0 },
    ],
    topicPerformance: [
      { topic: "Quadratic Equations", score: 92, attempts: 8 },
      { topic: "Trigonometry", score: 78, attempts: 5 },
      { topic: "Algebra", score: 85, attempts: 6 },
      { topic: "Calculus Basics", score: 88, attempts: 4 },
      { topic: "Statistics", score: 72, attempts: 3 },
    ],
    achievements: [
      { title: "First Steps", description: "Completed your first lesson" },
      {
        title: "Consistent Learner",
        description: "7-day learning streak",
      },
      {
        title: "Course Master",
        description: "Completed a full course",
      },
      {
        title: "Perfect Score",
        description: "Got 100% on a quiz",
      },
    ],
  };

  const maxWeeklyMinutes = Math.max(...analyticsData.weeklyActivity.map((d) => d.minutes));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/student/dashboard"
            className="flex items-center gap-2 text-[#7D2233] hover:text-[#521326] font-medium"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Learning Analytics</h1>
          <div className="w-32" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#7D2233] mb-2">
                  {analyticsData.totalLessonsCompleted}
                </div>
                <div className="text-sm text-gray-600">Lessons Completed</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {analyticsData.averageScore}%
                </div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {analyticsData.currentStreak}
                </div>
                <div className="text-sm text-gray-600">Day Streak 🔥</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {Math.round(analyticsData.totalStudyMinutes / 60)}h
                </div>
                <div className="text-sm text-gray-600">Total Study Time</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Course Progress */}
          <Card className="lg:col-span-2">
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <BarChart3 size={20} />
                Course Progress
              </h2>
              <div className="space-y-4">
                {analyticsData.courseProgress.map((course) => (
                  <div key={course.name}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{course.name}</h3>
                      <span className="text-sm font-semibold text-gray-700">
                        {course.progress}%
                      </span>
                    </div>
                    <Progress value={course.progress} className="bg-gray-200 h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      {course.lessons}/{course.totalLessons} lessons
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Trophy size={20} />
                Achievements
              </h2>
              <div className="space-y-3">
                {analyticsData.achievements.map((achievement, i) => (
                  <div key={i} className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="flex items-start gap-2">
                      <Medal className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{achievement.title}</p>
                        <p className="text-xs text-gray-600">{achievement.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Activity */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <LineChart size={20} />
                Weekly Activity
              </h2>
              <div className="space-y-3">
                {analyticsData.weeklyActivity.map((day) => (
                  <div key={day.day} className="flex items-center gap-3">
                    <span className="w-10 text-sm font-medium text-gray-600">{day.day}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#7D2233] h-full transition-all"
                          style={{
                            width: `${(day.minutes / maxWeeklyMinutes) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="w-12 text-right text-sm text-gray-600">{day.minutes}m</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Topics */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Target size={20} />
                Top Performing Topics
              </h2>
              <div className="space-y-4">
                {analyticsData.topicPerformance.map((topic) => (
                  <div key={topic.topic}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{topic.topic}</span>
                      <span className="text-sm font-semibold text-gray-700">{topic.score}%</span>
                    </div>
                    <Progress value={topic.score} className="bg-gray-200 h-2" />
                    <p className="text-xs text-gray-500 mt-1">{topic.attempts} attempts</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <Card className="mt-6 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Zap size={20} className="text-green-600" />
              Recommendations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg border border-green-200">
                <p className="font-medium text-gray-900 mb-1">Keep Your Streak Going</p>
                <p className="text-sm text-gray-600">
                  You're on a 7-day streak! Complete 1 lesson today to keep it up.
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-green-200">
                <p className="font-medium text-gray-900 mb-1">Review Weak Topics</p>
                <p className="text-sm text-gray-600">
                  Focus on Statistics (72%) to improve overall performance.
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-green-200">
                <p className="font-medium text-gray-900 mb-1">Next Challenge</p>
                <p className="text-sm text-gray-600">
                  Try the Physics course to diversify your learning.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
