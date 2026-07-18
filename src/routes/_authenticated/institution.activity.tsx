import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { MessageCircleQuestion } from "lucide-react";
import { InstitutionShell } from "@/components/institution/InstitutionShell";
import { getMyInstitutions } from "@/lib/institutions.functions";
import { getInstitutionQuestions } from "@/lib/reporting.functions";
import { requireInstitutionAdmin } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/institution/activity")({
  beforeLoad: (ctx) => requireInstitutionAdmin(ctx.context),
  component: InstitutionActivity,
});

function InstitutionActivity() {
  const myFn = useServerFn(getMyInstitutions);
  const my = useQuery({ queryKey: ["my-institutions"], queryFn: () => myFn() });
  const institutionId = my.data?.memberships?.[0]?.institution?.id;

  const fn = useServerFn(getInstitutionQuestions);
  const q = useQuery({
    queryKey: ["institution-questions", institutionId],
    queryFn: () => fn({ data: { institution_id: institutionId! } }),
    enabled: !!institutionId,
  });

  const questions = q.data?.questions ?? [];

  return (
    <InstitutionShell title="Recent Activity">
      {!institutionId ? (
        <p className="text-muted-foreground">No institution found for your account.</p>
      ) : q.isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : questions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <MessageCircleQuestion className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <h2 className="mt-4 text-lg font-semibold">No activity yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Questions learners ask their AI teacher will show up here as they happen.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-white">
          <div className="divide-y divide-border">
            {questions.map((qu: any) => (
              <div key={qu.id} className="px-5 py-4">
                <p className="font-medium">{qu.question_text}</p>
                {qu.answer_text && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {qu.answer_text}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  {qu.section_type ?? "General"} · {qu.learning_mode ?? "standard"} ·{" "}
                  {qu.created_at ? new Date(qu.created_at).toLocaleString() : "—"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </InstitutionShell>
  );
}
