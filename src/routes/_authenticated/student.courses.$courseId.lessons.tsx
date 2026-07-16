import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { StudentShell } from "@/components/student/StudentShell";
import { CheckCircle2, PlayCircle, Lock, RotateCcw, Clock } from "lucide-react";
import { requireStudent } from "@/lib/route-guards";
import { getCourseForStudent } from "@/lib/student.functions";

export const Route = createFileRoute("/_authenticated/student/courses/$courseId/lessons")({
  beforeLoad: (ctx) => requireStudent(ctx.context),
  component: CourseLessons,
});

type LessonStatus = "completed" | "current" | "locked";

const STATUS: Record<LessonStatus, { label: string; color: string; bg: string }> = {
  completed: { label: "Completed", color: "#15803d", bg: "#dcfce7" },
  current: { label: "In progress", color: "#7D2233", bg: "#F7E7EA" },
  locked: { label: "Up next", color: "var(--crimson)", bg: "var(--crimson-soft)" },
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function classroomHref(lessonId?: string) {
  return lessonId && UUID_RE.test(lessonId) ? `/classroom/${lessonId}` : "/student/classrooms";
}

function CourseLessons() {
  const { courseId } = useParams({ from: "/_authenticated/student/courses/$courseId/lessons" });
  const fn = useServerFn(getCourseForStudent);
  const q = useQuery({
    queryKey: ["student-course", courseId],
    queryFn: () => fn({ data: { course_id: courseId } }),
  });

  const course = q.data?.course as any;
  const lessons = (q.data?.lessons ?? []) as any[];

  // Determine the first not-completed lesson as "current".
  const currentLessonId = lessons.find((l: any) => l.progress?.status !== "completed")?.id ?? null;

  const rows = lessons.map((l: any, i: number) => {
    let status: LessonStatus;
    if (l.progress?.status === "completed") status = "completed";
    else if (l.id === currentLessonId) status = "current";
    else status = "locked";
    return {
      id: l.id,
      index: i + 1,
      title: l.title ?? `Lesson ${i + 1}`,
      minutes: l.duration_minutes ? Math.max(5, Math.round(l.duration_minutes)) : 20,
      status,
    };
  });

  const done = rows.filter((r) => r.status === "completed").length;
  const pct = rows.length ? Math.round((done / rows.length) * 100) : 0;

  return (
    <StudentShell title="Course Lessons">
      <div className="kr-pcard mb-6 p-6">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--primary)]">Course</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--gray-900)]">
          {course?.title ?? "Course"}
        </h2>
        {rows.length > 0 && (
          <div className="mt-4 flex items-center gap-4">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--gray-100)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#7D2233] to-[#521326]"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-sm font-bold text-[var(--gray-700)]">
              {done}/{rows.length} lessons · {pct}%
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {q.isLoading ? (
          <p className="text-sm text-[var(--gray-500)]">Loading lessons…</p>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--gray-200)] bg-white p-10 text-center">
            <p className="text-sm font-semibold text-[var(--gray-900)]">No lessons published yet</p>
            <p className="mt-1 text-sm text-[var(--gray-500)]">
              Lessons will appear here once the course instructor publishes them.
            </p>
          </div>
        ) : (
          rows.map((l) => {
            const meta = STATUS[l.status];
            const Icon = l.status === "completed" ? CheckCircle2 : l.status === "current" ? PlayCircle : Lock;
            return (
              <div
                key={l.id}
                className={`kr-pcard flex items-center gap-4 p-4 ${l.status === "locked" ? "opacity-80" : ""}`}
              >
                <div
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: meta.bg, color: meta.color }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--gray-400)]">Lesson {l.index}</span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <h3 className="truncate font-semibold text-[var(--gray-900)]">{l.title}</h3>
                  <p className="flex items-center gap-1 text-xs text-[var(--gray-500)]">
                    <Clock className="h-3 w-3" /> {l.minutes} min
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {l.status === "current" && (
                    <Link
                      to={classroomHref(l.id) as any}
                      className="kr-btn-primary inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white"
                    >
                      <PlayCircle className="h-4 w-4" /> Continue
                    </Link>
                  )}
                  {l.status === "completed" && (
                    <div className="flex gap-2">
                      <Link
                        to={classroomHref(l.id) as any}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--gray-200)] px-3 py-2 text-xs font-semibold text-[var(--gray-700)] hover:bg-[var(--gray-50)]"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Replay
                      </Link>
                      <Link
                        to="/student/notes"
                        className="inline-flex items-center rounded-lg border border-[var(--gray-200)] px-3 py-2 text-xs font-semibold text-[var(--gray-700)] hover:bg-[var(--gray-50)]"
                      >
                        Notes
                      </Link>
                    </div>
                  )}
                  {l.status === "locked" && (
                    <span className="text-xs font-medium text-[var(--gray-400)]">
                      {currentLessonId ? "Complete the current lesson first" : ""}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6">
        <Link to="/student/courses" className="text-sm font-semibold text-[var(--primary)] hover:underline">
          ← Back to my courses
        </Link>
      </div>
    </StudentShell>
  );
}
