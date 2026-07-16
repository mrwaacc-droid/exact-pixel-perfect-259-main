import { School, GraduationCap, Users, Heart, Briefcase, Monitor, ShieldCheck, Lock, Eye } from "lucide-react";

export function InstitutionStrip() {
  const items = [
    { label: "Schools", icon: School },
    { label: "Universities", icon: GraduationCap },
    { label: "Tutoring centres", icon: Users },
    { label: "NGOs", icon: Heart },
    { label: "Training organisations", icon: Briefcase },
    { label: "Online academies", icon: Monitor },
  ];

  const trustBadges = [
    { label: "GDPR Compliant", icon: ShieldCheck },
    { label: "WCAG 2.2 Ready", icon: Eye },
    { label: "Role-based Access", icon: Lock },
  ];

  const marqueeItems = [...items, ...items];

  return (
    <section className="cine-marquee" id="institution-types" aria-label="Institution types and compliance">
      <div className="mx-auto max-w-[1240px] px-6">
        <p className="mb-6 text-center text-[12px] font-semibold uppercase tracking-[0.16em] text-muted">
          Built for the places where serious learning happens
        </p>

        <div className="cine-marquee-track" role="list">
          {marqueeItems.map((item, i) => (
            <div key={`${item.label}-${i}`} className="cine-marquee-item" role="listitem">
              <item.icon size={16} />
              {item.label}
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 border-t border-border pt-4">
          {trustBadges.map((badge) => (
            <div key={badge.label} className="flex items-center gap-1.5 text-[11px] font-semibold text-success">
              <badge.icon size={13} />
              <span>{badge.label}</span>
            </div>
          ))}
        </div>

        {/* SEO-rich hidden content for search engines */}
        <div className="sr-only" aria-hidden="false">
          <p>
            Klassruum serves schools, universities, training organisations, tutoring centres, NGOs, and online academies
            with AI-powered virtual classroom delivery. The platform is GDPR compliant, WCAG 2.2 accessible, and supports
            role-based access control for learners, teachers, institution administrators, and parents.
          </p>
        </div>
      </div>
    </section>
  );
}