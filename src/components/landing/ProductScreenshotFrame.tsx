import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  showBrowserBar?: boolean;
};

export function ProductScreenshotFrame({
  children,
  className,
  showBrowserBar = true,
}: Props) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] border border-border bg-white shadow-[0_22px_52px_rgba(34,27,28,0.08)]",
        className,
      )}
    >
      {showBrowserBar && (
        <div className="flex items-center gap-2 border-b border-border bg-[#fdf8f3] px-5 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-crimson-dark/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-beige" />
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
          <div className="ml-4 flex-1 rounded-full border border-border bg-white px-4 py-1 text-[11px] text-muted">
            classroom.klassruum.com
          </div>
        </div>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
