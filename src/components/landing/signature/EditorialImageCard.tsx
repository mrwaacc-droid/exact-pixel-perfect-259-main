import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EditorialImageCardProps {
  image: string;
  imageAlt: string;
  caption?: string;
  shape?: "organic" | "arch" | "alt" | "sloped";
  children?: ReactNode;
  className?: string;
}

const shapeMap = {
  organic: "rounded-[24px_24px_24px_64px]",
  arch: "rounded-[64px_24px_24px_24px]",
  alt: "rounded-[48px_48px_24px_24px]",
  sloped: "rounded-[24px_64px_24px_24px]",
};

export function EditorialImageCard({ image, imageAlt, caption, shape = "organic", children, className = "" }: EditorialImageCardProps) {
  return (
    <div className={cn("relative overflow-hidden bg-[#F4ECE4] border border-[#E7DAD1]", shapeMap[shape], className)}>
      <img src={image} alt={imageAlt} loading="lazy" className="w-full h-full object-cover" />
      {caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#221B1C]/80 to-transparent p-4">
          <p className="text-[13px] text-white/90 font-medium">{caption}</p>
        </div>
      )}
      {children}
    </div>
  );
}
