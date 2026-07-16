import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/shared/DashboardShell";
import { dashboardConfigs } from "@/lib/dashboard-config";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";
import {
  Play,
  Clock,
  Users,
  Video,
  CheckCircle2,
  Calendar,
  BarChart2,
  Eye,
  Zap,
} from "lucide-react";
import { requireInstitutionStaff } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/teacher/sessions")({
  beforeLoad: (ctx) => requireInstitutionStaff(ctx.context),
  component: TeacherSessions,
});

type SessionStatus = "live" | "upcoming" | "completed" | "cancelled";

type Session = {
  id: string;
  title: string;
  course: string;
  date: string;
  time: string;
  duration: string;
  students: number;
  status: SessionStatus;
  mode: "AI-Assisted" | "Live Teaching" | "Self-paced";
  avgScore?: number;
  completionRate?: number;
};

const SESSIONS: Session[] = [
  {
    id: "sess_live_1",
    title: "Quadratic Equations",
    course: "Mathematics Form 2",
    date: "Today",
    time: "10:30 AM",
    duration: "45 min",
    students: 32,
    status: "live",
    mode: "AI-Assisted",
  },
  {
    id: "sess_up_2",
    title: "Chemical Reactions",
    course: "KCSE Chemistry Revision",
    date: "Today",
    time: "2:00 PM",
    duration: "40 min",
    students: 45,
    status: "upcoming",
    mode: "AI-Assisted",
  },
  {
    id: "sess_up_3",
    title: "HTML Basics",
    course: "Computer Studies Basics",
    date: "Tomorrow",
    time: "9:00 AM",
    duration: "35 min",
    students: 28,
    status: "upcoming",
    mode: "AI-Assisted",
  },
  {
    id: "sess_c_4",
    title: "Algebraic Expressions",
    course: "Mathematics Form 2",
    date: "Jun 9, 2026",
    time: "10:30 AM",
    duration: "42 min",
    students: 30,
    status: "completed",
    mode: "AI-Assisted",
    avgScore: 84,
    completionRate: 94,
  },
  {
    id: "sess_c_5",
    title: "Atomic Structure",
    course: "KCSE Chemistry Revision",
    date: "Jun 6, 2026",
    time: "2:00 PM",
    duration: "38 min",
    students: 42,
    status: "completed",
    mode: "AI-Assisted",
    avgScore: 78,
    completionRate: 88,
  },
  {
    id: "sess_c_6",
    title: "Python Introduction",
    course: "Computer Studies Basics",
    date: "Jun 5, 2026",
    time: "9:00 AM",
    duration: "41 min",
    students: 27,
    status: "completed",
    mode: "AI-Assisted",
    avgScore: 91,
    completionRate: 100,
  },
];

const STATUS_CONFIG: Record<
  SessionStatus,
  {
    label: string;
    variant: "success" | "warning" | "info" | "neutral" | "error";
    dotColor: string;
  }
> = {
  live: { label: "Live Now", variant: "info", dotColor: "var(--crimson)" },
  upcoming: { label: "Upcoming", variant: "neutral", dotColor: "#A89890" },
  completed: { label: "Completed", variant: "success", dotColor: "#22C55E" },
  cancelled: { label: "Cancelled", variant: "error", dotColor: "#EF4444" },
};

const config = dashboardConfigs.teacher;

