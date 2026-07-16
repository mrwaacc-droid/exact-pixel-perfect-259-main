import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { StudentShell } from "@/components/student/StudentShell";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Lock, Sparkles } from "lucide-react";
import { getMyEnrolledCourses } from "@/lib/student.functions";
import { getPurchasableCourses, getMyCourseOwnership } from "@/lib/course-billing.functions";
import { formatCoursePrice, isFreeCourse } from "@/lib/course-pricing";
import { requireStudent } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/student/courses")({
  beforeLoad: (ctx) => requireStudent(ctx.context),
  component: StudentCourses,
});

function StudentCourses() {
  const enrolledFn = useServerFn(getMyEnrolledCourses);
  const catalogFn = useServerFn(getPurchasableCourses);
  const ownFn = useServerFn(getMyCourseOwnership);

  const enrolledQ = useQuery({ queryKey: ["my-enrollments"], queryFn: () => enrolledFn() });
  const catalogQ = useQuery({ queryKey: ["purchasable-courses"], queryFn: () => catalogFn() });

  const catalog = catalogQ.data?.courses ?? [];
  const ownedQ = useQuery({
    queryKey: ["my-ownership", catalog.map((c: any) => c.id)],
    queryFn: () => ownFn({ data: { courseIds: catalog.map((c: any) => c.id) } }),
    enabled: catalog.length > 0,
  });
  const ownedIds = new Set(ownedQ.data?.ownedCourseIds ?? []);
  const available = catalog.filter((c: any) => !ownedIds.has(c.id));

  const enrollments = enrolledQ.data?.enrollments ?? [];

  return (
    <StudentShell title="My Courses">
      {/* Enrolled courses */}
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
        My Courses
      </h2>
      {enrolledQ.isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : enrollments.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            You aren't enrolled in any courses yet. Browse the catalog below to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="mb-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {enrollments.map(
            (e: any) =>
              e.course && (
                <Link
                  key={e.id}
                  to="/student/courses/$courseId"
                  params={{ courseId: e.course.id }}
                >
                  <Card className="h-full transition hover:border-primary/40">
                    <CardContent className="space-y-2 p-5">
                      <p className="text-xs uppercase text-muted-foreground">
                        {e.course.institutions?.name}
                      </p>
                      <h3 className="text-lg font-semibold">{e.course.title}</h3>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {e.course.description}
                      </p>
                      <span className="inline-flex items-center gap-1 rounded-md bg-success-light px-2 py-0.5 text-xs font-semibold text-success-dark">
                        <CheckCircle2 className="h-3 w-3" /> Enrolled
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ),
          )}
        </div>
      )}

      {/* Available (priced) courses */}
      {catalogQ.isLoading ? null : available.length === 0 ? null : (
        <>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-crimson" />
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Available Courses
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {available.map((c: any) => (
              <Link key={c.id} to="/courses/$slug" params={{ slug: c.slug }}>
                <Card className="h-full transition hover:border-primary/40">
                  <CardContent className="flex h-full flex-col space-y-2 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        {c.sourceType === "kingpin" ? "KingPin" : "Course"}
                      </span>
                      <span className="text-base font-extrabold text-heading">
                        {formatCoursePrice(c.priceUsd, c.pricingLabel)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold">{c.title}</h3>
                    <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
                      {c.description}
                    </p>
                    <span
                      className={`inline-flex w-fit items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${
                        isFreeCourse(c.priceUsd)
                          ? "bg-success-light text-success-dark"
                          : "bg-crimson-soft text-crimson-dark"
                      }`}
                    >
                      <Lock className="h-3 w-3" />
                      {isFreeCourse(c.priceUsd) ? "Enroll free" : "Enroll for access"}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </StudentShell>
  );
}
