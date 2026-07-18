import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";

type PricingHref = "/demo/classroom" | "/institutions/register" | "/contact";

export function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "$0",
      period: "forever",
      description: "Explore a prepared AI classroom and experience the flow before any setup.",
      badge: "Start here",
      features: [
        "Pre-loaded classroom lesson",
        "Live teaching flow with board work",
        "Captions, transcript, and notes",
        "Accessibility controls to inspect",
      ],
      cta: { label: "Open demo classroom", to: "/demo/classroom" as PricingHref },
      featured: false,
    },
    {
      name: "Essential",
      price: "$149",
      period: "institution / month",
      description: "Launch a smaller AI classroom deployment with core teaching, billing, and learner workflows.",
      badge: "Essential",
      annualNote: "Save 15% annually",
      features: [
        "Institution workspace and billing",
        "Invite teachers by email",
        "Assign teachers to courses",
        "AI classroom lessons and live sessions",
        "Learner notes, transcripts, and progress",
        "Monthly subscription flow",
      ],
      cta: { label: "Start essential plan", to: "/institutions/register" as PricingHref },
      featured: false,
    },
    {
      name: "Growth",
      price: "$349",
      period: "institution / month",
      description: "Scale across programmes with stronger reporting, coordination, and rollout support.",
      badge: "Most popular",
      annualNote: "Save 20% annually",
      features: [
        "Everything in Essential",
        "Expanded teacher and programme support",
        "Advanced progress tracking and reporting",
        "Multi-course rollout workflows",
        "Priority onboarding guidance",
        "Faster support coverage",
      ],
      cta: { label: "Start growth plan", to: "/institutions/register" as PricingHref },
      featured: true,
    },
    {
      name: "Custom",
      price: "Custom",
      period: "annual agreement",
      description: "For large institutions needing governance, integrations, and tailored implementation.",
      badge: "Custom",
      features: [
        "Everything in Growth",
        "SSO and advanced security",
        "API and custom integrations",
        "Dedicated account manager",
        "SLA and compliance support",
        "Custom data retention and procurement support",
      ],
      cta: { label: "Contact us", to: "/contact" as PricingHref },
      featured: false,
    },
  ];

  return (
    <section className="cine-section" id="pricing" style={{ background: "var(--white, #FFFFFF)" }}>
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="mx-auto mb-12 grid max-w-6xl gap-6 border-b border-border pb-8 text-left md:grid-cols-[0.75fr_1fr] md:items-end">
          <div>
            <span className="cine-section-eyebrow">Pricing</span>
            <h2 className="cine-section-title mt-2">
              Simple ways to get started
            </h2>
          </div>
          <p className="max-w-xl text-[16px] leading-8 text-muted md:ml-auto">
            Start with a working classroom, then rent institution-ready virtual classrooms monthly with teacher hiring, course assignment, billing, lessons, and reporting in one place.
          </p>
        </div>

        <div className="mx-auto mb-5 flex max-w-6xl items-center justify-between gap-4 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
          <span>Choose a starting point</span>
          <span className="hidden text-crimson sm:inline">Monthly, annual savings, or custom scale</span>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-5 sm:grid-cols-2 2xl:max-w-[1320px] xl:grid-cols-4">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`pricing-track-card interactive-surface relative flex min-h-full flex-col overflow-hidden p-6 sm:p-7 xl:p-8 ${plan.featured
                ? "border border-white/10 text-white shadow-[0_24px_60px_-12px_rgba(125,34,51,0.45),0_8px_24px_-6px_rgba(0,0,0,0.5)] [background:linear-gradient(155deg,#1A1415_0%,#0F0A0B_55%,#15080C_100%)] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(125,34,51,0.28),transparent_60%)] before:opacity-90"
                : "border-border bg-white"
                }`}
            >
              {plan.featured && (
                <>
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-crimson to-transparent" />
                  <div className="pointer-events-none absolute -top-px left-1/2 h-24 w-3/4 -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(196,86,106,0.35),transparent_70%)] blur-md" />
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-crimson/50 to-transparent" />
                </>
              )}

              <div className="mb-7 flex items-start justify-between gap-4">
                <span
                  className={`inline-flex border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${plan.featured
                    ? "border-white/15 bg-white/8 text-white"
                    : "border-border bg-[#FAF8F7] text-body"
                    }`}
                >
                  {plan.badge}
                </span>
                {plan.featured && (
                  <span className="border border-crimson/25 bg-crimson-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-crimson-dark">
                    Recommended
                  </span>
                )}
              </div>

              <div>
                <h3 className={`font-sans text-xl font-extrabold ${plan.featured ? "text-white" : "text-ink"}`}>
                  {plan.name}
                </h3>
                <div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className={`font-sans text-[2.35rem] font-extrabold leading-none tracking-tight xl:text-[2.6rem] ${plan.featured ? "text-white" : "text-ink"}`}>
                    {plan.price}
                  </span>
                  <span className={`max-w-[10rem] text-sm font-medium leading-5 ${plan.featured ? "text-white/65" : "text-muted"}`}>
                    / {plan.period}
                  </span>
                </div>
                <p className={`mt-4 min-h-[72px] text-sm leading-6 ${plan.featured ? "text-white/72" : "text-muted"}`}>
                  {plan.description}
                </p>
                {"annualNote" in plan && plan.annualNote ? (
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-crimson">
                    {plan.annualNote}
                  </p>
                ) : null}
              </div>

                              <div className={`my-7 h-px ${plan.featured ? "bg-gradient-to-r from-transparent via-crimson/45 to-transparent" : "bg-border"}`} />

              <ul className="grid flex-1 gap-3">
                {plan.features.map((inc) => (
                  <li
                    key={inc}
                    className={`flex items-start gap-2.5 text-sm leading-6 ${plan.featured ? "text-white/85" : "text-body"}`}
                  >
                    <CheckCircle2
                      size={15}
                      className={`mt-0.5 shrink-0 ${plan.featured ? "text-[#E8B6BF]" : "text-crimson"}`}
                    />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={plan.cta.to}
                className={`mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 px-4 text-sm font-bold transition-all ${plan.featured
                  ? "border border-white/15 !text-white shadow-[0_8px_24px_-4px_rgba(125,34,51,0.6),inset_0_1px_0_rgba(255,255,255,0.12)] [background:linear-gradient(135deg,#A63A4B_0%,#7B1E2B_50%,#4F111B_100%)] hover:[background:linear-gradient(135deg,#B85060_0%,#8B2A3D_50%,#5C1829_100%)] hover:shadow-[0_10px_28px_-2px_rgba(125,34,51,0.7)] hover:-translate-y-0.5"
                  : "border border-border bg-white !text-ink hover:border-border-strong hover:bg-[#FAF8F7]"
                  }`}
              >
                <span>{plan.cta.label}</span>
                <ArrowRight size={15} />
              </Link>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-6 grid max-w-6xl gap-3 border-t border-border pt-5 text-sm leading-6 text-muted md:grid-cols-3 2xl:max-w-[1320px]">
          <p>
            <strong className="font-bold text-ink">No guesswork:</strong> demo first, deploy after fit is clear.
          </p>
          <p>
            <strong className="font-bold text-ink">Annual savings:</strong> paid plans include built-in yearly discount options for longer commitments.
          </p>
          <p>
            <strong className="font-bold text-ink">Teacher-ready:</strong> invite teachers, assign courses, and run AI, human, or hybrid classrooms.
          </p>
        </div>
      </div>
    </section>
  );
}
