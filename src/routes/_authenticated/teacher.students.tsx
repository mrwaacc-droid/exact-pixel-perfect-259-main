import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/shared/DashboardShell";
import { dashboardConfigs } from "@/lib/dashboard-config";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";
import {
  Users,
  Search,
  BookOpen,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Flame,
  HelpCircle,
} from "lucide-react";
import { requireTeacher } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/teacher/students")({
  beforeLoad: (ctx) => requireTeacher(ctx.context),
  component: TeacherStudents,
});

type StudentStatus = "on-track" | "at-risk" | "needs-help" | "excelling";

type Student = {
  id: string;
  name: string;
  avatar: string;
  course: string;
  progress: number;
  lastActive: string;
  quizAvg: number;
  status: StudentStatus;
  streak: number;
  questionsAsked: number;
};

const STUDENTS: Student[] = [
  {
    id: "s1",
    name: "Amara Diallo",
    avatar: "AD",
    course: "Mathematics Form 2",
    progress: 78,
    lastActive: "2 hours ago",
    quizAvg: 91,
    status: "excelling",
    streak: 12,
    questionsAsked: 8,
  },
  {
    id: "s2",
    name: "Brian Omondi",
    avatar: "BO",
    course: "Mathematics Form 2",
    progress: 52,
    lastActive: "Today",
    quizAvg: 73,
    status: "on-track",
    streak: 5,
    questionsAsked: 3,
  },
  {
    id: "s3",
    name: "Chidinma Eze",
    avatar: "CE",
    course: "KCSE Chemistry Revision",
    progress: 35,
    lastActive: "3 days ago",
    quizAvg: 58,
    status: "at-risk",
    streak: 0,
    questionsAsked: 1,
  },
  {
    id: "s4",
    name: "Daniel Mwangi",
    avatar: "DM",
    course: "Computer Studies Basics",
    progress: 90,
    lastActive: "1 hour ago",
    quizAvg: 95,
    status: "excelling",
    streak: 18,
    questionsAsked: 12,
  },
  {
    id: "s5",
    name: "Fatima Bello",
    avatar: "FB",
    course: "KCSE Chemistry Revision",
    progress: 42,
    lastActive: "Yesterday",
    quizAvg: 65,
    status: "on-track",
    streak: 3,
    questionsAsked: 5,
  },
  {
    id: "s6",
    name: "George Kamau",
    avatar: "GK",
    course: "Mathematics Form 2",
    progress: 18,
    lastActive: "5 days ago",
    quizAvg: 44,
    status: "needs-help",
    streak: 0,
    questionsAsked: 0,
  },
  {
    id: "s7",
    name: "Halima Mussa",
    avatar: "HM",
    course: "Computer Studies Basics",
    progress: 65,
    lastActive: "Today",
    quizAvg: 82,
    status: "on-track",
    streak: 7,
    questionsAsked: 6,
  },
  {
    id: "s8",
    name: "Ibrahim Juma",
    avatar: "IJ",
    course: "KCSE Chemistry Revision",
    progress: 28,
    lastActive: "2 days ago",
    quizAvg: 51,
    status: "at-risk",
    streak: 1,
    questionsAsked: 2,
  },
];

const STATUS_META: Record<
  StudentStatus,
  {
    label: string;
    variant: "success" | "warning" | "info" | "neutral" | "error";
    icon: typeof CheckCircle2;
    color: string;
  }
> = {
  excelling: { label: "Excelling", variant: "success", icon: TrendingUp, color: "text-green-600" },
  "on-track": {
    label: "On Track",
    variant: "info",
    icon: CheckCircle2,
    color: "text-[var(--crimson)]",
  },
  "at-risk": {
    label: "At Risk",
    variant: "warning",
    icon: TrendingDown,
    color: "text-amber-600",
  },
  "needs-help": {
    label: "Needs Help",
    variant: "error",
    icon: AlertTriangle,
    color: "text-red-600",
  },
};

const AVATAR_COLORS = [
  "from-[#7D2233] to-[#521326]",
  "from-green-600 to-emerald-400",
  "from-purple-600 to-violet-400",
  "from-rose-600 to-pink-400",
  "from-amber-600 to-yellow-400",
  "from-cyan-600 to-sky-400",
  "from-[#7D2233] to-[#7D2233]",
  "from-indigo-600 to-indigo-400",
];

const config = dashboardConfigs.teacher;

