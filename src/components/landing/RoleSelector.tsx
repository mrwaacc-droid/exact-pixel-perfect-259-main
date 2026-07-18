import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Building2, GraduationCap, Heart } from "lucide-react";
import { CineReveal } from "./CineReveal";

const roles = [
  {
    id: "learner",
    icon: GraduationCap,
    title: "Learners",
    description: "Learn through a real AI-teacher classroom with voice, board work, live questions, and adaptive support. Captions, transcripts, and accessibility modes are available for every session.",
    cta: "Explore a classroom",
    href: "/demo/classroom",
  },
  {
    id: "teacher",
    icon: BookOpen,
    title: "Teachers",
    description: "Prepare, review, and supervise AI-delivered lessons with full oversight. Approve content, monitor sessions, and step in when learners need human support.",
    cta: "See teacher tools",
    href: "/auth",
  },
  {
    id: "admin",
    icon: Building2,
    title: "Institutions",
    description: "Turn approved materials into managed classrooms with reporting, governance, and role-based access. Control curriculum, users, and billing from one workspace.",
    cta: "Request a demonstration",
    href: "/institutions/register",
  },
  {
    id: "parent",
    icon: Heart,
    title: "Families",
    description: "Follow your child's progress, view learning evidence, and support their journey. See attendance, completed lessons, and areas where extra help is needed.",
    cta: "View parent experience",
    href: "/auth",
  },
];

export function RoleSelector() {
  return (
    <section className="cine-section" id="roles" style={{ background: 'var(--page-background, #FAF8F7)' }}>
      <div className="mx-auto max-w-[1240px] px-6">
        <CineReveal className="mx-auto mb-14 max-w-2xl text-center">
          <span className="cine-section-eyebrow justify-center">Choose your path</span>
          <h2 className="cine-section-title">
            Klassruum works for everyone in the learning ecosystem
          </h2>
          <p className="cine-section-sub mt-5 mx-auto">
            Whether you are learning, teaching, managing, or supporting, there is a dedicated experience waiting for you.
          </p>
        </CineReveal>

        <div className="cine-role-grid">
          {roles.map((role, i) => {
            const Icon = role.icon;
            return (
              <CineReveal key={role.id} delay={(i + 1) as 1 | 2 | 3 | 4} variant="up">
                <Link to={role.href} className="cine-role-item group">
                  <div className="flex items-center gap-2">
                    <Icon size={18} className="text-crimson-dark" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-crimson-dark">
                      {role.id === "admin" ? "Operations" : role.id}
                    </span>
                  </div>

                  <h3 className="cine-role-title">{role.title}</h3>
                  <p className="cine-role-desc">{role.description}</p>

                  <div className="cine-role-cta">
                    <span>{role.cta}</span>
                    <ArrowRight size={14} className="cine-role-cta-arrow" />
                  </div>
                </Link>
              </CineReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
