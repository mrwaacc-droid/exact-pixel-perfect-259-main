import { FileText, Clock, BarChart3, MessageCircleQuestion, BookOpen, Download, CheckCircle2 } from "lucide-react";

const evidenceTypes = [
  {
    icon: FileText,
    title: "Session transcripts",
    description: "Full text record of every lesson — what the teacher said, what was on the board, and what questions were asked.",
    value: "Auto-generated",
  },
  {
    icon: Clock,
    title: "Time and engagement",
    description: "How long the learner spent in the lesson, when they paused, and how actively they participated.",
    value: "Per session",
  },
  {
    icon: BarChart3,
    title: "Completion rates",
    description: "Which lessons were started, completed, or left incomplete — with progress percentages across courses.",
    value: "Course-wide",
  },
  {
    icon: MessageCircleQuestion,
    title: "Questions and answers",
    description: "Every question the learner asked, how the AI responded, and which questions were escalated to the teacher.",
    value: "Searchable",
  },
  {
    icon: BookOpen,
    title: "Notes and summaries",
    description: "Auto-generated learner notes from each lesson, with key concepts, definitions, and board content.",
    value: "Downloadable",
  },
];

export function LearningEvidence() {
  return (
    <section className="py-20 lg:py-28 bg-page-background-alt" id="evidence">
      <div className="container-editorial">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-xs font-bold text-learning-blue uppercase tracking-widest mb-3">
            Learning evidence
          </p>
          <h2 className="text-xl sm:text-2xl font-extrabold text-heading leading-tight">
            Every lesson leaves a record
          </h2>
          <p className="text-body mt-4 leading-relaxed text-base max-w-xl mx-auto">
            Klassruum automatically compiles transcripts, completion rates, time spent, questions asked, and notes saved — for every learner, in every course.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {evidenceTypes.map((evidence) => {
            const Icon = evidence.icon;
            return (
              <div key={evidence.title} className="bg-white rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-soft-blue flex items-center justify-center">
                    <Icon size={18} className="text-learning-blue" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-heading">{evidence.title}</h3>
                    <span className="text-[10px] font-bold text-learning-blue uppercase tracking-wider">{evidence.value}</span>
                  </div>
                </div>
                <p className="text-sm leading-6 text-body">{evidence.description}</p>
              </div>
            );
          })}
        </div>

        {/* Export capabilities */}
        <div className="bg-white rounded-2xl border border-border p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-bold text-heading mb-3">Export and share evidence</h3>
              <p className="text-sm leading-6 text-body mb-5">
                Download transcripts, progress reports, and learning summaries. Share with parents, administrators, or accreditation bodies.
              </p>
              <div className="space-y-3">
                {[
                  "PDF transcripts for each session",
                  "CSV progress reports for institutions",
                  "Weekly summaries for families",
                  "Audit-ready records for compliance",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-body">
                    <CheckCircle2 size={14} className="text-education-green shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mockup-window overflow-hidden">
              <div className="h-8 border-b border-border bg-page-background-alt flex items-center px-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red" />
                  <span className="w-2 h-2 rounded-full bg-achievement-orange" />
                  <span className="w-2 h-2 rounded-full bg-education-green" />
                  <span className="text-[9px] text-muted ml-2 font-medium">Export Center</span>
                </div>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { label: "Session Transcript — Photosynthesis", format: "PDF", size: "245 KB" },
                  { label: "Weekly Progress Report", format: "CSV", size: "12 KB" },
                  { label: "Course Summary — Chemistry F3", format: "PDF", size: "1.2 MB" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 p-3 bg-page-background rounded-lg border border-border">
                    <Download size={14} className="text-learning-blue shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-heading truncate">{item.label}</p>
                      <p className="text-[10px] text-muted">{item.format} · {item.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
