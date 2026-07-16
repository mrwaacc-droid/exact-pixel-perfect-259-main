import { Upload, Sparkles, Eye, Mic2, PenTool, MessageCircleQuestion, BrainCircuit, FileText, BarChart3, Flag, CheckCircle2 } from "lucide-react";

const phases = [
  {
    number: "01",
    title: "Before the lesson",
    subtitle: "Preparation and approval",
    icon: Upload,
    color: "text-[#9A3247]",
    bgColor: "bg-[#F7E7EA]",
    borderColor: "border-[#F0D7DC]",
    steps: [
      { icon: Upload, text: "Upload course materials — PDFs, slides, documents" },
      { icon: Sparkles, text: "AI generates structured lesson plans with board content" },
      { icon: Eye, text: "Teacher reviews, edits, and approves the lesson" },
      { icon: CheckCircle2, text: "Lesson is published and scheduled for learners" },
    ],
  },
  {
    number: "02",
    title: "During the lesson",
    subtitle: "Active teaching and adaptation",
    icon: Mic2,
    color: "text-[#22c55e]",
    bgColor: "bg-[#f0fdf4]",
    borderColor: "border-[#bbf7d0]",
    steps: [
      { icon: Mic2, text: "AI teacher speaks, explains, and introduces concepts" },
      { icon: PenTool, text: "Writes on the whiteboard step by step" },
      { icon: MessageCircleQuestion, text: "Asks checkpoint questions and checks understanding" },
      { icon: BrainCircuit, text: "Adapts pacing and re-teaches when confusion is detected" },
    ],
  },
  {
    number: "03",
    title: "After the lesson",
    subtitle: "Evidence and follow-up",
    icon: FileText,
    color: "text-[#f59e0b]",
    bgColor: "bg-[#fffbeb]",
    borderColor: "border-[#fde68a]",
    steps: [
      { icon: FileText, text: "Full transcript and notes are saved automatically" },
      { icon: BarChart3, text: "Progress, time spent, and completion are recorded" },
      { icon: Flag, text: "Unresolved questions are flagged for the teacher" },
      { icon: CheckCircle2, text: "Learning evidence is compiled for institutions and families" },
    ],
  },
];

export function LessonLifecycle() {
  return (
    <section className="py-20 lg:py-28 bg-white" id="lesson-lifecycle">
      <div className="container-editorial">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-xs font-bold text-learning-blue uppercase tracking-widest mb-3">
            The complete lesson cycle
          </p>
          <h2 className="text-xl sm:text-2xl font-extrabold text-heading leading-tight">
            Before, during, and after every lesson
          </h2>
          <p className="text-body mt-4 leading-relaxed text-base max-w-xl mx-auto">
            Klassruum manages the full teaching lifecycle — not just content delivery, but preparation, active teaching, and learning evidence.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {phases.map((phase, index) => {
            const PhaseIcon = phase.icon;
            return (
              <div key={phase.number} className="relative">
                {/* Connector line */}
                {index < phases.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-6 h-0.5 bg-border z-10" />
                )}

                <div className={`h-full rounded-2xl border-2 ${phase.borderColor} overflow-hidden`}>
                  {/* Header */}
                  <div className={`${phase.bgColor} p-6 border-b ${phase.borderColor}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl ${phase.bgColor} border ${phase.borderColor} flex items-center justify-center`}>
                        <PhaseIcon size={18} className={phase.color} />
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wider ${phase.color}`}>
                        Phase {phase.number}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-heading">{phase.title}</h3>
                    <p className="text-sm text-body mt-1">{phase.subtitle}</p>
                  </div>

                  {/* Steps */}
                  <div className="p-6 space-y-4">
                    {phase.steps.map((step, stepIndex) => {
                      const StepIcon = step.icon;
                      return (
                        <div key={stepIndex} className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg ${phase.bgColor} flex items-center justify-center shrink-0 mt-0.5`}>
                            <StepIcon size={14} className={phase.color} />
                          </div>
                          <p className="text-sm leading-6 text-body">{step.text}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
