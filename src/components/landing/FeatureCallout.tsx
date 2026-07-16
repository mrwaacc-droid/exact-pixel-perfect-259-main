import { cn } from "@/lib/utils";

type Props = {
  label: string;
  position?: string;
  className?: string;
};

export function FeatureCallout({ label, position, className }: Props) {
  return (
    <div
      className={cn(
        "absolute flex items-center gap-2.5 rounded-full border border-border bg-white/90 px-3.5 py-1.5 shadow-sm backdrop-blur-sm",
        className,
      )}
      style={position ? { top: position } : undefined}
    >
      {/* Dark-red dot */}
      <span className="h-2 w-2 shrink-0 rounded-full bg-crimson-dark" />
      {/* Thin connecting line (extends left) */}
      <span className="absolute right-full top-1/2 h-px w-8 -translate-y-1/2 bg-crimson-dark/30" />
      <span className="text-[12px] font-semibold text-ink whitespace-nowrap">{label}</span>
    </div>
  );
}
