/**
 * InfoPage — shared branded layout for marketing / informational pages.
 */

import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { Footer } from "@/components/landing/Footer";
import { CTAButton } from "@/components/landing/primitives";
import "@/styles/landing.css";

export interface InfoSection {
  title: string;
  body: string;
  icon?: ReactNode;
}

export function InfoPage({
  eyebrow,
  title,
  intro,
  sections,
  cta,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections?: InfoSection[];
  cta?: { label: string; to: string };
  children?: ReactNode;
}) {
  const proofPoints = ["Institution-ready", "Accessible by design", "AI teacher workflow"];

  return (
    <div className="landing-page-shell min-h-screen overflow-hidden text-heading">
      {/* Header */}
      <header className="auth-tech-nav sticky top-0 z-40 border-b">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center">
            <Logo size={34} />
          </Link>
          <nav className="flex items-center gap-6 text-sm font-semibold text-gray-500">
            <Link to="/" className="hidden transition-colors hover:text-heading sm:inline">
              Home
            </Link>
            <Link to="/features" className="hidden transition-colors hover:text-heading sm:inline">
              Features
            </Link>
            <Link to="/pricing" className="hidden transition-colors hover:text-heading sm:inline">
              Pricing
            </Link>
            <Link
              to="/demo/classroom"
              className="hidden transition-colors hover:text-heading sm:inline"
            >
              Demo
            </Link>
            <CTAButton to="/auth" size="md" className="h-10 px-4 rounded-full font-bold">
              Get started
            </CTAButton>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative border-b border-border bg-page-background-alt">
        <div className="relative mx-auto grid max-w-[1200px] items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1fr_390px]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-learning-blue" aria-hidden /> {eyebrow}
            </span>
            <h1 className="mt-6 max-w-4xl text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-[1.12] tracking-tight text-heading font-headings">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-body sm:text-lg">
              {intro}
            </p>

            <div className="mt-8 flex flex-wrap gap-2.5">
              {proofPoints.map((point) => (
                <span
                  key={point}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-semibold text-body shadow-sm"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-learning-blue" aria-hidden />
                  {point}
                </span>
              ))}
            </div>

            {cta && (
              <CTAButton to={cta.to as never} size="lg" showArrow className="mt-8 rounded-full">
                {cta.label}
              </CTAButton>
            )}
          </div>

          <aside className="relative hidden lg:block" aria-label="Klassruum platform highlights">
            <div className="lp-premium-card overflow-hidden p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Live workspace</p>
                  <p className="mt-1 text-sm font-semibold text-heading">Voice, board, captions</p>
                </div>
                <span className="rounded-full bg-soft-green border border-green-100 px-3 py-0.5 text-[11px] font-bold text-education-green">Online</span>
              </div>
              <div className="mt-5 rounded-xl border border-white/10 bg-[var(--ink)] p-4 text-white shadow-inner">
                <div className="flex items-center gap-2 text-[10px] text-muted font-bold uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-education-green animate-pulse" />
                  AI teacher explaining
                </div>
                <div className="mt-3 rounded-lg bg-white p-4 text-heading">
                  <p className="font-[Caveat,cursive] text-2xl font-bold text-learning-blue">x² + 5x + 6 = 0</p>
                  <p className="mt-2 text-xs text-body font-medium">Factor, explain, caption, and save every step.</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                {[["68%", "progress"], ["14", "notes"], ["2", "questions"]].map(([value, label]) => (
                  <div key={label} className="rounded-xl border border-border bg-page-background-alt p-2.5">
                    <div className="text-base font-extrabold text-heading">{value}</div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-muted mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Sections */}
      {sections && sections.length > 0 && (
        <section className="relative mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:py-20">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((s) => (
              <div
                key={s.title}
                className="lp-premium-card p-6 text-left transition-all"
              >
                {s.icon && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-soft-blue text-learning-blue shrink-0">
                    {s.icon}
                  </div>
                )}
                <h3 className="mt-4 text-lg font-bold tracking-tight text-heading">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-body">{s.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {children && (
        <section className="mx-auto max-w-[1120px] px-5 py-12 sm:px-8 text-left">
          {children}
        </section>
      )}

      <Footer />
    </div>
  );
}
