import { useId, useMemo } from "react";
import { cn } from "@/lib/utils";

type LogoVariant = "default" | "light" | "dark";

export function LogoMark({
  className,
  size = 36,
  id,
  variant = "default",
}: {
  className?: string;
  size?: number;
  id?: string;
  variant?: LogoVariant;
}) {
  const reactId = useId();
  const uid = useMemo(() => id || `kl-${reactId.replace(/:/g, "")}`, [id, reactId]);
  const isLight = variant === "light";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("select-none", className)}
      aria-hidden="true"
    >
      <defs>
        {/* K letter — deep bordeaux wine gradient */}
        <linearGradient
          id={`${uid}-k`}
          x1="12"
          y1="19"
          x2="34"
          y2="43"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={isLight ? "#FDF6F7" : "#9A3247"} />
          <stop offset="52%" stopColor={isLight ? "#F0D7DC" : "#7D2233"} />
          <stop offset="100%" stopColor={isLight ? "#E4C2CA" : "#521326"} />
        </linearGradient>
        {/* Mortarboard — warm ink gradient */}
        <linearGradient
          id={`${uid}-cap`}
          x1="6"
          y1="9"
          x2="42"
          y2="23"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={isLight ? "#ffffff" : "#382B2D"} />
          <stop offset="100%" stopColor={isLight ? "#F0D7DC" : "#191314"} />
        </linearGradient>
        {/* Tassel — antique gold gradient */}
        <linearGradient
          id={`${uid}-gold`}
          x1="41"
          y1="16"
          x2="44"
          y2="26"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#C9A54A" />
          <stop offset="55%" stopColor="#A8842C" />
          <stop offset="100%" stopColor="#8A6A1F" />
        </linearGradient>
      </defs>

      {/* K letter — the learner, standing beneath the cap */}
      <path
        d="M14 19 V42 H19.4 V33.2 L21.1 31.3 L29.4 42 H36 L24.6 27.2 L35 19 H27.6 L19.4 25.8 V19 Z"
        fill={`url(#${uid}-k)`}
      />
      {/* Subtle specular edge on the K's left stem */}
      <path
        d="M14 19 H15.6 V42 H14 Z"
        fill="#ffffff"
        opacity={isLight ? 0.25 : 0.14}
      />

      {/* Mortarboard body */}
      <path d="M4.5 16 L24 8.2 L43.5 16 L24 23.8 Z" fill={`url(#${uid}-cap)`} />
      {/* Crisp top-edge highlight (upper-left facet catches the light) */}
      <path
        d="M4.5 16 L24 8.2 L43.5 16 L24 9.6 Z"
        fill="#ffffff"
        opacity={isLight ? 0.35 : 0.16}
      />
      {/* Cap underside band */}
      <path
        d="M15 19.6 V25.4 C15 27.9 19 29.4 24 29.4 C29 29.4 33 27.9 33 25.4 V19.6 L24 23.2 Z"
        fill={isLight ? "#F0D7DC" : "#191314"}
        opacity="0.95"
      />

      {/* Tassel thread — antique gold, the premium signature */}
      <path
        d="M43.5 16 V22.4"
        stroke={`url(#${uid}-gold)`}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Tassel knot */}
      <circle cx="43.5" cy="16" r="1.1" fill="#C9A54A" />
      {/* Tassel ball */}
      <circle cx="43.5" cy="24.2" r="2" fill={`url(#${uid}-gold)`} />
      {/* Tiny highlight on the tassel ball */}
      <circle cx="42.8" cy="23.5" r="0.6" fill="#ffffff" opacity="0.55" />
    </svg>
  );
}

export function Logo({
  className,
  showWordmark = true,
  size = 36,
  variant = "default",
}: {
  className?: string;
  showWordmark?: boolean;
  size?: number;
  variant?: LogoVariant;
}) {
  const textColors = {
    default: "text-heading",
    light: "text-white",
    dark: "text-[#1A1415]",
  };

  const reactId = useId();
  const uid = useMemo(() => `logotext-${reactId.replace(/:/g, "")}`, [reactId]);
  const fontSize = Math.round(size * 0.58);

  return (
    <div
      className={cn("inline-flex items-center gap-2.5 select-none", className)}
      aria-label="Klassruum"
    >
      <LogoMark size={size} id={uid} variant={variant} />
      {showWordmark && (
        <span
          className={cn("font-extrabold font-headings leading-none", textColors[variant])}
          style={{
            fontSize: `${fontSize}px`,
            letterSpacing: "-0.01em",
            transform: "translateY(3%)",
          }}
          aria-hidden="true"
        >
          Klass<span style={{ color: variant === "light" ? "#E4C2CA" : "#7D2233" }}>ruum</span>
        </span>
      )}
    </div>
  );
}
