import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RoleEntryCardProps {
    title: string;
    description: string;
    image: string;
    imageAlt: string;
    href: string;
    accent?: "crimson" | "brown" | "green" | "amber";
    shape?: "organic" | "arch" | "alt";
    children?: ReactNode;
    className?: string;
}

const accentMap = {
    crimson: "bg-[#7D2233] text-white",
    brown: "bg-[#A0522D] text-white",
    green: "bg-[#2F7D5A] text-white",
    amber: "bg-[#C97922] text-white",
};

const shapeMap = {
    organic: "rounded-[24px_24px_24px_64px]",
    arch: "rounded-[64px_24px_24px_24px]",
    alt: "rounded-[48px_48px_24px_24px]",
};

export function RoleEntryCard({
    title, description, image, imageAlt, href, accent = "crimson", shape = "organic", children, className = "",
}: RoleEntryCardProps) {
    return (
        <a href={href} className={cn("group relative block overflow-hidden bg-white border border-[#E7DAD1] shadow-sm transition-all duration-200 hover:shadow-md", shapeMap[shape], className)}>
            <div className="relative aspect-[4/3] overflow-hidden bg-[#F4ECE4]">
                <img src={image} alt={imageAlt} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#221B1C]/40 to-transparent" />
                <div className={cn("absolute top-4 left-4 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider", accentMap[accent])}>
                    {title}
                </div>
            </div>
            <div className="p-5">
                <p className="text-[15px] font-semibold text-[#221B1C] mb-1">{title}</p>
                <p className="text-[13px] text-[#6F5C60] leading-relaxed">{description}</p>
                {children}
            </div>
        </a>
    );
}