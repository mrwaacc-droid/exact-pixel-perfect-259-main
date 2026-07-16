import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { StudentShell } from "@/components/student/StudentShell";
import {
  Clock,
  BookOpen,
  RotateCcw,
  TrendingUp,
  Target,
  Award,
  Layers,
} from "lucide-react";
import { requireStudent } from "@/lib/route-guards";
import { getStudentQuizzes } from "@/lib/student.functions";

export const Route = createFileRoute("/_authenticated/student/quizzes")({
  beforeLoad: (ctx) => requireStudent(ctx.context),
  component: StudentQuizzes,
});

function scoreGrade(pct: number) {
  if (pct >= 90)
    return { grade: "A", color: "text-green-700", bg: "from-green-50 to-white", border: "border-green-200", barColor: "from-green-400 to-green-500", glow: "rgba(22,163,74,0.15)" };
  if (pct >= 75)
    return { grade: "B", color: "text-crimson", bg: "from-[#F7E7EA] to-white", border: "border-[#F7E7EA]", barColor: "from-[#7D2233] to-[#7D2233]", glow: "rgba(125, 34, 51,0.15)" };
  if (pct >= 60)
    return { grade: "C", color: "text-amber-700", bg: "from-amber-50 to-white", border: "border-amber-200", barColor: "from-amber-400 to-amber-500", glow: "rgba(217,119,6,0.15)" };
  return { grade: "D", color: "text-red-700", bg: "from-red-50 to-white", border: "border-red-200", barColor: "from-red-400 to-red-500", glow: "rgba(220,38,38,0.15)" };
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function StudentQuizzes() {
  const fn = useServerFn(getStudentQuizzes);
  const q = useQuery({ queryKey: ["student-quizzes"], queryFn: () => fn() });
  const quizzes = q.data?.quizzes ?? [];

  const avgScore = quizzes.length
    ? Math.round(quizzes.reduce((a, qz: any) => a + (qz.percentage ?? 0), 0) / quizzes.length)
    : 0;
  const bestScore = quizzes.length ? Math.max(...quizzes.map((qz: any) => qz.percentage ?? 0)) : 0;

  return (
    <StudentShell title="Quiz History">
      <div className="kr-stat-strip kr-stat-strip--3 mb-6">
        <div className="kr-stat-card-item kr-stat-card-item--brand">
          <div className="mb-2 flex items-center justify-center">
            <Target className="h-4 w-4 text-[var(--crimson)]" />
          </div>
          <p className="kr-stat-value text-[var(--crimson)]">{avgScore}%</p>
          <p className="kr-stat-label">Average Score</p>
        </div>
        <div className="kr-stat-card-item kr-stat-card-item--success">
          <div className="mb-2 flex items-center justify-center">
            <Award className="h-4 w-4 text-green-700" />
          </div>
          <p className="kr-stat-value text-green-700">{Math.round(bestScore)}%</p>
          <p className="kr-stat-label">Best Score</p>
        </div>
        <div className="kr-stat-card-item">
          <div className="mb-2 flex items-center justify-center">
            <Layers className="h-4 w-4 text-[#8A7478]" />
          </div>
          <p className="kr-stat-value text-[#191314]">{quizzes.length}</p>
          <p className="kr-stat-label">Quizzes Taken</p>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[#8A7478]" />
          <h2 className="text-sm font-bold text-[#191314]">Recent Quizzes</h2>
        </div>
        <span className="text-xs text-[#A89890]">{quizzes.length} total</span>
      </div>

      <div className="space-y-4">
        {q.isLoading ? (
          <p className="text-sm text-[#8A7478]">Loading quizzes…</p>
        ) : quizzes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white p-10 text-center">
            <TrendingUp className="mx-auto mb-2 h-8 w-8 text-[#A89890]" />
            <p className="text-sm font-semibold text-[#191314]">No quizzes yet</p>
            <p className="mt-1 text-sm text-[#8A7478]">
              Complete a lesson and its exit quiz to see your results here.
            </p>
            <Link
              to="/student/classrooms"
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[var(--crimson)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--crimson-dark)]"
            >
              <RotateCcw className="h-4 w-4" /> Go to Classrooms
            </Link>
          </div>
        ) : (
          quizzes.map((quiz: any) => {
            const pct = Math.round(quiz.percentage ?? 0);
            const { grade, color, bg, border, barColor, glow } = scoreGrade(pct);
            return (
              <div
                key={quiz.id}
                className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white transition-all hover:border-[var(--crimson)]/30 hover:shadow-md"
              >
                <div className="flex items-center gap-4 p-5">
                  <div
                    className={`relative flex h-14 w-14 shrink-0 flex-col items-center justify-center overflow-hidden rounded-2xl border bg-gradient-to-br ${bg} ${border} shadow-sm`}
                    style={{ boxShadow: `0 4px 14px ${glow}` }}
                  >
                    <span className={`text-xl font-extrabold leading-none ${color}`}>{grade}</span>
                    <span className={`mt-0.5 text-[10px] font-bold leading-none ${color}`}>{pct}%</span>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/60 to-transparent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-[#191314]">{quiz.title}</h3>
                    <p className="mt-0.5 text-sm text-[#8A7478]">{quiz.course}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-[#A89890]">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" /> {quiz.score} pts
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {formatDate(quiz.date)}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--beige-soft)]">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <Link
                      to="/student/classrooms"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--crimson)] px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[var(--crimson-dark)]"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Retake
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </StudentShell>
  );
}
