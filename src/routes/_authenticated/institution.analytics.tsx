import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { InstitutionShell } from "@/components/institution/InstitutionShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMyInstitutions } from "@/lib/institutions.functions";
import { listCourses } from "@/lib/courses.functions";
import { getCourseProgressReport } from "@/lib/reporting.functions";
import { requireInstitutionAdmin } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/institution/analytics")({
  beforeLoad: (ctx) => requireInstitutionAdmin(ctx.context),
  component: InstitutionAnalytics,
});

function InstitutionAnalytics() {
  const myFn = useServerFn(getMyInstitutions);
  const my = useQuery({ queryKey: ["my-institutions"], queryFn: () => myFn() });
  const institutionId = my.data?.memberships?.[0]?.institution?.id;

  const coursesFn = useServerFn(listCourses);
  const courses = useQuery({
    queryKey: ["courses", institutionId],
    queryFn: () => coursesFn({ data: { institution_id: institutionId! } }),
    enabled: !!institutionId,
  });

  const [courseId, setCourseId] = useState<string>("");
  const courseList = courses.data?.courses ?? [];
  const selectedCourseId = courseId || courseList[0]?.id || "";

  const reportFn = useServerFn(getCourseProgressReport);
  const report = useQuery({
    queryKey: ["course-progress-report", selectedCourseId],
    queryFn: () => reportFn({ data: { course_id: selectedCourseId } }),
    enabled: !!selectedCourseId,
  });

  const summary = report.data?.summary;
  const learners = report.data?.learners ?? [];

  return (
    <InstitutionShell title="Analytics">
      {!institutionId ? (
        <p className="text-muted-foreground">No institution found for your account.</p>
      ) : courses.isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : courseList.length === 0 ? (
        <p className="text-muted-foreground">Create a course to see performance analytics.</p>
      ) : (
        <>
          <div className="mb-6 flex items-center gap-3">
            <label className="text-sm font-semibold text-muted-foreground" htmlFor="course-select">
              Course
            </label>
            <select
              id="course-select"
              value={selectedCourseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="rounded-md border border-border bg-white px-3 py-2 text-sm"
            >
              {courseList.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {report.isLoading ? (
            <p className="text-muted-foreground">Loading report…</p>
          ) : (
            <>
              <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Enrolled" value={summary?.enrolled ?? 0} />
                <Stat label="Active learners" value={summary?.active ?? 0} />
                <Stat label="Avg. progress" value={`${summary?.avgProgress ?? 0}%`} />
                <Stat label="Questions asked" value={summary?.totalQuestions ?? 0} />
              </div>

              <div className="overflow-hidden rounded-2xl border border-border bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Learner</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Progress</th>
                        <th className="px-4 py-3">Time spent</th>
                        <th className="px-4 py-3">Questions</th>
                        <th className="px-4 py-3">Last active</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {learners.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                            No enrolled learners yet.
                          </td>
                        </tr>
                      ) : (
                        learners.map((l: any) => (
                          <tr key={l.studentId} className="transition hover:bg-muted/30">
                            <td className="px-4 py-3">
                              <p className="font-medium">{l.name}</p>
                              <p className="text-xs text-muted-foreground">{l.email}</p>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="secondary" className="capitalize">
                                {l.enrollmentStatus}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">{l.progress}%</td>
                            <td className="px-4 py-3">{l.timeMinutes} min</td>
                            <td className="px-4 py-3">{l.questionsAsked}</td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {l.lastActive ? new Date(l.lastActive).toLocaleDateString() : "—"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </InstitutionShell>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
