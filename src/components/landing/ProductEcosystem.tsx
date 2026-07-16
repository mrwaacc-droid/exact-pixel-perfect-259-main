import { GraduationCap, Building2, ClipboardList, Users, Library, ArrowRight } from "lucide-react";

const modules = [
  {
    icon: GraduationCap,
    title: "Classroom",
    description: "AI-led and live lesson delivery with voice, whiteboard, captions, and structured learner prompts.",
  },
  {
    icon: Building2,
    title: "Institution",
    description: "Programmes, courses, staffing, analytics, and governance managed from one controlled workspace.",
  },
  {
    icon: ClipboardList,
    title: "Work",
    description: "Practice, assignments, submissions, and feedback organised by course and due date.",
  },
  {
    icon: Users,
    title: "Family",
    description: "Parent access to learner progress, upcoming lessons, and practical support summaries.",
  },
  {
    icon: Library,
    title: "Library",
    description: "Materials, lesson notes, transcripts, and recordings kept searchable and accessible.",
  },
];

export function ProductEcosystem() {
  return (
    <section className="bg-white py-22 lg:py-28" id="ecosystem">
      <div className="container-editorial">
        <div className="mx-auto mb-14 max-w-[760px] text-center">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-crimson-dark">
            The Klassruum ecosystem
          </p>
          <h2 className="text-[34px] font-extrabold leading-[1.08] text-heading sm:text-[40px] md:text-[44px]">
            One platform with connected products for the whole learning community.
          </h2>
          <p className="mx-auto mt-4 max-w-[620px] text-[16px] leading-7 text-body">
            Each role sees a calm, focused surface, while content, delivery, reporting, and family visibility remain connected behind the scenes.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.title}
                className="group flex min-h-[210px] flex-col rounded-[20px] border border-border bg-[#fffdfa] p-5 shadow-[0_10px_24px_rgba(34,27,28,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(34,27,28,0.07)]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[14px] border border-border bg-white">
                  <Icon size={18} className="text-crimson-dark" />
                </div>

                <h3 className="mb-2 text-[18px] font-bold text-heading">
                  Klassruum {mod.title}
                </h3>
                <p className="flex-1 text-[15px] leading-6 text-body">{mod.description}</p>

                <div className="mt-5 flex items-center gap-1.5 text-[12px] font-semibold text-crimson-dark opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span>Learn more</span>
                  <ArrowRight size={12} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-[14px] text-muted">
            One login, one platform, one shared learning record.
          </p>
        </div>
      </div>
    </section>
  );
}
