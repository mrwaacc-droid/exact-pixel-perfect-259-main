import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { StudentShell } from "@/components/student/StudentShell";
import { CheckCircle2, PlayCircle, Clock, FileText } from "lucide-react";
import { requireStudent } from "@/lib/route-guards";
import { getStudentLessons } from "@/lib/student.functions";

export const Route = createFileRoute("/_authenticated/student/lessons")({
  beforeLoad: (ctx) => requireStudent(ctx.context),
  component: StudentLessons,
});

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function href(lessonId?: string) {
  return lessonId && UUID_RE.test(lessonId) ? `/classroom/${lessonId}` : "/student/classrooms";
}

function StudentLessons() {
  const fn = useServerFn(getStudentLessons);
  const q = useQuery({ queryKey: ["student-lessons"], queryFn: () => fn() });
  const lessons = q.data?.lessons ?? [];

  return (
    <StudentShell title="Lessons">
      <div className="space-y-3">
        {q.isLoading ? (
          <p className="text-sm text-[var(--gray-500)]">Loading lessons…</p>
        ) : lessons.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--gray-200)] bg-white p-10 text-center">
            <FileText className="mx-auto mb-2 h-8 w-8 text-[var(--gray-400)]" />
            <p className="text-sm font-semibold text-[var(--gray-900)]">No lessons yet</p>
            <p className="mt-1 text-sm text-[var(--gray-500)]">
              Enroll in a course and your lessons will appear here.
            </p>
            <Link
              to="/student/courses"
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[var(--crimson)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--crimson-dark)]"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          lessons.map((l: any) => {
            const done = l.progressStatus === "completed";
            const started = l.progressStatus === "in_progress";
            const Icon = done ? CheckCircle2 : PlayCircle;
            return (
              <div
                key={l.id}
                className="kr-pcard flex items-center gap-4 p-4"
              >
                <div
                  className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${
                    done
                      ? "bg-[#dcfce7] text-[#15803d]"
                      : started
                        ? "bg-[#F7E7EA] text-[#7D2233]"
                        : "bg-[var(--crimson-soft)] text-[var(--crimson)]"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--gray-400)]">
                    {l.courseTitle}
                  </p>
                  <h3 className="truncate font-semibold text-[var(--gray-900)]">{l.title}</h3>
                  <p className="flex items-center gap-1 text-xs text-[var(--gray-500)]">
                    <Clock className="h-3 w-3" /> {l.durationMinutes} min
                  </p>
                </div>
                <Link
                  to={href(l.id) as any}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold ${
                    done
                      ? "border border-[var(--gray-200)] text-[var(--gray-700)] hover:bg-[var(--gray-50)]"
                      : "bg-[var(--crimson)] text-white hover:bg-[var(--crimson-dark)]"
                  }`}
                >
                  {done ? "Replay" : started ? "Continue" : "Start"}
                </Link>
              </div>
            );
          })
        )}
      </div>
    </StudentShell>
  );
}
