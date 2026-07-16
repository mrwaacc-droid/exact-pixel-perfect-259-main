import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/shared/DashboardShell";
import { dashboardConfigs } from "@/lib/dashboard-config";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";
import {
  BookOpen,
  Users,
  Play,
  BarChart2,
  ChevronRight,
  Clock,
  CheckCircle2,
  Search,
  TrendingUp,
} from "lucide-react";
import { requireInstitutionStaff } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/teacher/courses")({
  beforeLoad: (ctx) => requireInstitutionStaff(ctx.context),
  component: TeacherCourses,
});

type Course = {
  id: string;
  title: string;
  subject: string;
  institution: string;
  students: number;
  lessons: number;
  lessonsTotal: number;
  progress: number;
  nextSession: string;
  status: "active" | "paused" | "completed";
  description: string;
};

const COURSES: Course[] = [
  {
    id: "course_math",
    title: "Mathematics Form 2",
    subject: "Mathematics",
    institution: "Klassruum Demo Academy",
    students: 32,
    lessons: 12,
    lessonsTotal: 28,
    progress: 65,
    nextSession: "Today, 10:30 AM",
    status: "active",
    description:
      "Algebra, quadratic equations, linear functions, and geometry for Form 2 students.",
  },
  {
    id: "course_chem",
    title: "KCSE Chemistry Revision",
    subject: "Chemistry",
    institution: "Klassruum Demo Academy",
    students: 45,
    lessons: 18,
    lessonsTotal: 24,
    progress: 42,
    nextSession: "Today, 2:00 PM",
    status: "active",
    description:
      "Comprehensive revision covering organic chemistry, reactions, and the periodic table.",
  },
  {
    id: "course_cs",
    title: "Computer Studies Basics",
    subject: "Computer Science",
    institution: "Klassruum Demo Academy",
    students: 28,
    lessons: 9,
    lessonsTotal: 15,
    progress: 78,
    nextSession: "Tomorrow, 9:00 AM",
    status: "active",
    description: "Introduction to computing, web development fundamentals, and basic programming.",
  },
];

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: "from-[#7D2233] to-[#521326]",
  Chemistry: "from-[#059669] to-[#047857]",
  "Computer Science": "from-[#7c3aed] to-[#6d28d9]",
};

const SUBJECT_PROGRESS_COLORS: Record<string, string> = {
  Mathematics: "from-[#7D2233] to-[#521326]",
  Chemistry: "from-[#047857] to-[#059669]",
  "Computer Science": "from-[#6d28d9] to-[#7c3aed]",
};

const config = dashboardConfigs.teacher;

function TeacherCourses() {
  const [query, setQuery] = useState("");

  const filtered = COURSES.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.subject.toLowerCase().includes(query.toLowerCase()),
  );

  const totalStudents = COURSES.reduce((s, c) => s + c.students, 0);
  const totalLessons = COURSES.reduce((s, c) => s + c.lessons, 0);
  const avgProgress = Math.round(COURSES.reduce((s, c) => s + c.progress, 0) / COURSES.length);

  return (
    <DashboardShell config={config} activePath="/teacher/courses">
      <PageHeader
        label="Teaching load"
        title="My Courses"
        subtitle="All courses you are responsible for — track progress, manage lessons, and start sessions."
      />

      {/* Summary Stats — responsive 2-up on mobile, 3-up on desktop */}
      <div className="kr-stat-strip kr-stat-strip--3 mb-6">
        <div className="kr-stat-card-item">
          <div className="flex items-center justify-center mb-2">
            <BookOpen className="h-4 w-4 text-[#6B7280]" />
          </div>
          <p className="kr-stat-value text-[#221C1D]">{COURSES.length}</p>
          <p className="kr-stat-label">Active Courses</p>
        </div>
        <div className="kr-stat-card-item">
          <div className="flex items-center justify-center mb-2">
            <Users className="h-4 w-4 text-[#6B7280]" />
          </div>
          <p className="kr-stat-value text-[#221C1D]">{totalStudents}</p>
          <p className="kr-stat-label">Total Students</p>
        </div>
        <div className="kr-stat-card-item kr-stat-card-item--brand">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="h-4 w-4 text-[var(--crimson)]" />
          </div>
          <p className="kr-stat-value text-[var(--crimson)]">{avgProgress}%</p>
          <p className="kr-stat-label">Avg. Progress</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses…"
          className="w-full rounded-xl border border-[#E5E7EB] bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[var(--crimson)] focus:outline-none focus:ring-2 focus:ring-[var(--crimson)]/20"
        />
      </div>

      {/* Course Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
          <div className="kr-empty-state">
            <div className="kr-empty-state-icon">
              <BookOpen className="h-6 w-6 text-[var(--crimson)]" />
            </div>
            <h3>No courses found</h3>
            <p>No courses match "{query}". Try a different search term.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map((course) => {
            const gradClass = SUBJECT_COLORS[course.subject] ?? "from-[#4B5563] to-[#374151]";
            const progressGrad =
              SUBJECT_PROGRESS_COLORS[course.subject] ?? "from-[#4B5563] to-[#374151]";
            return (
              <article
                key={course.id}
                className="rounded-2xl border border-[#E5E7EB] bg-white p-6 transition-all hover:border-[var(--crimson)]/30 hover:shadow-md"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  {/* Subject icon */}
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradClass} text-base font-bold text-white shadow-md`}
                  >
                    {course.title.slice(0, 2)}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-[#221C1D]">{course.title}</h3>
                          <StatusBadge variant="success">Active</StatusBadge>
                        </div>
                        <p className="text-sm text-[#6B7280]">{course.institution}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-[#6B7280] line-clamp-1">{course.description}</p>

                    {/* Stats row */}
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[#6B7280]">
                      <span className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" /> {course.students} students
                      </span>
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4" /> {course.lessons}/{course.lessonsTotal}{" "}
                        lessons
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" /> Next: {course.nextSession}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-green-500" /> {course.progress}%
                        complete
                      </span>
                    </div>

                    {/* Subject-colored progress bar */}
                    <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${progressGrad} transition-all`}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                    <Link
                      to="/teacher/courses/$courseId/lessons"
                      params={{ courseId: course.id }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--crimson)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--crimson-dark)]"
                    >
                      <Play className="h-4 w-4" />
                      Choose Lesson
                    </Link>
                    <Link
                      to="/teacher/courses/$courseId/analytics"
                      params={{ courseId: course.id }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] px-4 py-2 text-sm font-semibold text-[#6B7280] hover:bg-[#FBF8F5] hover:border-[var(--crimson)]/30 transition-all"
                    >
                      <BarChart2 className="h-4 w-4" />
                      Analytics
                    </Link>
                    <Link
                      to="/teacher/lessons"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--crimson)] hover:text-[var(--crimson-dark)] transition-colors"
                    >
                      Manage lessons <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
