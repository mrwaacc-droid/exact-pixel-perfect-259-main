/** Shared landing page primitives. */

import { Link } from "@tanstack/react-router";
import { Check, Minus, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  id,
  theme = "light",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  className?: string;
  id?: string;
  theme?: "dark" | "light";
}) {
  return (
    <div
      className={cn(
        align === "center" ? "mx-auto max-w-[860px] text-center" : "max-w-[660px] text-left",
        className,
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2
        id={id}
        className={cn(
          "font-bold",
          theme === "dark" ? "text-white" : "text-heading",
          "text-[28px] leading-tight sm:text-[34px] md:text-[42px]",
          eyebrow ? "mt-4" : "",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-4 text-[16px] leading-7 md:text-[17px]",
            theme === "dark" ? "text-white/60" : "text-body",
            align === "center" ? "mx-auto" : "",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

type CTAVariant = "primary" | "secondary" | "ghost" | "dark";
type CTASize = "sm" | "md" | "lg";

function ctaClasses(variant: CTAVariant, size: CTASize, className?: string) {
  return cn(
    "group relative inline-flex items-center justify-center gap-2 rounded-md border font-semibold no-underline transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-heading focus-visible:ring-offset-2 active:translate-y-px",
    size === "lg" && "min-h-12 px-6 py-3 text-[15px]",
    size === "md" && "min-h-10 px-5 py-2 text-[14px]",
    size === "sm" && "min-h-9 px-4 py-1.5 text-[13px]",
    variant === "primary" && "border-heading bg-heading text-white shadow-sm hover:bg-navy-light",
    variant === "secondary" && "border-border bg-white text-heading hover:bg-border-soft",
    variant === "ghost" && "border-transparent bg-transparent text-body hover:text-heading",
    variant === "dark" && "border-heading bg-heading text-white hover:bg-navy-light",
    className,
  );
}

export function CTAButton({
  children,
  to,
  href,
  onClick,
  variant = "primary",
  size = "md",
  className,
  ariaLabel,
  showArrow,
}: {
  children: ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
  variant?: CTAVariant;
  size?: CTASize;
  className?: string;
  ariaLabel?: string;
  showArrow?: boolean;
}) {
  const cls = ctaClasses(variant, size, className);
  const inner = (
    <>
      {children}
      {showArrow && (
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      )}
    </>
  );

  if (to)
    return (
      <Link to={to as never} className={cls} aria-label={ariaLabel} onClick={onClick}>
        {inner}
      </Link>
    );
  if (href)
    return (
      <a href={href} className={cls} aria-label={ariaLabel} onClick={onClick}>
        {inner}
      </a>
    );
  return (
    <button type="button" onClick={onClick} className={cls} aria-label={ariaLabel}>
      {inner}
    </button>
  );
}

export function SurfaceCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn("lp-premium-card group relative p-5 transition-all duration-200", className)}
    >
      <div className="relative text-heading">{children}</div>
    </div>
  );
}

export function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <SurfaceCard className="h-full">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-crimson-soft text-crimson">
        {icon}
      </div>
      <h3 className="mt-4 text-[16px] font-semibold text-heading">{title}</h3>
      <p className="mt-2 text-[14px] leading-relaxed text-body">{description}</p>
    </SurfaceCard>
  );
}

export function StatCard({ value, label, hint }: { value: string; label: string; hint?: string }) {
  return (
    <div className="lp-premium-card group relative p-4 transition-all duration-200">
      <div className="text-[26px] font-bold text-heading sm:text-[32px]">{value}</div>
      <div className="mt-1 text-xs font-semibold text-body sm:text-sm">{label}</div>
      {hint ? <div className="mt-1 text-[11px] text-muted">{hint}</div> : null}
    </div>
  );
}

export function YesMark({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-education-green">
      <Check className="h-4 w-4" aria-hidden />
      {label ? (
        <span className="text-sm text-body">{label}</span>
      ) : (
        <span className="sr-only">Yes</span>
      )}
    </span>
  );
}

export function NoMark({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted">
      <Minus className="h-4 w-4" aria-hidden />
      {label ? (
        <span className="text-sm text-muted">{label}</span>
      ) : (
        <span className="sr-only">No</span>
      )}
    </span>
  );
}
