import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { StudentShell } from "@/components/student/StudentShell";
import { ListChecks, X, ArrowRight } from "lucide-react";
import { requireStudent } from "@/lib/route-guards";
import { getStudentLearningPlan, dismissRecommendation } from "@/lib/student.functions";

export const Route = createFileRoute("/_authenticated/student/learning-plan")({
  beforeLoad: (ctx) => requireStudent(ctx.context),
  component: StudentLearningPlan,
});

function StudentLearningPlan() {
  const fn = useServerFn(getStudentLearningPlan);
  const dismissFn = useServerFn(dismissRecommendation);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["student-learning-plan"], queryFn: () => fn() });
  const items = q.data?.items ?? [];

  const dismiss = useMutation({
    mutationFn: (id: string) => dismissFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["student-learning-plan"] }),
  });

  return (
    <StudentShell title="Learning Plan">
      <div className="space-y-3">
        {q.isLoading ? (
          <p className="text-sm text-[var(--gray-500)]">Loading your plan…</p>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--gray-200)] bg-white p-10 text-center">
            <ListChecks className="mx-auto mb-2 h-8 w-8 text-[var(--gray-400)]" />
            <p className="text-sm font-semibold text-[var(--gray-900)]">Your plan is clear</p>
            <p className="mt-1 text-sm text-[var(--gray-500)]">
              Personalized recommendations will appear here as you learn. Start a lesson to build your plan.
            </p>
            <Link
              to="/student/courses"
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-crimson px-4 py-2 text-sm font-semibold text-white hover:bg-crimson-dark"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          items.map((item: any, i: number) => (
            <div key={item.id} className="kr-pcard flex items-center gap-4 p-4">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-crimson-soft text-sm font-bold text-crimson">
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-[var(--gray-900)]">{item.title}</h3>
                {item.description && (
                  <p className="text-xs text-[var(--gray-500)]">{item.description}</p>
                )}
              </div>
              {item.targetUrl && (
                <Link
                  to={item.targetUrl as any}
                  className="inline-flex items-center gap-1 rounded-lg bg-crimson px-3 py-1.5 text-xs font-semibold text-white hover:bg-crimson-dark"
                >
                  Open <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
              <button
                onClick={() => dismiss.mutate(item.id)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--gray-400)] hover:bg-[var(--gray-50)] hover:text-[var(--gray-700)]"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </StudentShell>
  );
}
