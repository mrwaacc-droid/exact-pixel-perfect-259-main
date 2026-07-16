import { BrainCircuit, MessageCircleQuestion, Lightbulb, ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";

const reasoningFlow = [
  {
    step: "1",
    title: "Learner asks",
    content: '"Why can \'a\' not equal zero in the quadratic formula?"',
    icon: MessageCircleQuestion,
  },
  {
    step: "2",
    title: "Teacher reads context",
    content: "Current lesson: Solving quadratics. Board: ax² + bx + c = 0. Course: Algebra Form 3.",
    icon: BrainCircuit,
  },
  {
    step: "3",
    title: "Teacher responds",
    content: '"If a were zero, the x² term disappears — it would no longer be a quadratic equation."',
    icon: Lightbulb,
  },
];

export function AITeacherIntelligence() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28 bg-crimson-soft" id="ai-intelligence">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-10 right-20 w-48 h-48 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="container-editorial relative z-10">
        <Reveal className="max-w-2xl mb-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-crimson-dark mb-3">
            AI teacher intelligence
          </p>
          <h2 className="text-xl sm:text-2xl font-extrabold text-heading leading-tight">
            The teacher follows the lesson.{" "}
            <span className="text-crimson-dark">It also understands the moment.</span>
          </h2>
          <p className="text-muted mt-4 text-base leading-relaxed max-w-xl">
            The AI teacher knows the current objective, board item, course material, learner level and previous questions.
          </p>
        </Reveal>

        <Reveal delay={1} className="max-w-4xl mx-auto">
          <div className="bg-white rounded-[1.25rem] border border-border p-6 lg:p-8 shadow-[0_20px_60px_rgba(82, 19, 38,0.15)]">
            <div className="space-y-4">
              {reasoningFlow.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.step} className="relative">
                    {index < reasoningFlow.length - 1 && (
                      <div className="absolute left-8 top-full h-4 w-px bg-border" />
                    )}
                    <div className="flex gap-5 p-4 rounded-xl bg-page-background border border-border">
                      <div className="w-10 h-10 rounded-lg bg-crimson-dark flex items-center justify-center shrink-0">
                        <Icon size={18} className="text-heading" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Step {item.step}</span>
                          <span className="text-[13px] font-bold text-heading">{item.title}</span>
                        </div>
                        <p className="text-[14px] leading-relaxed text-muted">{item.content}</p>
                      </div>
                      {index < reasoningFlow.length - 1 && (
                        <ArrowRight size={16} className="text-border shrink-0 mt-3" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 p-4 rounded-xl bg-crimson-soft border border-crimson-dark/20">
              <div className="flex items-center gap-2 mb-1">
                <BrainCircuit size={16} className="text-crimson-dark" />
                <span className="text-[12px] font-bold text-crimson-dark">Lesson resumes</span>
              </div>
              <p className="text-[13px] text-muted">
                The teacher returns to the whiteboard, adjusts the example, and continues teaching.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
