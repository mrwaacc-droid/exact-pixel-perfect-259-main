import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { StudentShell } from "@/components/student/StudentShell";
import { Clipboard, Clock, CheckCircle2 } from "lucide-react";
import { requireStudent } from "@/lib/route-guards";
import { getStudentAssignments } from "@/lib/student.functions";

export const Route = createFileRoute("/_authenticated/student/assignments")({
  beforeLoad: (ctx) => requireStudent(ctx.context),
  component: StudentAssignments,
});

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "#b45309", bg: "#fffbeb" },
  in_progress: { label: "In progress", color: "#7D2233", bg: "#F7E7EA" },
  submitted: { label: "Submitted", color: "var(--crimson)", bg: "var(--crimson-soft)" },
  graded: { label: "Graded", color: "#15803d", bg: "#dcfce7" },
  overdue: { label: "Overdue", color: "#b91c1c", bg: "#fee2e2" },
};

function formatDue(iso: string | null) {
  if (!iso) return "No due date";
  const d = new Date(iso);
  const diff = Math.round((d.getTime() - Date.now()) / 86400000);
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  if (diff > 1 && diff < 7) return `Due in ${diff} days`;
  return `Due ${d.toLocaleDateString()}`;
}

function StudentAssignments() {
  const fn = useServerFn(getStudentAssignments);
  const q = useQuery({ queryKey: ["student-assignments"], queryFn: () => fn() });
  const items = q.data?.assignments ?? [];

  return (
    <StudentShell title="Assignments">
      <div className="space-y-3">
        {q.isLoading ? (
          <p className="text-sm text-[var(--gray-500)]">Loading assignments…</p>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--gray-200)] bg-white p-10 text-center">
            <Clipboard className="mx-auto mb-2 h-8 w-8 text-[var(--gray-400)]" />
            <p className="text-sm font-semibold text-[var(--gray-900)]">No assignments</p>
            <p className="mt-1 text-sm text-[var(--gray-500)]">
              Your teachers haven't assigned any tasks yet. Check back after your next lesson.
            </p>
          </div>
        ) : (
          items.map((a: any) => {
            const meta = STATUS_META[a.status] ?? STATUS_META.pending;
            const Icon = a.status === "graded" || a.status === "submitted" ? CheckCircle2 : Clock;
            return (
              <div key={a.id} className="kr-pcard flex items-center gap-4 p-4">
                <div
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: meta.bg, color: meta.color }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold text-[var(--gray-900)]">{a.title}</h3>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <p className="truncate text-xs text-[var(--gray-500)]">{a.courseTitle}</p>
                  {a.description && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-[var(--gray-500)]">{a.description}</p>
                  )}
                </div>
                <span className="shrink-0 text-xs font-semibold text-[var(--gray-500)]">
                  {formatDue(a.dueAt)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </StudentShell>
  );
}
