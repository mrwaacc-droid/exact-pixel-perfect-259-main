import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Users, BookOpen } from "lucide-react";
import { InstitutionShell } from "@/components/institution/InstitutionShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMyInstitutions } from "@/lib/institutions.functions";
import { listInstitutionEnrollmentSummary } from "@/lib/enrollments.functions";
import { formatCoursePrice, isFreeCourse } from "@/lib/course-pricing";
import { requireInstitutionAdmin } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/institution/enrollments")({
  beforeLoad: (ctx) => requireInstitutionAdmin(ctx.context),
  component: InstitutionEnrollments,
});

function InstitutionEnrollments() {
  const myFn = useServerFn(getMyInstitutions);
  const my = useQuery({ queryKey: ["my-institutions"], queryFn: () => myFn() });
  const institutionId = my.data?.memberships?.[0]?.institution?.id;

  const summaryFn = useServerFn(listInstitutionEnrollmentSummary);
  const summary = useQuery({
    queryKey: ["institution-enrollment-summary", institutionId],
    queryFn: () => summaryFn({ data: { institution_id: institutionId! } }),
    enabled: !!institutionId,
  });

  type CourseSummary = {
    id: string;
    title: string;
    status: string;
    priceUsd: number;
    activeEnrollments: number;
    totalEnrollments: number;
  };
  const courses: CourseSummary[] = summary.data?.courses ?? [];
  const totalActive = courses.reduce((sum, c) => sum + c.activeEnrollments, 0);

  return (
    <InstitutionShell
      title="Enrollments"
      actions={
        <Link
          to="/institution/courses"
          className="inline-flex items-center gap-2 rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-heading hover:bg-border-soft"
        >
          <BookOpen className="h-4 w-4" />
          Manage courses
        </Link>
      }
    >
      {!institutionId ? (
        <p className="text-muted-foreground">No institution found for your account.</p>
      ) : summary.isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <Users className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <h2 className="mt-4 text-lg font-semibold">No courses yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a course before you can enroll students in it.
          </p>
          <Link
            to="/institution/courses"
            className="mt-4 inline-block text-sm font-semibold text-[var(--crimson)] underline"
          >
            Go to Courses
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            {totalActive} active enrollment{totalActive === 1 ? "" : "s"} across {courses.length}{" "}
            course{courses.length === 1 ? "" : "s"}. Open a course to add or remove students.
          </p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((c) => (
              <Link key={c.id} to="/institution/courses/$courseId" params={{ courseId: c.id }}>
                <Card className="h-full transition hover:border-primary/40">
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-semibold">{c.title}</h3>
                      <Badge variant="secondary" className="shrink-0 capitalize">
                        {c.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        {c.activeEnrollments} enrolled
                      </span>
                      <span className="font-semibold text-heading">
                        {isFreeCourse(c.priceUsd) ? "Free" : formatCoursePrice(c.priceUsd)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </InstitutionShell>
  );
}
