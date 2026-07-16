import { ClipboardCheck, Clock, FileText, CheckCircle2, ArrowRight, BookOpen, PenTool, MessageCircleQuestion } from "lucide-react";

const assignments = [
  {
    title: "Factoring Practice",
    subject: "Mathematics Form 2",
    relatedLesson: "Factoring Quadratics",
    due: "Friday, 4:00 PM",
    estimatedTime: "20 minutes",
    status: "todo",
    statusLabel: "To do",
    resources: 3,
  },
  {
    title: "Chemical Bonding Essay",
    subject: "Chemistry Form 3",
    relatedLesson: "Covalent Bonds",
    due: "Monday, 12:00 PM",
    estimatedTime: "30 minutes",
    status: "in-progress",
    statusLabel: "In progress",
    resources: 2,
  },
  {
    title: "Photosynthesis Diagram",
    subject: "Biology Form 2",
    relatedLesson: "Light Reactions",
    due: "Completed",
    estimatedTime: "15 minutes",
    status: "submitted",
    statusLabel: "Submitted",
    resources: 1,
  },
];

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  todo: { bg: "bg-soft-blue", text: "text-learning-blue", border: "border-blue-100" },
  "in-progress": { bg: "bg-soft-yellow", text: "text-achievement-orange", border: "border-amber-100" },
  submitted: { bg: "bg-soft-green", text: "text-education-green", border: "border-green-100" },
};

const assignmentTypes = [
  { icon: MessageCircleQuestion, label: "Practice questions" },
  { icon: PenTool, label: "Short written response" },
  { icon: BookOpen, label: "Reading and reflection" },
  { icon: FileText, label: "File submission" },
];

export function AssignmentsResources() {
  return (
    <section className="py-20 lg:py-28 bg-page-background-alt" id="assignments">
      <div className="container-editorial">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div>
            <p className="text-xs font-bold text-learning-blue uppercase tracking-widest mb-3">
              Assignments and resources
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-heading leading-tight mb-5">
              Homework that connects to the lesson
            </h2>
            <p className="text-body leading-relaxed mb-8 text-base">
              Assignments are linked to specific lessons, with clear due dates, estimated times, and attached resources. Learners always know what to do and when.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {assignmentTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <div key={type.label} className="flex items-center gap-2 p-3 bg-white rounded-xl border border-border">
                    <Icon size={14} className="text-learning-blue" />
                    <span className="text-xs font-medium text-body">{type.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3">
              {["To do", "In progress", "Submitted", "Feedback received", "Completed"].map((status) => (
                <div key={status} className="flex items-center gap-2 text-sm text-body">
                  <div className="w-2 h-2 rounded-full bg-border-strong" />
                  <span>{status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Mockup */}
          <div className="space-y-4">
            {assignments.map((assignment) => {
              const colors = statusColors[assignment.status];
              return (
                <div key={assignment.title} className="bg-white rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-base font-bold text-heading">{assignment.title}</h4>
                      <p className="text-xs text-muted mt-0.5">{assignment.subject}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors.bg} ${colors.text} border ${colors.border}`}>
                      {assignment.statusLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-body mb-3">
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={12} className="text-muted" />
                      {assignment.relatedLesson}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} className="text-muted" />
                      {assignment.estimatedTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <FileText size={12} />
                      <span>{assignment.resources} resources</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-learning-blue">
                      <span>Due {assignment.due}</span>
                      <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
