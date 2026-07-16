import { useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import {
  Search,
  Filter,
  Grid,
  List,
  ChevronRight,
  Star,
  Users,
  Clock,
  BookOpen,
  Zap,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface Course {
  id: string;
  title: string;
  subject: string;
  level: string;
  description: string;
  thumbnail?: string;
  color?: string;
  progressPercentage: number;
  totalLessons?: number;
  completedLessons?: number;
  enrolled: boolean;
  rating?: number;
  studentCount?: number;
  duration?: number;
}

export function CourseListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "in-progress" | "completed">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const courses: Course[] = [
    {
      id: "1",
      title: "Mathematics Form 2",
      subject: "Mathematics",
      level: "Form 2",
      description: "Master quadratic equations, trigonometry, and advanced algebra",
      color: "from-purple-500 to-[#F7E7EA]0",
      progressPercentage: 65,
      totalLessons: 24,
      completedLessons: 16,
      enrolled: true,
      rating: 4.8,
      studentCount: 1250,
      duration: 12,
    },
    {
      id: "2",
      title: "Physics Basics",
      subject: "Physics",
      level: "Form 1",
      description: "Learn fundamental physics concepts from motion to energy",
      color: "from-[#F7E7EA]0 to-cyan-500",
      progressPercentage: 0,
      totalLessons: 20,
      completedLessons: 0,
      enrolled: false,
      rating: 4.6,
      studentCount: 2100,
      duration: 10,
    },
    {
      id: "3",
      title: "Chemistry Revision",
      subject: "Chemistry",
      level: "Form 2",
      description: "Comprehensive review of organic and inorganic chemistry",
      color: "from-green-500 to-emerald-500",
      progressPercentage: 100,
      totalLessons: 18,
      completedLessons: 18,
      enrolled: true,
      rating: 4.7,
      studentCount: 890,
      duration: 8,
    },
  ];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "in-progress" &&
        course.progressPercentage > 0 &&
        course.progressPercentage < 100) ||
      (selectedFilter === "completed" && course.progressPercentage === 100);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
              <p className="text-gray-600 mt-1">
                {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""} available
              </p>
            </div>
            <Link to="/student/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#7D2233]"
              />
            </div>

            <div className="flex gap-2">
              {(["all", "in-progress", "completed"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    selectedFilter === filter
                      ? "bg-[#7D2233] text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Filter size={16} className="inline mr-2" />
                  {filter === "in-progress"
                    ? "In Progress"
                    : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex gap-2 border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-[#F7E7EA] text-[#7D2233]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "list"
                    ? "bg-[#F7E7EA] text-[#7D2233]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600">Try adjusting your filters or search</p>
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                {/* Thumbnail */}
                <div
                  className={`h-32 bg-gradient-to-br ${
                    course.color || "from-gray-300 to-gray-400"
                  } flex items-center justify-center text-white`}
                >
                  <BookOpen size={48} className="opacity-30" />
                </div>

                <CardContent className="pt-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                  <p className="text-xs text-gray-500 mb-3">
                    {course.subject} • {course.level}
                  </p>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{course.description}</p>

                  {course.enrolled && (
                    <>
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span className="font-medium">{course.progressPercentage}%</span>
                        </div>
                        <Progress value={course.progressPercentage} className="bg-gray-200 h-2" />
                      </div>

                      <div className="text-xs text-gray-600 mb-4">
                        {course.completedLessons}/{course.totalLessons} lessons
                      </div>
                    </>
                  )}

                  <Link to={`/courses/${course.id}` as any} className="block">
                    <Button className="w-full" variant={course.enrolled ? "default" : "outline"}>
                      {course.enrolled ? "Continue Learning" : "Enroll"}
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCourses.map((course) => (
              <Link key={course.id} to={`/courses/${course.id}` as any}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      <div
                        className={`h-24 w-24 rounded-lg bg-gradient-to-br ${
                          course.color || "from-gray-300 to-gray-400"
                        } flex items-center justify-center text-white flex-shrink-0`}
                      >
                        <BookOpen size={32} className="opacity-30" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">{course.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {course.subject} • {course.level}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                          {course.description}
                        </p>

                        {course.enrolled && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>
                                {course.completedLessons}/{course.totalLessons} lessons
                              </span>
                              <span className="font-medium">{course.progressPercentage}%</span>
                            </div>
                            <Progress
                              value={course.progressPercentage}
                              className="bg-gray-200 h-1.5"
                            />
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {course.rating && (
                          <div className="flex items-center gap-1 text-sm">
                            <Star size={14} className="text-yellow-500 fill-yellow-500" />
                            <span className="font-medium">{course.rating}</span>
                          </div>
                        )}
                        <ChevronRight className="text-gray-300" size={20} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
