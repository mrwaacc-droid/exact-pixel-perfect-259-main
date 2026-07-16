import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpenCheck, Captions, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

import { Logo } from "@/components/brand/Logo";

type AuthBrandRailProps = {
  eyebrow: string;
  title: string;
  body: string;
  stats?: Array<{ label: string; value: string }>;
  proofPoints?: string[];
  variant?: "auth" | "institution";
  benefits?: Array<{ icon: ReactNode; title: string; body: string }>;
};

const DEFAULT_STATS = [
  { label: "Active learners", value: "10k+" },
  { label: "Institutions", value: "500+" },
  { label: "Satisfaction", value: "98%" },
];

const DEFAULT_PROOF_POINTS = ["Guided AI teacher", "Accessible by design", "Institution controls"];
const AUTH_RAIL_IMAGE = "/images/scenes/schools.png";

export function AuthBrandRail({
  eyebrow,
  title,
  body,
  stats = DEFAULT_STATS,
  proofPoints = DEFAULT_PROOF_POINTS,
  variant = "auth",
  benefits,
}: AuthBrandRailProps) {
  return (
    <aside className={`auth-brand-rail auth-brand-rail--${variant} hidden text-white lg:flex`}>
      <img
        src={AUTH_RAIL_IMAGE}
        alt="Students learning together with Klassruum"
        className="auth-brand-rail__image"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      <div className="auth-brand-rail__shade" />
      <div className="auth-brand-rail__grid" />
      <div className="auth-brand-photo" aria-hidden="true">
        <img src={AUTH_RAIL_IMAGE} alt="" />
      </div>

      <Link to="/" className="auth-brand-logo" aria-label="Klassruum home">
        <Logo size={34} variant="default" />
      </Link>

      <div className="auth-brand-rail__content">
        <div className="auth-brand-eyebrow">
          <Sparkles size={14} />
          {eyebrow}
        </div>
        <h1>{title}</h1>
        <p>{body}</p>

        {benefits ? (
          <div className="auth-brand-benefits">
            {benefits.map((item) => (
              <div key={item.title} className="auth-brand-benefit">
                <div className="auth-brand-benefit__icon">{item.icon}</div>
                <div>
                  <h2>{item.title}</h2>
                  <p>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="auth-teaching-card" aria-hidden="true">
            <div className="auth-teaching-card__top">
              <span>Live classroom</span>
              <strong>Teacher explaining</strong>
            </div>
            <div className="auth-teaching-board">
              <span className="auth-teaching-board__label">Current board</span>
              <strong>Explain clearly. Check understanding. Adapt pace.</strong>
            </div>
            <div className="auth-teaching-signals">
              <span>
                <BookOpenCheck size={14} />
                Board work
              </span>
              <span>
                <Captions size={14} />
                Captions
              </span>
              <span>
                <ShieldCheck size={14} />
                Guardrails
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="auth-brand-rail__footer">
        <div className="auth-brand-stats">
          {stats.map((stat) => (
            <div key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="auth-brand-proof">
          {proofPoints.map((point) => (
            <span key={point}>
              <CheckCircle2 size={14} />
              {point}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
