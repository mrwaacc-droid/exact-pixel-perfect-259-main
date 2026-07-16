import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  id?: string;
};

export function DarkRedSection({ children, className, id }: Props) {
  return (
    <section
      id={id}
      className={cn(
        "relative overflow-hidden bg-crimson-dark text-white",
        className,
      )}
    >
      {/* Decorative background shapes */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-white/[0.03]" />
        <div className="absolute -left-32 bottom-0 h-[400px] w-[400px] rounded-full bg-white/[0.04]" />
        <div className="absolute right-1/4 top-1/2 h-64 w-64 -translate-y-1/2 rotate-45 rounded-[3rem] bg-white/[0.02]" />
      </div>
      <div className="relative">{children}</div>
    </section>
  );
}
