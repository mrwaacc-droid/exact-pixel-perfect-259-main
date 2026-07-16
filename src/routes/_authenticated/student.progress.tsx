import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  BookOpen,
  Trophy,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { StudentShell } from "@/components/student/StudentShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getMyProgress } from "@/lib/student.functions";
import { requireStudent } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/student/progress")({
  beforeLoad: (ctx) => requireStudent(ctx.context),
  component: StudentProgressPage,
  head: () => ({
    meta: [
      { title: "My Progress — Klassruum" },
      { name: "description", content: "Track lesson completion, quiz scores, and study time." },
    ],
  }),
});

function StudentProgressPage() {
  const fn = useServerFn(getMyProgress);
  const q = useQuery({ queryKey: ["my-progress"], queryFn: () => fn() });

  return (
    <StudentShell title="My Progress">
      {q.isLoading ? (
        <p className="text-muted-foreground">Loading progress…</p>
      ) : q.data ? (
        <ProgressDashboard data={q.data} />
      ) : (
        <p className="text-muted-foreground">
          No progress data yet. Start a lesson to see your stats!
        </p>
      )}
    </StudentShell>
  );
}

function ProgressDashboard({ data }: { data: Awaited<ReturnType<typeof getMyProgress>> }) {
  const { enrollments, progressByCourse, quizzesByCourse, lessonCounts, totalProgress, totalQuizzes } =
    data;

  const totalLessonsCompleted = totalProgress.filter((p: any) => p.status === "completed").length;
  const avgProgress =
    totalProgress.length > 0
      ? Math.round(
          totalProgress.reduce((sum: number, p: any) => sum + p.progress_percentage, 0) /
            totalProgress.length,
        )
      : 0;
  const avgQuizScore =
    totalQuizzes.length > 0
      ? Math.round(
          totalQuizzes.reduce((sum: number, q: any) => sum + q.percentage, 0) / totalQuizzes.length,
        )
      : 0;
  const totalTimeSpent = totalProgress.reduce(
    (sum: number, p: any) => sum + (p.time_spent_minutes || 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={TrendingUp} label="Avg. Progress" value={`${avgProgress}%`} color="text-primary" />
        <StatCard icon={Trophy} label="Quiz Score" value={`${avgQuizScore}%`} color="text-success" />
        <StatCard icon={CheckCircle2} label="Lessons Done" value={totalLessonsCompleted} color="text-[var(--crimson)]" />
        <StatCard
          icon={Clock}
          label="Time Spent"
          value={
            totalTimeSpent > 60
              ? `${Math.round(totalTimeSpent / 60)}h ${totalTimeSpent % 60}m`
              : `${totalTimeSpent}m`
          }
          color="text-foreground"
        />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Course Progress</h2>
        {(enrollments as any[]).length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <BookOpen className="mx-auto mb-2 h-8 w-8 opacity-40" />
              <p>You're not enrolled in any courses yet.</p>
              <Link to="/student/courses" className="mt-2 inline-block text-primary hover:underline">
                Browse courses
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {(enrollments as any[]).map((enr: any) => {
              const course = enr.course;
              if (!course) return null;
              const inst = course.institutions;
              const courseId = course.id;
              const courseProgress = progressByCourse[courseId] ?? [];
              const courseQuizzes = quizzesByCourse[courseId] ?? [];
              const totalLessons = lessonCounts[courseId] ?? 0;
              const completed = courseProgress.filter((p: any) => p.status === "completed").length;
              const inProgress = courseProgress.filter((p: any) => p.status === "in_progress").length;
              const avgPct =
                courseProgress.length > 0
                  ? Math.round(
                      courseProgress.reduce((s: number, p: any) => s + p.progress_percentage, 0) /
                        courseProgress.length,
                    )
                  : 0;
              const avgQ =
                courseQuizzes.length > 0
                  ? Math.round(
                      courseQuizzes.reduce((s: number, q: any) => s + q.percentage, 0) /
                        courseQuizzes.length,
                    )
                  : null;

              return (
                <Card key={enr.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{course.title}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {inst?.name ?? "Unknown"} · {course.subject ?? "General"} ·{" "}
                          {course.level ?? "—"}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {completed}/{totalLessons} done
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Average progress</span>
                        <span>{avgPct}%</span>
                      </div>
                      <Progress value={avgPct} className="h-2" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-lg font-bold text-[var(--crimson)]">{inProgress}</div>
                        <div className="text-[10px] uppercase text-muted-foreground">In Progress</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-success">{completed}</div>
                        <div className="text-[10px] uppercase text-muted-foreground">Completed</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-primary">
                          {avgQ !== null ? `${avgQ}%` : "—"}
                        </div>
                        <div className="text-[10px] uppercase text-muted-foreground">Quiz Avg</div>
                      </div>
                    </div>
                    {courseQuizzes.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Recent quizzes</p>
                        {(courseQuizzes as any[]).slice(0, 3).map((qr: any) => (
                          <div
                            key={qr.id}
                            className="flex items-center justify-between rounded-md border border-border px-2.5 py-1.5 text-xs"
                          >
                            <span className="text-muted-foreground">
                              {new Date(qr.completed_at).toLocaleDateString()}
                            </span>
                            <span
                              className={`font-medium ${qr.percentage >= 70 ? "text-success" : qr.percentage >= 40 ? "text-yellow-600" : "text-destructive"}`}
                            >
                              {qr.percentage}% ({qr.score} pts)
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
          <div className={`text-2xl font-bold ${color}`}>{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
