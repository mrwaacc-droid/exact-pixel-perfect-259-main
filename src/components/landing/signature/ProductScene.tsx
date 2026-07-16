import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ProductSceneProps {
  children?: ReactNode;
  className?: string;
  bg?: "light" | "dark" | "beige";
}

const bgMap = {
  light: "bg-[#FBF8F5]",
  dark: "bg-white",
  beige: "bg-[#F4ECE4]",
};

export function ProductScene({ children, className = "", bg = "light" }: ProductSceneProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-[#E7DAD1] p-6 lg:p-8", bgMap[bg], className)}>
      {children}
    </div>
  );
}
