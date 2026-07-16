import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { StudentShell } from "@/components/student/StudentShell";
import { Clock, MessageCircle, FileText, ChevronRight } from "lucide-react";
import { requireStudent } from "@/lib/route-guards";
import { getSessionSummary } from "@/lib/student.functions";

export const Route = createFileRoute("/_authenticated/student/sessions/$sessionId/summary")({
  beforeLoad: (ctx) => requireStudent(ctx.context),
  component: SessionSummary,
});

function formatWhen(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function SessionSummary() {
  const { sessionId } = useParams({ from: "/_authenticated/student/sessions/$sessionId/summary" });
  const fn = useServerFn(getSessionSummary);
  const q = useQuery({
    queryKey: ["session-summary", sessionId],
    queryFn: () => fn({ data: { session_id: sessionId } }),
  });
  const s = q.data;

  return (
    <StudentShell title="Session Summary">
      {q.isLoading ? (
        <p className="text-sm text-[var(--gray-500)]">Loading summary…</p>
      ) : q.isError ? (
        <div className="rounded-2xl border border-dashed border-[var(--gray-200)] bg-white p-10 text-center">
          <p className="text-sm font-semibold text-[var(--gray-900)]">Session not found</p>
          <p className="mt-1 text-sm text-[var(--gray-500)]">
            We couldn't load this session. It may belong to another account.
          </p>
          <Link
            to="/student/sessions"
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-crimson px-4 py-2 text-sm font-semibold text-white hover:bg-crimson-dark"
          >
            Back to sessions
          </Link>
        </div>
      ) : s ? (
        <div className="space-y-5">
          <div className="kr-pcard p-6">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--primary)]">
              {s.courseTitle}
            </p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--gray-900)]">
              {s.lessonTitle}
            </h2>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--gray-500)]">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {formatWhen(s.startedAt)}
              </span>
              {s.durationMinutes !== null && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {s.durationMinutes} min
                </span>
              )}
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" /> {s.questionsAsked} questions · {s.eventCount} events
              </span>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-[var(--gray-400)]">
              Notes from this session
            </h3>
            {s.notes.length === 0 ? (
              <p className="text-sm text-[var(--gray-500)]">No notes were saved for this session.</p>
            ) : (
              <div className="space-y-3">
                {s.notes.map((n: any) => (
                  <div key={n.id} className="kr-pcard p-4">
                    <p className="flex items-center gap-2 text-sm font-semibold text-[var(--gray-900)]">
                      <FileText className="h-4 w-4 text-[var(--primary)]" /> {n.title}
                    </p>
                    {n.body && (
                      <p className="mt-1 whitespace-pre-line text-sm text-[var(--gray-600)]">{n.body}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Link
              to="/student/sessions"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--gray-200)] px-4 py-2 text-sm font-semibold text-[var(--gray-700)] hover:bg-[var(--gray-50)]"
            >
              All sessions
            </Link>
            <Link
              to="/student/notes"
              className="inline-flex items-center gap-1.5 rounded-xl bg-crimson px-4 py-2 text-sm font-semibold text-white hover:bg-crimson-dark"
            >
              Review notes <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : null}
    </StudentShell>
  );
}
