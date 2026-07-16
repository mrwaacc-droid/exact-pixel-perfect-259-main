import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "beige" | "dark";

type Props = {
  children: ReactNode;
  className?: string;
  variant?: Variant;
};

const variantClasses: Record<Variant, string> = {
  default: "bg-transparent",
  beige: "bg-beige-soft rounded-3xl",
  dark: "bg-crimson-dark rounded-3xl",
};

export function IllustrationScene({ children, className, variant = "default" }: Props) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center p-8",
        variantClasses[variant],
        className,
      )}
    >
      {variant === "beige" && (
        <div className="pointer-events-none absolute inset-0 rounded-3xl">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-crimson-dark/5" />
          <div className="absolute -bottom-4 -left-4 h-16 w-16 rotate-12 rounded-2xl bg-crimson-dark/5" />
        </div>
      )}
      {variant === "dark" && (
        <div className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/[0.04]" />
          <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-white/[0.03]" />
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
