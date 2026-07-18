import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { StudentShell } from "@/components/student/StudentShell";
import { Card, CardContent } from "@/components/ui/card";
import { getStudentTranscript } from "@/lib/student.functions";
import { requireStudent } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/student/transcripts")({
  beforeLoad: (ctx) => requireStudent(ctx.context),
  component: StudentTranscripts,
});

function StudentTranscripts() {
  const fn = useServerFn(getStudentTranscript);
  const q = useQuery({ queryKey: ["student-transcript"], queryFn: () => fn() });
  const data = q.data;

  return (
    <StudentShell title="Transcripts">
      {q.isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Sessions attended" value={data?.totalSessions ?? 0} />
            <Stat label="Lessons completed" value={data?.lessonsCompleted ?? 0} />
            <Stat label="Avg. quiz score" value={`${data?.avgQuiz ?? 0}%`} />
            <Stat label="Study time" value={`${data?.totalStudyMinutes ?? 0} min`} />
          </div>

          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            By Course
          </h2>
          {(data?.byCourse.length ?? 0) === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Your per-course transcript will appear here once you start lessons.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data!.byCourse.map((c) => (
                <Card key={c.courseTitle}>
                  <CardContent className="space-y-2 p-5">
                    <h3 className="text-lg font-semibold">{c.courseTitle}</h3>
                    <p className="text-sm text-muted-foreground">
                      {c.lessonsCompleted} lesson{c.lessonsCompleted === 1 ? "" : "s"} completed
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Average progress: {c.avgProgress}%
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </StudentShell>
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
