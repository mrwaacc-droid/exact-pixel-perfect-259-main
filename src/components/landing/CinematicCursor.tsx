import { useEffect, useRef, useState } from "react";

/**
 * CinematicCursor — a custom teal cursor with a lagging ring.
 * Replaces the OS cursor on desktop (pointer devices only).
 * Automatically expands on hover over interactive elements.
 * Reduced-motion: hidden, OS cursor restored.
 */
export function CinematicCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Check for reduced motion and touch devices
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasTouch = window.matchMedia("(hover: none)").matches;

    if (prefersReducedMotion || hasTouch) {
      document.documentElement.classList.remove("has-custom-cursor");
      return;
    }

    // Add indicator class to document so CSS can hide default cursor
    document.documentElement.classList.add("has-custom-cursor");
    setIsVisible(true);

    const cursor = cursorRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let isHovering = false;

    // Update coordinates
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (dot) {
        dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
    };

    // Smooth animation loop for the lagging ring
    let animationFrameId = 0;
    const LERP_FACTOR = 0.15; // smooth lag factor

    const renderRing = () => {
      // Lerp ring coordinates towards mouse coordinates
      ringX += (mouseX - ringX) * LERP_FACTOR;
      ringY += (mouseY - ringY) * LERP_FACTOR;

      if (ring) {
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(renderRing);
    };

    animationFrameId = requestAnimationFrame(renderRing);

    // Track mouse enter/leave window
    const handleMouseLeaveWindow = () => {
      if (cursor) cursor.style.opacity = "0";
    };

    const handleMouseEnterWindow = () => {
      if (cursor) cursor.style.opacity = "1";
    };

    // Event delegation for hover states
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const isInteractive = target.closest(
        'a, button, [role="button"], .mode-chip, [data-magnetic], .cursor-pointer, input[type="submit"], input[type="button"]',
      );

      if (isInteractive) {
        if (!isHovering) {
          isHovering = true;
          document.body.classList.add("cursor-hover");
        }
      } else {
        if (isHovering) {
          isHovering = false;
          document.body.classList.remove("cursor-hover");
        }
      }
    };

    // Track active mouse down/up state
    const handleMouseDown = () => {
      document.body.classList.add("cursor-active");
    };

    const handleMouseUp = () => {
      document.body.classList.remove("cursor-active");
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeaveWindow);
    document.addEventListener("mouseenter", handleMouseEnterWindow);
    document.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeaveWindow);
      document.removeEventListener("mouseenter", handleMouseEnterWindow);
      document.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.documentElement.classList.remove("has-custom-cursor");
      document.body.classList.remove("cursor-hover", "cursor-active", "cursor-magnetic");
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      ref={cursorRef}
      className="lp-cursor fixed pointer-events-none z-[9999] transition-opacity duration-300 hidden lg:block"
      style={{ top: 0, left: 0, opacity: 0 }}
    >
      <div
        ref={dotRef}
        className="lp-cursor-dot absolute w-2 h-2 rounded-full bg-[var(--crimson)] -translate-x-1/2 -translate-y-1/2 shadow-[0_0_12px_rgba(31,124,128,0.8),0_0_24px_rgba(31,124,128,0.4)] transition-transform duration-100 ease-out"
      />
      <div
        ref={ringRef}
        className="lp-cursor-ring absolute w-9 h-9 rounded-full border-1.5 border-[var(--crimson)]/50 -translate-x-1/2 -translate-y-1/2 transition-[width,height,border-color] duration-300 ease-out"
      />
    </div>
  );
}