function TeacherStudents() {
  const [query, setQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StudentStatus | "all">("all");

  const courses = Array.from(new Set(STUDENTS.map((s) => s.course)));

  const filtered = STUDENTS.filter((s) => {
    const q = query.toLowerCase();
    const matchQ = s.name.toLowerCase().includes(q) || s.course.toLowerCase().includes(q);
    const matchCourse = courseFilter === "all" || s.course === courseFilter;
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchQ && matchCourse && matchStatus;
  });

  const needsHelp = STUDENTS.filter(
    (s) => s.status === "needs-help" || s.status === "at-risk",
  ).length;

  const stats = [
    {
      label: "Total Students",
      value: STUDENTS.length,
      icon: Users,
      color: "text-[#191314]",
      variant: "",
    },
    {
      label: "Excelling",
      value: STUDENTS.filter((s) => s.status === "excelling").length,
      icon: TrendingUp,
      color: "text-green-600",
      variant: "kr-stat-card-item--success",
    },
    {
      label: "At Risk",
      value: STUDENTS.filter((s) => s.status === "at-risk").length,
      icon: TrendingDown,
      color: "text-amber-600",
      variant: "kr-stat-card-item--warning",
    },
    {
      label: "Need Help",
      value: STUDENTS.filter((s) => s.status === "needs-help").length,
      icon: AlertTriangle,
      color: "text-red-600",
      variant: "kr-stat-card-item--danger",
    },
  ];

  return (
    <DashboardShell config={config} activePath="/teacher/students">
      <PageHeader
        label="Student management"
        title="My Students"
        subtitle="Monitor learner progress, identify at-risk students, and engage with questions across all your courses."
      />

      {/* Alert for at-risk */}
      {needsHelp > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-sm font-semibold text-amber-800">
            {needsHelp} student{needsHelp > 1 ? "s" : ""} may need your attention — low progress or
            inactive for 3+ days.
          </p>
        </div>
      )}

      {/* Stats Strip — responsive 2-up on mobile, 4-up on desktop */}
      <div className="kr-stat-strip kr-stat-strip--4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className={`kr-stat-card-item ${stat.variant}`}>
            <div className="flex items-center justify-center mb-2">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <p className={`kr-stat-value ${stat.color}`}>{stat.value}</p>
            <p className="kr-stat-label">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A89890]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students…"
            className="w-full rounded-xl border border-[var(--border)] bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[var(--crimson)] focus:outline-none focus:ring-2 focus:ring-[var(--crimson)]/20"
          />
        </div>
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[#191314] focus:border-[var(--crimson)] focus:outline-none"
        >
          <option value="all">All Courses</option>
          {courses.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StudentStatus | "all")}
          className="rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[#191314] focus:border-[var(--crimson)] focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="excelling">Excelling</option>
          <option value="on-track">On Track</option>
          <option value="at-risk">At Risk</option>
          <option value="needs-help">Needs Help</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        /* Premium empty state */
        <div className="rounded-2xl border border-[var(--border)] bg-white">
          <div className="kr-empty-state">
            <div className="kr-empty-state-icon">
              <Users className="h-6 w-6 text-[var(--crimson)]" />
            </div>
            <h3>No students match your filters</h3>
            <p>Try adjusting your search term, course, or status filter.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop / Tablet: scrollable table (hidden on mobile) */}
          <div className="kr-hide-on-mobile kr-table-wrap rounded-2xl border border-[var(--border)] bg-white">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="border-b border-[var(--border)] bg-[var(--page-background)]">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#8A7478]">
                    Student
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#8A7478]">
                    Course
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#8A7478]">
                    Progress
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#8A7478]">
                    Quiz Avg
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#8A7478]">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#8A7478]">
                    Last Active
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--beige-soft)]">
                {filtered.map((student, idx) => {
                  const sm = STATUS_META[student.status];
                  const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                  return (
                    <tr key={student.id} className="hover:bg-[var(--page-background)] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarColor} text-xs font-bold text-white shadow-sm`}
                          >
                            {student.avatar}
                          </div>
                          <div>
                            <p className="font-semibold text-[#191314]">{student.name}</p>
                            <p className="text-xs text-[#A89890]">
                              🔥 {student.streak} day streak · {student.questionsAsked} questions
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="flex items-center gap-1.5 text-[#8A7478]">
                          <BookOpen className="h-3.5 w-3.5 shrink-0" />
                          <span className="text-xs">{student.course}</span>
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-[var(--border)]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-crimson to-crimson transition-all"
                              style={{ width: `${student.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-[#8A7478]">
                            {student.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-sm font-bold ${student.quizAvg >= 80 ? "text-green-600" : student.quizAvg >= 60 ? "text-amber-600" : "text-red-600"}`}
                        >
                          {student.quizAvg}%
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge variant={sm.variant}>{sm.label}</StatusBadge>
                      </td>
                      <td className="px-5 py-4">
                        <span className="flex items-center gap-1 text-xs text-[#A89890]">
                          <Clock className="h-3 w-3" /> {student.lastActive}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-semibold text-[#8A7478] hover:bg-[var(--beige-soft)] hover:border-[var(--crimson)]/30 transition-all">
                          <MessageSquare className="h-3 w-3" /> Message
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile: card list (shown only on small screens) */}
          <div className="kr-mobile-card-list">
            {filtered.map((student, idx) => {
              const sm = STATUS_META[student.status];
              const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              return (
                <div key={student.id} className="kr-person-card">
                  {/* Top row: avatar + name + status */}
                  <div className="kr-person-card-top">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarColor} text-sm font-bold text-white shadow-sm`}
                    >
                      {student.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#191314] text-sm">{student.name}</p>
                      <p className="text-xs text-[#8A7478] truncate">{student.course}</p>
                    </div>
                    <StatusBadge variant={sm.variant}>{sm.label}</StatusBadge>
                  </div>

                  {/* Stats row */}
                  <div className="kr-person-card-meta">
                    <span className="flex items-center gap-1 text-xs text-[#8A7478]">
                      <Flame className="h-3 w-3 text-orange-500" />
                      {student.streak}d streak
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#8A7478]">
                      <HelpCircle className="h-3 w-3 text-[#A89890]" />
                      {student.questionsAsked} questions
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#8A7478]">
                      <Clock className="h-3 w-3 text-[#A89890]" />
                      {student.lastActive}
                    </span>
                  </div>

                  {/* Progress row */}
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-[#8A7478]">Progress</span>
                      <span className="font-bold text-[#191314]">{student.progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[var(--border)]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-crimson to-crimson"
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Quiz average + message */}
                  <div className="kr-person-card-actions">
                    <span
                      className={`text-xs font-bold ${student.quizAvg >= 80 ? "text-green-600" : student.quizAvg >= 60 ? "text-amber-600" : "text-red-600"}`}
                    >
                      Quiz avg: {student.quizAvg}%
                    </span>
                    <button className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[#8A7478] hover:bg-[var(--beige-soft)] transition-colors">
                      <MessageSquare className="h-3.5 w-3.5" /> Message
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </DashboardShell>
  );
}
