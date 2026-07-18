import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Layers, Plus } from "lucide-react";
import { InstitutionShell } from "@/components/institution/InstitutionShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMyInstitutions } from "@/lib/institutions.functions";
import { listInstitutionProgrammes } from "@/lib/programmes.functions";
import { requireInstitutionStaff } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/institution/programmes")({
  beforeLoad: (ctx) => requireInstitutionStaff(ctx.context),
  component: InstitutionProgrammesPage,
});

function InstitutionProgrammesPage() {
  const myFn = useServerFn(getMyInstitutions);
  const my = useQuery({ queryKey: ["my-institutions"], queryFn: () => myFn() });
  const institutionId = my.data?.memberships?.[0]?.institution?.id;

  const listFn = useServerFn(listInstitutionProgrammes);
  const programmes = useQuery({
    queryKey: ["institution-programmes", institutionId],
    queryFn: () => listFn({ data: { institution_id: institutionId! } }),
    enabled: !!institutionId,
  });

  const rows = programmes.data?.programmes ?? [];

  return (
    <InstitutionShell
      title="Programmes"
      actions={
        institutionId ? (
          <Link to="/institution/programmes/new">
            <button className="inline-flex items-center gap-2 rounded-md bg-[var(--crimson)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--crimson-dark)]">
              <Plus className="h-4 w-4" />
              Create Programme
            </button>
          </Link>
        ) : null
      }
    >
      {!institutionId ? (
        <p className="text-muted-foreground">No institution found for your account.</p>
      ) : programmes.isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <Layers className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <h2 className="mt-4 text-lg font-semibold">No programmes yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Programmes group related courses under a single curriculum track.
          </p>
          <Link to="/institution/programmes/new">
            <button className="mt-4 inline-flex items-center gap-2 rounded-md bg-[var(--crimson)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--crimson-dark)]">
              <Plus className="h-4 w-4" />
              Create your first programme
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((p: any) => (
            <Card key={p.id}>
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold">{p.title}</h3>
                  <Badge variant="secondary" className="shrink-0 capitalize">
                    {p.status}
                  </Badge>
                </div>
                {p.description && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                )}
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {p.subject_area && (
                    <span className="rounded-full bg-accent px-2 py-0.5">{p.subject_area}</span>
                  )}
                  {p.level && <span className="rounded-full bg-accent px-2 py-0.5">{p.level}</span>}
                  <span className="rounded-full bg-accent px-2 py-0.5">
                    {p.courseCount} course{p.courseCount === 1 ? "" : "s"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </InstitutionShell>
  );
}
