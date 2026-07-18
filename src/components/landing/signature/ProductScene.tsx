import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ProductSceneProps {
  children?: ReactNode;
  className?: string;
  bg?: "light" | "dark" | "beige";
}

const bgMap = {
  light: "bg-[#FAF8F7]",
  dark: "bg-white",
  beige: "bg-[#F5F2F0]",
};

export function ProductScene({ children, className = "", bg = "light" }: ProductSceneProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-[#DDD5D0] p-6 lg:p-8", bgMap[bg], className)}>
      {children}
    </div>
  );
}
