import { type ReactNode, type JSX } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { cn } from "@/lib/utils";

type RevealVariant = "up" | "scale" | "left" | "right";

type Props = {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: 0 | 1 | 2 | 3 | 4 | 5;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  threshold?: number;
  rootMargin?: string;
};

const variantClass: Record<RevealVariant, string> = {
  up: "reveal",
  scale: "reveal-scale",
  left: "reveal-left",
  right: "reveal-right",
};

export function Reveal({
  children,
  variant = "up",
  delay = 0,
  className,
  as: Tag = "div",
  threshold = 0.15,
  rootMargin = "0px 0px -60px 0px",
}: Props) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold, rootMargin });

  const Comp = Tag as any;

  return (
    <Comp
      ref={ref}
      className={cn(
        variantClass[variant],
        delay > 0 && `reveal-delay-${delay}`,
        isVisible && "visible",
        className,
      )}
    >
      {children}
    </Comp>
  );
}
