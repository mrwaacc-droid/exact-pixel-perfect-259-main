import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { StudentShell } from "@/components/student/StudentShell";
import { Award } from "lucide-react";
import { requireStudent } from "@/lib/route-guards";
import { getStudentAchievements } from "@/lib/student.functions";

export const Route = createFileRoute("/_authenticated/student/achievements")({
  beforeLoad: (ctx) => requireStudent(ctx.context),
  component: StudentAchievements,
});

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function StudentAchievements() {
  const fn = useServerFn(getStudentAchievements);
  const q = useQuery({ queryKey: ["student-achievements"], queryFn: () => fn() });
  const items = q.data?.achievements ?? [];

  return (
    <StudentShell title="Achievements">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {q.isLoading ? (
          <p className="text-sm text-[var(--gray-500)]">Loading achievements…</p>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--gray-200)] bg-white p-10 text-center sm:col-span-2 xl:col-span-3">
            <Award className="mx-auto mb-2 h-8 w-8 text-[var(--gray-400)]" />
            <p className="text-sm font-semibold text-[var(--gray-900)]">No achievements yet</p>
            <p className="mt-1 text-sm text-[var(--gray-500)]">
              Keep learning — milestones like streaks, completions, and quiz wins show up here.
            </p>
          </div>
        ) : (
          items.map((a: any) => (
            <div key={a.id} className="kr-pcard flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--crimson-soft)] text-2xl">
                {a.icon || "🏆"}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-[var(--gray-900)]">{a.title}</h3>
                {a.description && (
                  <p className="text-xs text-[var(--gray-500)]">{a.description}</p>
                )}
                {a.earnedAt && (
                  <p className="mt-1 text-[11px] font-medium text-[var(--primary)]">
                    Earned {formatDate(a.earnedAt)}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </StudentShell>
  );
}
