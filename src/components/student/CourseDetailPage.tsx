import { useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Users,
  Star,
  Play,
  CheckCircle2,
  Lock,
  ChevronRight,
  Download,
  Share2,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number;
  status: "not_started" | "in_progress" | "completed";
  order: number;
}

export function CourseDetailPage({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [isEnrolled, setIsEnrolled] = useState(true);

  const courseData = {
    id: courseId,
    title: "Mathematics Form 2",
    subject: "Mathematics",
    level: "Form 2",
    description:
      "Master quadratic equations, trigonometry, and advanced algebra with step-by-step lessons and interactive practice.",
    longDescription:
      "This comprehensive course covers all Form 2 mathematics concepts with a focus on problem-solving and real-world applications. Each lesson includes worked examples, guided practice, and quizzes to reinforce your understanding.",
    instructor: "Mr. Klass",
    rating: 4.8,
    studentCount: 1250,
    totalDuration: 12,
    progress: 65,
    lessons: [
      {
        id: "1",
        title: "Introduction to Quadratics",
        description: "Learn the standard form and basic properties",
        duration: 45,
        status: "completed",
        order: 1,
      },
      {
        id: "2",
        title: "Factoring Techniques",
        description: "Master factoring methods for quadratic expressions",
        duration: 50,
        status: "completed",
        order: 2,
      },
      {
        id: "3",
        title: "Solving Equations",
        description: "Find solutions using various methods",
        duration: 45,
        status: "in_progress",
        order: 3,
      },
      {
        id: "4",
        title: "Applications & Word Problems",
        description: "Apply quadratics to real-world scenarios",
        duration: 40,
        status: "not_started",
        order: 4,
      },
      {
        id: "5",
        title: "Advanced Topics",
        description: "Complex quadratic functions and graphs",
        duration: 55,
        status: "not_started",
        order: 5,
      },
    ],
  };

  const completedCount = courseData.lessons.filter((l) => l.status === "completed").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/student/courses"
            className="flex items-center gap-2 text-[#7D2233] hover:text-[#521326] font-medium"
          >
            <ArrowLeft size={18} />
            Back to Courses
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Share2 size={16} />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Bell size={16} />
              Notify
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-500 to-[#F7E7EA]0 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-4">{courseData.title}</h1>
          <p className="text-lg text-purple-100 max-w-2xl mb-6">{courseData.description}</p>

          <div className="flex flex-wrap items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <Star size={18} className="fill-yellow-300 text-yellow-300" />
              <span className="font-medium">{courseData.rating}</span>
              <span className="text-purple-100">
                ({courseData.studentCount.toLocaleString()} students)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} />
              <span className="font-medium">{courseData.totalDuration} hours</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={18} />
              <span className="font-medium">{courseData.instructor}</span>
            </div>
          </div>

          {isEnrolled ? (
            <div className="flex items-center gap-3">
              <Link to={`/classroom/${courseData.lessons[0].id}` as any}>
                <Button className="bg-white text-purple-600 hover:bg-gray-100 font-medium">
                  <Play size={16} />
                  Continue Learning
                </Button>
              </Link>
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                View Certificate
              </Button>
            </div>
          ) : (
            <Button
              className="bg-white text-purple-600 hover:bg-gray-100 font-medium"
              onClick={() => setIsEnrolled(true)}
            >
              Enroll Now - Free
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lessons */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Lessons</h2>

            {isEnrolled && (
              <Card className="mb-6 border-[#F7E7EA] bg-[#F7E7EA]">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900">Your Progress</span>
                    <span className="text-sm font-bold text-[#7D2233]">{courseData.progress}%</span>
                  </div>
                  <Progress value={courseData.progress} className="bg-[#F7E7EA] h-2" />
                  <p className="text-xs text-gray-600 mt-3">
                    {completedCount} of {courseData.lessons.length} lessons completed
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              {courseData.lessons.map((lesson, index) => (
                <Card key={lesson.id} className="hover:shadow-md transition-shadow overflow-hidden">
                  <Link to={`/classroom/${lesson.id}` as any}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Status Icon */}
                        <div className="flex-shrink-0 mt-1">
                          {lesson.status === "completed" ? (
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                              <CheckCircle2 size={20} className="text-green-600" />
                            </div>
                          ) : lesson.status === "in_progress" ? (
                            <div className="w-10 h-10 rounded-full bg-[#F7E7EA] flex items-center justify-center">
                              <Play size={20} className="text-[#7D2233]" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <Lock size={20} className="text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900">
                            Lesson {index + 1}: {lesson.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock size={12} />
                              {lesson.duration} min
                            </span>
                            {lesson.status === "completed" && (
                              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                                Completed
                              </span>
                            )}
                            {lesson.status === "in_progress" && (
                              <span className="text-xs px-2 py-1 rounded-full bg-[#F7E7EA] text-[#521326] font-medium">
                                In Progress
                              </span>
                            )}
                          </div>
                        </div>

                        <ChevronRight className="text-gray-300 flex-shrink-0 mt-1" size={20} />
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Course Info</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-gray-600">Subject</span>
                    <p className="font-medium text-gray-900">{courseData.subject}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Level</span>
                    <p className="font-medium text-gray-900">{courseData.level}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Duration</span>
                    <p className="font-medium text-gray-900">{courseData.totalDuration} hours</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Instructor</span>
                    <p className="font-medium text-gray-900">{courseData.instructor}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <Button className="w-full bg-[#7D2233] hover:bg-[#521326]">
                      <Download size={16} />
                      Download Resources
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
