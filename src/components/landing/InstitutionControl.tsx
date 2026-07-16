import { Link } from "@tanstack/react-router";
import { CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { CineReveal } from "./CineReveal";

const controls = [
  "Review and approve lessons before release",
  "Control curriculum sources and materials",
  "Manage users, roles, and permissions",
  "Monitor live classroom sessions",
  "Review progress and support needs",
  "Export transcripts, notes, and records",
];

export function InstitutionControl() {
  return (
    <section className="cine-section" id="institutions" style={{ background: "#fff" }}>
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <CineReveal className="max-w-2xl">
            <span className="cine-section-eyebrow">Institution operations</span>
            <h2 className="cine-section-title">
              Powerful for learners.{" "}
              <span className="text-crimson-dark">Controlled by institutions.</span>
            </h2>
            <p className="cine-section-sub mt-5">
              Keep complete command over what is taught, who has access, and how progress is evaluated. Institutions approve every lesson, assign teachers to courses, and monitor sessions — while learners experience a clean, focused classroom instead of a dashboard.
            </p>

            <div className="mt-8 cine-control-list sm:grid-cols-2">
              {controls.map((control) => (
                <div key={control} className="cine-control-item">
                  <span className="cine-control-check">
                    <CheckCircle2 size={14} />
                  </span>
                  <span>{control}</span>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link to="/institutions/register" className="cine-btn-primary" style={{ height: "44px", fontSize: "14px" }}>
                Set up your institution
                <ArrowRight size={14} />
              </Link>
            </div>
          </CineReveal>

          <CineReveal variant="right" delay={1} className="cine-image-wrap">
            <img
              src="/images/scenes/cinematic-05.png"
              alt="Institution control panel for reviewing lessons, managing governance, and monitoring classroom sessions"
              className="cine-image"
              loading="lazy"
            />
          </CineReveal>
        </div>

        <CineReveal delay={2} className="mt-12 flex flex-wrap items-center justify-center gap-6 border-t border-border pt-8">
          <div className="flex items-center gap-2 text-[14px] font-medium text-muted">
            <ShieldCheck size={16} className="text-crimson-dark" />
            <span>GDPR Compliant</span>
          </div>
          <div className="flex items-center gap-2 text-[14px] font-medium text-muted">
            <CheckCircle2 size={16} className="text-crimson-dark" />
            <span>WCAG 2.2 Ready</span>
          </div>
          <div className="flex items-center gap-2 text-[14px] font-medium text-muted">
            <ShieldCheck size={16} className="text-crimson-dark" />
            <span>Institution reviewed</span>
          </div>
        </CineReveal>
      </div>
    </section>
  );
}
