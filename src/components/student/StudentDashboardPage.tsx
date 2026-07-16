import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Accessibility,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  Monitor,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { type DashboardConfig } from "@/lib/dashboard-config";
import { DashboardShell } from "@/components/dashboard/shared/DashboardShell";
import { KpiCard } from "@/components/dashboard/shared/KpiCard";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";
import { DashboardLoadingState } from "@/components/dashboard/shared/DashboardLoadingState";
import { useDashboardConfig } from "@/hooks/useDashboardConfig";
import { getStudentDashboard } from "@/lib/student.functions";

function getLearnerDashboardCopy(role: DashboardConfig["role"]) {
  switch (role) {
    case "private_learner":
      return {
        welcomeLabel: "Welcome back",
        heroTitle: "Continue your personal learning journey",
        heroDescription:
          "Your private courses, lesson history, and teacher guidance are ready for the next step.",
        primaryActionLabel: "Continue Learning",
      };
    case "teacher_enrolled_learner":
      return {
        welcomeLabel: "Welcome back",
        heroTitle: "Continue learning with your teacher",
        heroDescription:
          "Your teacher-assigned lessons, support materials, and next session are ready for you.",
        primaryActionLabel: "Join Session",
      };
    case "institution_learner":
      return {
        welcomeLabel: "Welcome back",
        heroTitle: "Continue your institution learning journey",
        heroDescription:
          "Your next class is ready. Continue from where you left off and stay on track with your institution programme.",
        primaryActionLabel: "Enter Classroom",
      };
    default:
      return {
        welcomeLabel: "Welcome back",
        heroTitle: "Continue your learning journey",
        heroDescription:
          "Your next classroom is ready. Continue from where you left off and keep building your skills.",
        primaryActionLabel: "Enter Classroom",
      };
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function classroomStartHref(lessonId?: string | null, sessionId?: string | null) {
  if (sessionId && UUID_RE.test(sessionId)) return `/classroom/session/${sessionId}`;
  if (lessonId && UUID_RE.test(lessonId)) return `/classroom/${lessonId}`;
  return "/student/classrooms";
}

function classroomGlyph(title: string) {
  const t = title.toLowerCase();
  if (t.includes("math")) return "x²";
  if (t.includes("chem")) return "Chem";
  if (t.includes("phys")) return "Phy";
  if (t.includes("bio")) return "Bio";
  if (t.includes("eng")) return "Eng";
  if (t.includes("ai") || t.includes("kingpin")) return "AI";
  return "📖";
}

function formatStudyTime(minutes: number) {
  if (minutes <= 0) return "0m";
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatSessionWhen(startedAt?: string) {
  if (!startedAt) return "Recently";
  const date = new Date(startedAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays <= 0) return `Today at ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

export function StudentDashboardPage() {
  const config = useDashboardConfig();
  const copy = getLearnerDashboardCopy(config.role);
  const fn = useServerFn(getStudentDashboard);
  const q = useQuery({ queryKey: ["student-dashboard"], queryFn: () => fn() });

  if (q.isLoading) {
    return (
      <DashboardShell config={config} activePath="/student/dashboard">
        <DashboardLoadingState type="skeleton" />
      </DashboardShell>
    );
  }

  if (q.isError) {
    return (
      <DashboardShell config={config} activePath="/student/dashboard">
        <DashboardLoadingState
          type="error"
          message="We couldn't load your dashboard. Please try again."
        />
      </DashboardShell>
    );
  }

  const data = q.data;
  if (!data) {
    return (
      <DashboardShell config={config} activePath="/student/dashboard">
        <DashboardLoadingState type="skeleton" />
      </DashboardShell>
    );
  }
  const hasCourses = (data.courses?.length ?? 0) > 0;
  const continueLearning = data.continueLearning;
  const hasContinue = Boolean(continueLearning?.lessonId || continueLearning?.courseId);
  const kpis = data.kpis;
  const learningPlan = data.learningPlan ?? [];

  return (
    <DashboardShell config={config} activePath="/student/dashboard" title={config.title}>
      {/* Hero + Continue learning */}
      <section className="mb-5 grid gap-5 xl:grid-cols-[1fr_1.22fr]">
        <div className="relative overflow-hidden rounded-[22px] border border-[#DCE8F7] bg-gradient-to-br from-white via-[#F6FAFF] to-[#EAF3FF] p-7 shadow-[0_18px_45px_rgba(25, 19, 20,0.08)]">
          <div className="relative z-10 max-w-full xl:max-w-[58%]">
            <p className="text-sm font-bold text-[#7D2233]">{copy.welcomeLabel}</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#191314]">
              {copy.heroTitle}
            </h1>
            <p className="mt-4 text-sm leading-7 text-[#3D3233]">{copy.heroDescription}</p>
            {hasContinue ? (
              <Link
                to={classroomStartHref(continueLearning.lessonId, continueLearning.sessionId) as any}
                className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#7D2233] px-6 text-sm font-bold text-white shadow-lg shadow-[#7D2233]/25 transition-all hover:bg-[#521326]"
              >
                {copy.primaryActionLabel}
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                to="/student/courses"
                className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#7D2233] px-6 text-sm font-bold text-white shadow-lg shadow-[#7D2233]/25 transition-all hover:bg-[#521326]"
              >
                Browse Courses
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          <div className="absolute bottom-5 right-8 grid h-44 w-52 place-items-center">
            <div className="absolute h-36 w-48 rounded-[44px] bg-[#F7E7EA]" />
            <div className="relative grid h-28 w-36 place-items-center rounded-3xl bg-white shadow-xl shadow-[#7D2233]/10">
              <BookOpen className="h-16 w-16 text-[#521326]" />
              <Award className="absolute -right-4 -top-4 h-11 w-11 rounded-2xl bg-[#F7E7EA] p-2 text-[#7D2233] shadow-md" />
            </div>
          </div>
        </div>

        {hasContinue ? (
          <div className="rounded-[22px] border border-[#DCE8F7] bg-white p-7 shadow-[0_18px_45px_rgba(25, 19, 20,0.08)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#7D2233] text-2xl font-black text-white shadow-lg shadow-[#7D2233]/25">
                {classroomGlyph(continueLearning.lessonTitle || continueLearning.courseTitle)}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-extrabold tracking-tight text-[#191314]">
                  {continueLearning.lessonTitle || "Continue your lesson"}
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">{continueLearning.courseTitle}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusBadge variant="success">AI Teacher Ready</StatusBadge>
                  {data.accessProfile.captionsEnabled && (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-[#F0D7DC] bg-[#F7E7EA] px-3 py-1 text-xs font-bold text-[#521326]">
                      <Eye className="h-3.5 w-3.5" />
                      Captions On
                    </span>
                  )}
                  {data.accessProfile.audioEnabled && (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-1 text-xs font-bold text-[#15803D]">
                      <Zap className="h-3.5 w-3.5" />
                      Voice On
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="text-sm text-[#3D3233]">
                  <span className="font-bold">Current Step:</span>{" "}
                  {continueLearning.currentStep || "hook"}
                </p>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#F7E7EA]">
                  <div
                    className="h-full rounded-full bg-[#7D2233]"
                    style={{ width: `${continueLearning.progressPercentage}%` }}
                  />
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-2xl font-extrabold text-[#521326]">
                  {continueLearning.progressPercentage}%
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Link
                to={classroomStartHref(continueLearning.lessonId, continueLearning.sessionId) as any}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#7D2233] px-4 text-sm font-bold text-white transition-all hover:bg-[#521326]"
              >
                {copy.primaryActionLabel}
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                to="/student/notes"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#F7E7EA] bg-white px-4 text-sm font-bold text-[#521326] transition-all hover:bg-[#F7E7EA]"
              >
                Review Notes
              </Link>
              <Link
                to="/student/quizzes"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#F7E7EA] bg-white px-4 text-sm font-bold text-[#521326] transition-all hover:bg-[#F7E7EA]"
              >
                Quick Quiz
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center rounded-[22px] border border-dashed border-[#F0D7DC] bg-white p-7 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7E7EA] text-[#7D2233]">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-extrabold text-[#191314]">Start your first lesson</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {hasCourses
                ? "Pick up a course below and enter the AI classroom to begin."
                : "Browse the catalog, enroll in a course, and your continue-learning card will appear here."}
            </p>
            <Link
              to="/student/courses"
              className="mt-4 inline-flex h-11 w-fit items-center justify-center gap-2 rounded-xl bg-[#7D2233] px-5 text-sm font-bold text-white transition-all hover:bg-[#521326]"
            >
              {hasCourses ? "Go to My Courses" : "Browse Catalog"}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>

      {/* KPIs */}
      <section className="kr-dashboard-kpi-grid mb-5">
        <KpiCard
          title="My Classrooms"
          value={String(kpis.classroomCount)}
          subtitle="Active classrooms"
          href="/student/classrooms"
          icon={Monitor}
        />
        <KpiCard
          title="Completed Lessons"
          value={String(kpis.completedLessonsThisMonth)}
          subtitle="This month"
          href="/student/progress"
          icon={CheckCircle2}
        />
        <KpiCard
          title="Study Time"
          value={formatStudyTime(kpis.studyTimeMinutesThisWeek)}
          subtitle="This week"
          href="/student/progress"
          icon={Clock}
        />
        <KpiCard
          title="Quiz Average"
          value={`${kpis.quizAverage}%`}
          subtitle="All attempts"
          href="/student/quizzes"
          icon={Star}
        />
        <KpiCard
          title="Current Streak"
          value={String(kpis.currentStreakDays)}
          subtitle="Days in a row"
          href="/student/progress"
          icon={Zap}
        />
      </section>

      {/* Classrooms / Today's plan / Recent sessions */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.22fr_.75fr_.95fr]">
        <div className="rounded-[18px] border border-[#DCE8F7] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#191314]">My Classrooms</h2>
              <p className="mt-0.5 text-sm text-[#8A7478]">Continue your active learning spaces</p>
            </div>
            <Link to="/student/classrooms" className="text-sm font-bold text-[#7D2233] hover:text-[#521326]">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {hasCourses ? (
              data.courses.slice(0, 4).map((course: any) => (
                <Link
                  key={course.id}
                  to={classroomStartHref(course.lessonId, course.sessionId) as any}
                  className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-[var(--border)] bg-white p-3 transition-all hover:border-[#F0D7DC] hover:bg-[#FCF4F5]"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#7D2233] text-sm font-black text-white">
                    {classroomGlyph(course.title)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-extrabold leading-snug text-[#191314]">
                      {course.title}
                    </h3>
                    <p className="truncate text-xs leading-snug text-[#8A7478]">
                      {course.institutionName || course.subject} · {course.completedLessons}/
                      {course.totalLessons} lessons
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-2 w-28 overflow-hidden rounded-full bg-[#F7E7EA]">
                        <div
                          className="h-full rounded-full bg-[#7D2233]"
                          style={{ width: `${course.progressPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-[#521326]">
                        {course.progressPercentage}%
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex h-9 shrink-0 items-center rounded-lg border border-[#F0D7DC] px-3 text-xs font-bold text-[#521326]">
                    Enter
                  </span>
                </Link>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-[#8A7478]">
                No classrooms yet. Enroll in a course to get started.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-[18px] border border-[#DCE8F7] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-[#191314]">Today's Plan</h3>
            <Calendar className="h-4 w-4 text-[#A89890]" />
          </div>
          <div className="space-y-3">
            {learningPlan.length > 0 ? (
              learningPlan.slice(0, 3).map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 rounded-xl p-3 ${index === 0 ? "bg-[#F7E7EA]" : "bg-[var(--page-background)]"}`}
                >
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${index === 0 ? "bg-[#7D2233] text-white" : "bg-[#F7E7EA] text-[#7D2233]"}`}
                  >
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#191314]">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-[#8A7478]">{item.description}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-[#8A7478]">
                No planned tasks right now. Start a lesson to build your plan.
              </p>
            )}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link
              to={classroomStartHref(continueLearning?.lessonId, continueLearning?.sessionId) as any}
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#7D2233] px-3 py-2 text-center text-sm font-bold leading-snug text-white"
            >
              Start Plan
            </Link>
            <Link
              to="/student/learning-plan"
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#F7E7EA] px-3 py-2 text-center text-sm font-bold leading-snug text-[#521326]"
            >
              Customize
            </Link>
          </div>
        </div>

        <div className="rounded-[18px] border border-[#DCE8F7] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#191314]">Recent Sessions</h2>
              <p className="mt-0.5 text-sm text-[#8A7478]">Your recent learning activity</p>
            </div>
            <Link to="/student/sessions" className="text-sm font-bold text-[#7D2233] hover:text-[#521326]">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {data.recentSessions.length > 0 ? (
              data.recentSessions.slice(0, 4).map((session: any) => (
                <Link
                  key={session.id}
                  to="/student/sessions/$sessionId/summary"
                  params={{ sessionId: session.id } as any}
                  className="grid grid-cols-[46px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-[var(--border)] bg-white p-3 transition-all hover:border-[#F0D7DC] hover:bg-[#FCF4F5]"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#7D2233] text-xs font-black text-white">
                    {classroomGlyph(session.lessonTitle || session.courseTitle)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-extrabold leading-snug text-[#191314]">
                      {session.lessonTitle}
                    </h3>
                    <p className="truncate text-xs leading-snug text-[#8A7478]">
                      {session.courseTitle}
                      {session.durationMinutes ? ` · ${session.durationMinutes} min` : ""}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold ${
                      session.status === "completed"
                        ? "bg-[#DCFCE7] text-[#15803D]"
                        : session.status === "live"
                          ? "bg-[#FEE2E2] text-[#B91C1C]"
                          : "bg-[#FEF3C7] text-[#B45309]"
                    }`}
                  >
                    {session.status === "completed"
                      ? "Completed"
                      : session.status === "live"
                        ? "Live"
                        : "Scheduled"}
                  </span>
                </Link>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-[#8A7478]">
                No sessions yet. Enter a classroom to start learning.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Learning access */}
      <section className="mt-5 rounded-[18px] border border-[#DCE8F7] bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_1.15fr_auto_auto] lg:items-center">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#F7E7EA] text-[#7D2233]">
              <Accessibility className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#191314]">Learning Access</h2>
              <p className="text-sm text-[var(--muted)]">{data.accessProfile.currentMode} profile</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              ["Teacher voice", data.accessProfile.audioEnabled ? "On" : "Off"],
              ["Captions", data.accessProfile.captionsEnabled ? "On" : "Off"],
              ["Keyboard shortcuts", data.accessProfile.keyboardShortcutsEnabled ? "On" : "Off"],
              ["Focus mode", data.accessProfile.focusModeEnabled ? "On" : "Off"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--page-background)] px-4 py-3">
                <p className="text-xs font-bold text-[#3D3233]">{label}</p>
                <p
                  className={`mt-1 text-sm font-extrabold ${value === "On" ? "text-[#16A34A]" : "text-[#8A7478]"}`}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
          <Link
            to="/student/access"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#7D2233] px-5 text-sm font-bold text-white"
          >
            Adjust Access
          </Link>
          <Link
            to="/student/access"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-[#F7E7EA] px-5 text-sm font-bold text-[#521326]"
          >
            Focus Mode
          </Link>
        </div>
      </section>
    </DashboardShell>
  );
}

export default StudentDashboardPage;
