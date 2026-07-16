import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface OrganicSectionFrameProps {
  children?: ReactNode;
  className?: string;
  variant?: "curve-top" | "curve-bottom" | "asymmetric";
}

export function OrganicSectionFrame({ children, className = "", variant = "asymmetric" }: OrganicSectionFrameProps) {
  const variants = {
    "curve-top": "rounded-[100%_100%_0_0_/_40px_40px_0_0]",
    "curve-bottom": "rounded-[0_0_100%_100%_/_0_0_40px_40px]",
    asymmetric: "rounded-[24px_24px_24px_80px]",
  };
  return (
    <div className={cn("relative overflow-hidden", variants[variant], className)}>
      {children}
    </div>
  );
}
