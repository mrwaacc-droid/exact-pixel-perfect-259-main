import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { StudentShell } from "@/components/student/StudentShell";
import {
  Video,
  Clock,
  BookOpen,
  BarChart2,
  CheckCircle2,
  Calendar,
  Search,
  ChevronRight,
  PlayCircle,
  Sparkles,
  FileText,
  Loader2,
  Users,
} from "lucide-react";
import { requireStudent } from "@/lib/route-guards";
import { getStudentSessions } from "@/lib/student.functions";
import { joinSession } from "@/lib/teacher-availability.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/student/sessions")({
  beforeLoad: (ctx) => requireStudent(ctx.context),
  component: StudentSessions,
});

type Filter = "all" | "completed" | "in-progress" | "upcoming";

const STATUS_META = {
  completed: {
    label: "Completed",
    color: "#15803D",
    bg: "#DCFCE7",
    border: "#BBF7D0",
    iconBg: "linear-gradient(135deg, #bbf7d0, #dcfce7)",
    iconColor: "#15803D",
  },
  "in-progress": {
    label: "In Progress",
    color: "#521326",
    bg: "#F7E7EA",
    border: "#F7E7EA",
    iconBg: "linear-gradient(135deg, #F7E7EA, #F7E7EA)",
    iconColor: "#7D2233",
  },
  upcoming: {
    label: "Upcoming",
    color: "var(--muted)",
    bg: "var(--beige-soft)",
    border: "var(--border)",
    iconBg: "linear-gradient(135deg, #E7DAD1, #FBF8F5)",
    iconColor: "#8A7478",
  },
} as const;

function formatWhen(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000);
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (diffDays <= 0) return `Today at ${time}`;
  if (diffDays === 1) return `Yesterday at ${time}`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString();
}

function toUiStatus(db: "live" | "completed" | "scheduled"): keyof typeof STATUS_META {
  if (db === "live") return "in-progress";
  if (db === "completed") return "completed";
  return "upcoming";
}

function StudentSessions() {
  const router = useRouter();
  const fn = useServerFn(getStudentSessions);
  const q = useQuery({ queryKey: ["student-sessions"], queryFn: () => fn() });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const joinFn = useServerFn(joinSession);
  const joinMutation = useMutation({
    mutationFn: (sessionId: string) => joinFn({ data: { session_id: sessionId } }),
    onSuccess: (_result, sessionId) => {
      toast.success("Joined the session!");
      void router.navigate({ to: `/classroom/session/${sessionId}` });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const sessions = q.data?.sessions ?? [];

  const mapped = useMemo(
    () =>
      sessions.map((s: any) => ({
        id: s.id as string,
        title: s.lessonTitle as string,
        course: s.courseTitle as string,
        date: formatWhen(s.startedAt),
        duration: s.durationMinutes ? `${s.durationMinutes} min` : "—",
        notesCount: s.notesCount as number,
        status: toUiStatus(s.status),
      })),
    [sessions],
  );

  const filtered = mapped.filter((s) => {
    const qq = query.toLowerCase();
    const matchQ = s.title.toLowerCase().includes(qq) || s.course.toLowerCase().includes(qq);
    const matchF = filter === "all" || s.status === filter;
    return matchQ && matchF;
  });

  const completedCount = mapped.filter((s) => s.status === "completed").length;
  const notesTotal = mapped.reduce((a, s) => a + s.notesCount, 0);

  return (
    <StudentShell title="Sessions">
      <div className="kr-stat-strip kr-stat-strip--3 mb-6">
        <div className="kr-stat-card-item kr-stat-card-item--success">
          <div className="mb-2 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </div>
          <p className="kr-stat-value text-green-700">{completedCount}</p>
          <p className="kr-stat-label">Completed</p>
        </div>
        <div className="kr-stat-card-item kr-stat-card-item--brand">
          <div className="mb-2 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-crimson" />
          </div>
          <p className="kr-stat-value text-crimson">{mapped.length}</p>
          <p className="kr-stat-label">Total Sessions</p>
        </div>
        <div className="kr-stat-card-item">
          <div className="mb-2 flex items-center justify-center">
            <FileText className="h-4 w-4 text-[#8A7478]" />
          </div>
          <p className="kr-stat-value text-[#191314]">{notesTotal}</p>
          <p className="kr-stat-label">Notes Created</p>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A89890]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sessions…"
            className="w-full rounded-xl border border-[var(--border)] bg-white py-2.5 pl-10 pr-4 text-sm focus:border-crimson focus:outline-none focus:ring-2 focus:ring-crimson/20"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "completed", "in-progress", "upcoming"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                filter === f
                  ? "bg-crimson text-white shadow-sm"
                  : "border border-[var(--border)] bg-white text-[#8A7478] hover:border-crimson/40 hover:text-crimson"
              }`}
            >
              {f === "all" ? "All" : f === "in-progress" ? "In Progress" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {q.isLoading ? (
          <p className="text-sm text-[#8A7478]">Loading sessions…</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white">
            <div className="kr-empty-state">
              <div className="kr-empty-state-icon">
                <Video className="h-6 w-6 text-crimson" />
              </div>
              <h3>No sessions found</h3>
              <p>
                {query
                  ? `No sessions match "${query}". Try a different search term.`
                  : "You haven't started any sessions yet. Enter a classroom to begin."}
              </p>
              {!query && (
                <Link
                  to="/student/courses"
                  className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-crimson px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-crimson-dark"
                >
                  <PlayCircle className="h-4 w-4" /> Browse Courses
                </Link>
              )}
            </div>
          </div>
        ) : (
          filtered.map((session) => {
            const sm = STATUS_META[session.status];
            return (
              <div
                key={session.id}
                className="group flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-white p-4 transition-all hover:border-crimson/30 hover:shadow-md sm:flex-row sm:items-center"
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm"
                  style={{ background: sm.iconBg }}
                >
                  <Video className="h-5 w-5" style={{ color: sm.iconColor }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-[#191314]">{session.title}</h3>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{ background: sm.bg, color: sm.color, border: `1px solid ${sm.border}` }}
                    >
                      {sm.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-[#8A7478]">{session.course}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-[#A89890]">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {session.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {session.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" /> {session.notesCount} notes
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end sm:gap-1.5">
                  {session.status === "completed" ? (
                    <Link
                      to="/student/sessions/$sessionId/summary"
                      params={{ sessionId: session.id }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[#8A7478] transition-all hover:bg-[var(--page-background)] hover:border-crimson/30"
                    >
                      <BarChart2 className="h-3.5 w-3.5" /> Summary
                    </Link>
                  ) : session.status === "in-progress" ? (
                    <button
                      type="button"
                      onClick={() => joinMutation.mutate(session.id)}
                      disabled={joinMutation.isPending}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-crimson px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-crimson-dark disabled:opacity-60"
                    >
                      {joinMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <PlayCircle className="h-4 w-4" />
                      )}
                      Join Class <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => joinMutation.mutate(session.id)}
                      disabled={joinMutation.isPending}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--page-background)] px-3 py-2 text-xs font-semibold text-[var(--muted)] transition-all hover:border-crimson/30 hover:bg-crimson-soft disabled:opacity-60"
                    >
                      {joinMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Calendar className="h-3.5 w-3.5" />
                      )}
                      Reserve Slot
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </StudentShell>
  );
}
