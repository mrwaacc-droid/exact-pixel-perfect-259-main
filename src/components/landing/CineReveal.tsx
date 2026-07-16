import { type ReactNode, type JSX } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { cn } from "@/lib/utils";

type CineVariant = "up" | "scale" | "left" | "right";

type Props = {
    children: ReactNode;
    variant?: CineVariant;
    delay?: 0 | 1 | 2 | 3 | 4 | 5;
    className?: string;
    as?: keyof JSX.IntrinsicElements;
    threshold?: number;
    rootMargin?: string;
};

const variantClass: Record<CineVariant, string> = {
    up: "cine-reveal",
    scale: "cine-reveal-scale",
    left: "cine-reveal-left",
    right: "cine-reveal-right",
};

export function CineReveal({
    children,
    variant = "up",
    delay = 0,
    className,
    as: Tag = "div",
    threshold = 0.12,
    rootMargin = "0px 0px -80px 0px",
}: Props) {
    const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold, rootMargin });

    const Comp = Tag as any;

    return (
        <Comp
            ref={ref}
            className={cn(
                variantClass[variant],
                delay > 0 && `cine-delay-${delay}`,
                isVisible && "visible",
                className,
            )}
        >
            {children}
        </Comp>
    );
}