import { ShieldCheck, Lock, Eye, Database, CheckCircle2 } from "lucide-react";
import { Reveal } from "./Reveal";

const trustPillars = [
  {
    icon: ShieldCheck,
    title: "Institution-controlled materials",
    description: "Your content, your curriculum, your approval. Nothing is taught without institutional sign-off.",
  },
  {
    icon: Lock,
    title: "Role-based access",
    description: "Teachers, learners, and parents see only what their role permits. No cross-role data leakage.",
  },
  {
    icon: Eye,
    title: "Private learner records",
    description: "Individual progress, questions, and notes stay confidential. Access is controlled by policy.",
  },
  {
    icon: Database,
    title: "Clear AI data boundaries",
    description: "The AI teacher uses your approved content — not the open web. Responses are grounded in your materials.",
  },
];

export function PrivacyTrust() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28 bg-white" id="trust">
      <div className="container-editorial relative z-10">
        <Reveal className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-crimson-dark mb-3">
            Privacy and trust
          </p>
          <h2 className="text-xl sm:text-2xl font-extrabold text-heading leading-tight">
            Institution-controlled. Learner-focused.
          </h2>
          <p className="text-muted mt-4 text-base leading-relaxed max-w-xl mx-auto">
            Built for institutions that take data seriously. No shortcuts.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {trustPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Reveal key={pillar.title} className="p-5 rounded-2xl border border-border bg-page-background hover:bg-beige-soft transition-colors">
                <div className="w-10 h-10 rounded-xl bg-crimson-soft flex items-center justify-center mb-4">
                  <Icon size={18} className="text-crimson-dark" />
                </div>
                <h3 className="text-[14px] font-bold text-heading mb-2">{pillar.title}</h3>
                <p className="text-[13px] leading-6 text-muted">{pillar.description}</p>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="bg-page-background border border-border rounded-2xl p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-bold text-heading mb-3">Compliance you can trust</h3>
              <p className="text-[13px] leading-6 text-muted mb-5">
                We only publish compliance claims that have been verified. No badges displayed as visual trust symbols without substance.
              </p>
            </div>

            <div className="space-y-3">
              {[
                "GDPR-aligned workflows",
                "WCAG 2.2 accessibility practices",
                "Role-based access control",
                "Zero advertising policy",
              ].map((badge) => (
                <div key={badge} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-border">
                  <CheckCircle2 size={16} className="text-success shrink-0" />
                  <span className="text-[13px] font-medium text-heading">{badge}</span>
                  <span className="ml-auto text-[10px] font-bold text-success uppercase tracking-wider">Verified</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
