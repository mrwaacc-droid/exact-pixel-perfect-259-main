import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, Plus } from "lucide-react";
import { InstitutionShell } from "@/components/institution/InstitutionShell";
import { CreateCourseDialog } from "@/components/institution/CreateCourseDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMyInstitutions } from "@/lib/institutions.functions";
import { listCourses } from "@/lib/courses.functions";
import { requireInstitutionStaff } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/institution/courses")({
  beforeLoad: (ctx) => requireInstitutionStaff(ctx.context),
  component: CoursesPage,
});

function CoursesPage() {
  const myFn = useServerFn(getMyInstitutions);
  const my = useQuery({ queryKey: ["my-institutions"], queryFn: () => myFn() });
  const owned = my.data?.memberships?.[0];
  const institutionId = owned?.institution?.id;

  const listFn = useServerFn(listCourses);
  const courses = useQuery({
    queryKey: ["courses", institutionId],
    queryFn: () => listFn({ data: { institution_id: institutionId! } }),
    enabled: !!institutionId,
  });

  return (
    <InstitutionShell
      title="Courses"
      actions={
        institutionId ? (
          <div className="flex flex-wrap gap-2">
            <Link to="/institution/courses/new">
              <button className="inline-flex items-center gap-2 rounded-md bg-[var(--crimson)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--crimson-dark)]">
                <Plus className="h-4 w-4" />
                New course page
              </button>
            </Link>
            <CreateCourseDialog institutionId={institutionId} />
          </div>
        ) : null
      }
    >
      {!institutionId ? (
        <p className="text-muted-foreground">
          No institution.{" "}
          <Link to="/institutions/register" className="underline">
            Register one
          </Link>
          .
        </p>
      ) : courses.isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (courses.data?.courses?.length ?? 0) === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <h2 className="mt-4 text-lg font-semibold">No courses yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first learning program to start enrolling students.
          </p>
          <div className="mt-4">
            <CreateCourseDialog institutionId={institutionId} />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {courses.data!.courses.map((c: any) => (
            <Link key={c.id} to="/institution/courses/$courseId" params={{ courseId: c.id }}>
              <Card className="transition hover:border-primary/40">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-semibold">{c.title}</h3>
                    <Badge variant="secondary" className="capitalize">
                      {c.status}
                    </Badge>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {c.description || "No description"}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {c.subject && (
                      <span className="rounded-full bg-accent px-2 py-0.5">{c.subject}</span>
                    )}
                    {c.level && (
                      <span className="rounded-full bg-accent px-2 py-0.5">{c.level}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </InstitutionShell>
  );
}
