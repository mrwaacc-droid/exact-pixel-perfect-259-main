import { Link } from "@tanstack/react-router";
import { ArrowRight, GraduationCap, BookOpen, Building2, Heart } from "lucide-react";
import { CineReveal } from "./CineReveal";

const roleLinks = [
  { icon: GraduationCap, label: "I'm a learner", href: "/demo/classroom" },
  { icon: BookOpen, label: "I'm a teacher", href: "/auth" },
  { icon: Building2, label: "I represent an institution", href: "/institutions/register" },
  { icon: Heart, label: "I'm a parent", href: "/auth" },
];

export function FinalCTA() {
  return (
    <section className="cine-section cine-final" id="final-cta">
      <div className="relative z-10 mx-auto max-w-[1240px] px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_0.5fr] lg:gap-16">
          <CineReveal>
            <div className="max-w-xl">
              <span
                className="cine-section-eyebrow"
                style={{ color: "#fff" }}
              >
                <span
                  style={{
                    background: "var(--white, #FFFFFF)",
                    height: "1.5px",
                    width: "24px",
                    display: "inline-block",
                  }}
                />
                Bring your content to life
              </span>
              <h2 className="cine-final-title mt-4">
                Start with a classroom demo. Then build your own.
              </h2>
              <p className="cine-final-sub mt-6">
                Create structured lessons from your course materials, choose an AI teacher voice, and give every learner a classroom that explains, responds, and remembers. Klassruum is the AI-powered virtual classroom platform built for schools, universities, training organisations, and online academies — GDPR-compliant and WCAG 2.2 accessible.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/demo/classroom" className="cine-final-btn">
                  Build a Classroom
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/institutions/register"
                  className="cine-final-btn cine-final-btn--ghost"
                >
                  Request a Demonstration
                </Link>
              </div>

              <div className="mt-12 border-t border-white/10 pt-8">
                <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">
                  Or choose your path
                </p>
                <div className="flex flex-wrap gap-2">
                  {roleLinks.map((role) => {
                    const Icon = role.icon;
                    return (
                      <Link key={role.label} to={role.href} className="cine-role-pill">
                        <Icon size={14} />
                        {role.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </CineReveal>

          <CineReveal variant="right" delay={2} className="hidden lg:block">
            <img
              src="/images/scenes/cinematic-01.png"
              alt="Klassruum classroom experience preview"
              className="cine-image"
              style={{
                filter: "drop-shadow(0 40px 80px rgba(0,0,0,0.5))",
                opacity: 0.9,
              }}
              loading="lazy"
            />
          </CineReveal>
        </div>
      </div>
    </section>
  );
}