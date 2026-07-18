import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Award, BookOpen, Clock, RotateCcw } from "lucide-react";
import { StudentShell } from "@/components/student/StudentShell";
import { getStudentQuizzes } from "@/lib/student.functions";
import { requireStudent } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/student/quizzes/$quizId")({
  beforeLoad: (ctx) => requireStudent(ctx.context),
  component: StudentQuizDetail,
});

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function StudentQuizDetail() {
  const { quizId } = Route.useParams();
  const fn = useServerFn(getStudentQuizzes);
  const q = useQuery({ queryKey: ["student-quizzes"], queryFn: () => fn() });
  const quiz = q.data?.quizzes.find((qz: any) => qz.id === quizId) ?? null;

  return (
    <StudentShell title="Quiz Detail">
      <Link
        to="/student/quizzes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#8A7478] hover:text-[#191314]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to quiz history
      </Link>

      {q.isLoading ? (
        <p className="text-sm text-[#8A7478]">Loading…</p>
      ) : !quiz ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white p-10 text-center">
          <BookOpen className="mx-auto mb-2 h-8 w-8 text-[#A89890]" />
          <p className="text-sm font-semibold text-[#191314]">Quiz not found</p>
          <p className="mt-1 text-sm text-[#8A7478]">
            This quiz result may have been removed, or hasn't been recorded yet.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-6">
          <h1 className="text-xl font-bold text-[#191314]">{quiz.title}</h1>
          <p className="mt-1 text-sm text-[#8A7478]">{quiz.course}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--border)] p-4 text-center">
              <Award className="mx-auto mb-1 h-4 w-4 text-[var(--crimson)]" />
              <p className="text-2xl font-extrabold text-[var(--crimson)]">
                {Math.round(quiz.percentage ?? 0)}%
              </p>
              <p className="text-xs text-[#8A7478]">Score</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] p-4 text-center">
              <BookOpen className="mx-auto mb-1 h-4 w-4 text-[#8A7478]" />
              <p className="text-2xl font-extrabold text-[#191314]">{quiz.score}</p>
              <p className="text-xs text-[#8A7478]">Points</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] p-4 text-center">
              <Clock className="mx-auto mb-1 h-4 w-4 text-[#8A7478]" />
              <p className="text-sm font-bold text-[#191314]">{formatDate(quiz.date)}</p>
              <p className="text-xs text-[#8A7478]">Completed</p>
            </div>
          </div>

          <Link
            to="/student/classrooms"
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-[var(--crimson)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--crimson-dark)]"
          >
            <RotateCcw className="h-4 w-4" /> Retake in classroom
          </Link>
        </div>
      )}
    </StudentShell>
  );
}
