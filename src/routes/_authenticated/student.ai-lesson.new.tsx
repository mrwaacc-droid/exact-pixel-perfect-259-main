import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { StudentShell } from "@/components/student/StudentShell";
import { Sparkles, ArrowRight, BookOpen } from "lucide-react";
import { requireStudent } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/student/ai-lesson/new")({
  beforeLoad: (ctx) => requireStudent(ctx.context),
  component: NewAiLesson,
});

const SUGGESTIONS = [
  "Explain quadratic equations with examples",
  "Help me revise chemical bonding",
  "Teach me the basics of essay writing",
  "Walk me through Newton's laws of motion",
];

function NewAiLesson() {
  const [topic, setTopic] = useState("");

  return (
    <StudentShell title="Start a New AI Lesson">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="kr-pcard p-6">
          <div className="mb-3 flex items-center gap-2 text-crimson">
            <Sparkles className="h-5 w-5" />
            <h2 className="text-lg font-bold text-[var(--gray-900)]">What do you want to learn?</h2>
          </div>
          <p className="mb-4 text-sm text-[var(--gray-500)]">
            Choose one of your enrolled courses to begin a guided AI classroom session on any topic.
          </p>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Describe a topic, question, or skill you want to work on…"
            rows={3}
            className="w-full resize-none rounded-xl border border-[var(--gray-200)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
          />
          <Link
            to="/student/courses"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-crimson px-5 py-2.5 text-sm font-semibold text-white hover:bg-crimson-dark"
          >
            Pick a course to start <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--gray-400)]">
            Try a prompt
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setTopic(s)}
                className="kr-pcard flex items-start gap-2 p-4 text-left text-sm text-[var(--gray-700)] hover:border-[var(--primary)]"
              >
                <BookOpen className="mt-0.5 h-4 w-4 text-[var(--primary)]" />
                <span>{s}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </StudentShell>
  );
}