function TeacherSessions() {
  const liveSessions = SESSIONS.filter((s) => s.status === "live");
  const upcomingSessions = SESSIONS.filter((s) => s.status === "upcoming");
  const completedSessions = SESSIONS.filter((s) => s.status === "completed");

  return (
    <DashboardShell config={config} activePath="/teacher/sessions">
      <PageHeader
        label="Classroom management"
        title="Teaching Sessions"
        subtitle="Monitor live sessions, prepare upcoming classes, and review completed lesson data."
      />

      {/* Live Now banner — teal brand color (not blue) */}
      {liveSessions.length > 0 && (
        <div className="mb-6 overflow-hidden rounded-2xl border-2 border-[#7D2233] bg-gradient-to-r from-[#F7E7EA] to-white p-5 relative">
          {/* Subtle top crimson glow */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#7D2233]/5 to-transparent" />
          <div className="relative flex items-center gap-3 mb-4">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--crimson)] opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--crimson)]" />
            </span>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[var(--crimson)]" />
              <h2 className="text-base font-bold text-[#191314]">Live Right Now</h2>
            </div>
            <span className="ml-auto rounded-full bg-[var(--crimson)]/10 px-2.5 py-1 text-xs font-bold text-[var(--crimson)]">
              {liveSessions.length} session{liveSessions.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="relative space-y-3">
            {liveSessions.map((s) => (
              <SessionRow key={s.id} session={s} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[var(--crimson)]" />
            <h2 className="text-lg font-bold text-[#191314]">Upcoming Sessions</h2>
          </div>
          <span className="rounded-full border border-[var(--border)] bg-white px-2.5 py-1 text-xs font-semibold text-[#8A7478]">
            {upcomingSessions.length} scheduled
          </span>
        </div>
        <div className="space-y-3">
          {upcomingSessions.map((s) => (
            <SessionRow key={s.id} session={s} />
          ))}
        </div>
      </section>

      {/* Completed */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <h2 className="text-lg font-bold text-[#191314]">Completed Sessions</h2>
          </div>
          <span className="rounded-full border border-[var(--border)] bg-white px-2.5 py-1 text-xs font-semibold text-[#8A7478]">
            {completedSessions.length} sessions
          </span>
        </div>
        <div className="space-y-3">
          {completedSessions.map((s) => (
            <SessionRow key={s.id} session={s} />
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}

function SessionRow({ session }: { session: Session }) {
  const sc = STATUS_CONFIG[session.status];
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-white p-4 transition-all hover:border-[var(--crimson)]/30 hover:shadow-sm sm:flex-row sm:items-center">
      {/* Video icon with brand-consistent background */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F7E7EA] to-[#F7E7EA]">
        <Video className="h-5 w-5 text-[#7D2233]" />
      </div>

      {/* Main info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-bold text-[#191314]">{session.title}</h3>
          <StatusBadge variant={sc.variant}>{sc.label}</StatusBadge>
          <span className="rounded-full border border-[var(--border)] bg-[var(--page-background)] px-2 py-0.5 text-xs font-semibold text-[#8A7478]">
            {session.mode}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-[#8A7478]">{session.course}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-[#A89890]">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {session.date} · {session.time}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {session.duration}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" /> {session.students} students
          </span>
          {session.avgScore !== undefined && (
            <span className="font-semibold text-green-600">Avg score: {session.avgScore}%</span>
          )}
          {session.completionRate !== undefined && (
            <span className="font-semibold text-[var(--crimson)]">
              {session.completionRate}% completed
            </span>
          )}
        </div>
      </div>

      {/* Actions — consistent sizing across states */}
      <div className="flex shrink-0 items-center gap-2">
        {session.status === "live" || session.status === "upcoming" ? (
          <Link
            to="/teacher/sessions/$sessionId"
            params={{ sessionId: session.id }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--crimson)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--crimson-dark)]"
          >
            <Play className="h-4 w-4" />
            {session.status === "live" ? "Open studio" : "Prepare"}
          </Link>
        ) : (
          <>
            <Link
              to="/teacher/analytics"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[#8A7478] hover:bg-[var(--page-background)] hover:border-[var(--crimson)]/30 transition-all"
            >
              <BarChart2 className="h-4 w-4" />
              Results
            </Link>
            <Link
              to="/demo/ai-video"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[#8A7478] hover:bg-[var(--page-background)] hover:border-[var(--crimson)]/30 transition-all"
            >
              <Eye className="h-4 w-4" />
              Replay
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
