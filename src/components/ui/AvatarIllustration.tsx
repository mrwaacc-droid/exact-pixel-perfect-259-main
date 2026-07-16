import { useId } from "react";
import { cn } from "@/lib/utils";

type IllustrationType =
  | "learner"
  | "teacher"
  | "admin"
  | "parent"
  | "school"
  | "university"
  | "training"
  | "tutoring"
  | "ngo"
  | "academy"
  | "hero";

interface AvatarIllustrationProps {
  type: IllustrationType;
  className?: string;
  size?: number;
}

export function AvatarIllustration({ type, className, size = 120 }: AvatarIllustrationProps) {
  const reactId = useId();
  const id = `illust-${type}-${reactId.replace(/:/g, "")}`;

  // Learner Illustration
  if (type === "learner") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("select-none overflow-visible", className)}
      >
        <defs>
          <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9A3247" />
            <stop offset="100%" stopColor="#7D2233" />
          </linearGradient>
          <linearGradient id={`${id}-skin`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FCF4F5" />
            <stop offset="100%" stopColor="#F7E7EA" />
          </linearGradient>
          <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#7D2233" floodOpacity="0.12" />
          </filter>
        </defs>
        {/* Decorative background glow */}
        <circle cx="60" cy="60" r="48" fill="url(#$id-grad)" opacity="0.06" />
        <circle cx="60" cy="52" r="28" fill={`url(#${id}-skin)`} stroke="#E7DAD1" strokeWidth="1.5" />
        {/* Graduation cap */}
        <path d={`M60 22 L86 34 L60 46 L34 34 Z`} fill={`url(#${id}-grad)`} filter={`url(#${id}-shadow)`} />
        <path d={`M48 39.5 V48 C48 54 72 54 72 48 V39.5`} stroke={`url(#${id}-grad)`} strokeWidth="3" strokeLinecap="round" />
        <path d="M80 34 V52" stroke="#D9C6B2" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="80" cy="53" r="2" fill="#D9C6B2" />
        {/* Shoulders / Torso */}
        <path
          d="M26 96 C26 78 40 70 60 70 C80 70 94 78 94 96 V104 H26 Z"
          fill={`url(#${id}-grad)`}
          opacity="0.9"
        />
        {/* Details */}
        <circle cx="60" cy="78" r="4" fill="#F7E7EA" />
        <circle cx="60" cy="88" r="4" fill="#F7E7EA" />
      </svg>
    );
  }

  // Teacher Illustration
  if (type === "teacher") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("select-none overflow-visible", className)}
      >
        <defs>
          <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4BA67C" />
            <stop offset="100%" stopColor="#2F7D5A" />
          </linearGradient>
          <linearGradient id={`${id}-hair`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3D3233" />
            <stop offset="100%" stopColor="#2C2224" />
          </linearGradient>
          <linearGradient id={`${id}-skin`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FAF7F3" />
            <stop offset="100%" stopColor="#F4ECE4" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="48" fill={`url(#${id}-grad)`} opacity="0.06" />
        {/* Hair back */}
        <path d="M38 52 C38 32 82 32 82 52" fill={`url(#${id}-hair)`} />
        {/* Head */}
        <circle cx="60" cy="54" r="24" fill={`url(#${id}-skin)`} stroke="#E7DAD1" strokeWidth="1.5" />
        {/* Hair front/bangs */}
        <path d="M42 40 C50 30 70 30 78 40 C72 38 64 38 58 42 Z" fill={`url(#${id}-hair)`} />
        {/* Glasses */}
        <rect x="46" y="48" width="10" height="7" rx="2" stroke={`url(#${id}-grad)`} strokeWidth="1.5" />
        <rect x="64" y="48" width="10" height="7" rx="2" stroke={`url(#${id}-grad)`} strokeWidth="1.5" />
        <path d="M56 51 H64" stroke={`url(#${id}-grad)`} strokeWidth="1.5" />
        {/* Shoulders */}
        <path
          d="M28 98 C28 82 42 74 60 74 C78 74 92 82 92 98 V104 H28 Z"
          fill={`url(#${id}-grad)`}
        />
        {/* Collar */}
        <path d="M50 74 L60 84 L70 74" fill="none" stroke={`url(#${id}-skin)`} strokeWidth="2" />
      </svg>
    );
  }

  // Admin / Institution Illustration
  if (type === "admin") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("select-none overflow-visible", className)}
      >
        <defs>
          <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#536FA8" />
            <stop offset="100%" stopColor="#3D517A" />
          </linearGradient>
          <linearGradient id={`${id}-shield`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FAF7F3" />
            <stop offset="100%" stopColor="#E8EDF5" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="48" fill={`url(#${id}-grad)`} opacity="0.06" />
        {/* Head */}
        <circle cx="60" cy="50" r="22" fill={`url(#${id}-shield)`} stroke="#E7DAD1" strokeWidth="1.5" />
        {/* Shield outline overlay */}
        <path d="M60 38 L72 43 V53 C72 59 60 65 60 65 C60 65 48 59 48 53 V43 Z" fill="none" stroke={`url(#${id}-grad)`} strokeWidth="1.5" />
        {/* Shoulders */}
        <path
          d="M32 94 C32 80 44 72 60 72 C76 72 88 80 88 94 V102 H32 Z"
          fill={`url(#${id}-grad)`}
        />
        {/* Admin Tie / Badge detail */}
        <path d="M57 72 H63 V84 L60 88 L57 84 Z" fill={`url(#${id}-shield)`} />
      </svg>
    );
  }

  // Parent / Family Illustration
  if (type === "parent") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("select-none overflow-visible", className)}
      >
        <defs>
          <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D88B3A" />
            <stop offset="100%" stopColor="#A0522D" />
          </linearGradient>
          <linearGradient id={`${id}-child`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FCF4F5" />
            <stop offset="100%" stopColor="#F7E7EA" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="48" fill={`url(#${id}-grad)`} opacity="0.06" />
        {/* Parent Head */}
        <circle cx="50" cy="46" r="20" fill={`url(#${id}-child)`} stroke="#E7DAD1" strokeWidth="1.5" />
        <path d="M30 38 C35 30 65 30 70 38" stroke={`url(#${id}-grad)`} strokeWidth="2" strokeLinecap="round" />
        {/* Parent Shoulders */}
        <path d="M22 92 C22 78 32 70 50 70 C68 70 78 78 78 92 V98 H22 Z" fill={`url(#${id}-grad)`} />

        {/* Child Head */}
        <circle cx="76" cy="62" r="14" fill={`url(#${id}-child)`} stroke="#E7DAD1" strokeWidth="1.5" />
        {/* Child Shoulders */}
        <path d="M58 94 C58 84 66 78 76 78 C86 78 94 84 94 94 V98 H58 Z" fill={`url(#${id}-grad)`} opacity="0.8" />
      </svg>
    );
  }

  // School Illustration
  if (type === "school") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("select-none overflow-visible", className)}
      >
        <defs>
          <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4BA67C" />
            <stop offset="100%" stopColor="#2F7D5A" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="50" fill={`url(#${id}-grad)`} opacity="0.04" />
        {/* Building structure */}
        <path d="M30 92 V56 L60 36 L90 56 V92 Z" fill="none" stroke={`url(#${id}-grad)`} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M24 92 H96" stroke={`url(#${id}-grad)`} strokeWidth="3" strokeLinecap="round" />
        <path d="M50 92 V74 H70 V92" fill="none" stroke={`url(#${id}-grad)`} strokeWidth="2.5" />
        <circle cx="60" cy="54" r="5" fill={`url(#${id}-grad)`} />
        {/* Clock structure */}
        <circle cx="60" cy="54" r="9" fill="none" stroke={`url(#${id}-grad)`} strokeWidth="1.5" />
        <line x1="60" y1="54" x2="60" y2="50" stroke={`url(#${id}-grad)`} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="60" y1="54" x2="64" y2="54" stroke={`url(#${id}-grad)`} strokeWidth="1.5" strokeLinecap="round" />
        {/* Windows */}
        <rect x="38" y="66" width="8" height="12" rx="1" stroke={`url(#${id}-grad)`} strokeWidth="1.5" />
        <rect x="74" y="66" width="8" height="12" rx="1" stroke={`url(#${id}-grad)`} strokeWidth="1.5" />
      </svg>
    );
  }

  // University Illustration
  if (type === "university") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("select-none overflow-visible", className)}
      >
        <defs>
          <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9A3247" />
            <stop offset="100%" stopColor="#7D2233" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="50" fill={`url(#${id}-grad)`} opacity="0.04" />
        {/* Dome & Pillars */}
        <path d="M30 46 C30 32 90 32 90 46 Z" fill={`url(#${id}-grad)`} opacity="0.12" />
        <path d="M26 46 H94" stroke={`url(#${id}-grad)`} strokeWidth="3" strokeLinecap="round" />
        <path d="M26 86 H94" stroke={`url(#${id}-grad)`} strokeWidth="3" strokeLinecap="round" />
        {/* Pillars */}
        <line x1="36" y1="46" x2="36" y2="86" stroke={`url(#${id}-grad)`} strokeWidth="2.5" />
        <line x1="52" y1="46" x2="52" y2="86" stroke={`url(#${id}-grad)`} strokeWidth="2.5" />
        <line x1="68" y1="46" x2="68" y2="86" stroke={`url(#${id}-grad)`} strokeWidth="2.5" />
        <line x1="84" y1="46" x2="84" y2="86" stroke={`url(#${id}-grad)`} strokeWidth="2.5" />
        {/* Roof triangle */}
        <path d="M24 46 L60 26 L96 46 Z" fill="none" stroke={`url(#${id}-grad)`} strokeWidth="2.5" strokeLinejoin="round" />
        {/* Steps */}
        <path d="M20 92 H100" stroke={`url(#${id}-grad)`} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  // Training Illustration
  if (type === "training") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("select-none overflow-visible", className)}
      >
        <defs>
          <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D88B3A" />
            <stop offset="100%" stopColor="#C97922" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="50" fill={`url(#${id}-grad)`} opacity="0.04" />
        {/* Cog wheels representing practice/training */}
        <circle cx="50" cy="54" r="16" stroke={`url(#${id}-grad)`} strokeWidth="2.5" strokeDasharray="6 4" />
        <circle cx="50" cy="54" r="7" stroke={`url(#${id}-grad)`} strokeWidth="2" />
        <circle cx="74" cy="70" r="12" stroke={`url(#${id}-grad)`} strokeWidth="2.5" strokeDasharray="5 3" opacity="0.75" />
        <circle cx="74" cy="70" r="5" stroke={`url(#${id}-grad)`} strokeWidth="2" opacity="0.75" />
        {/* Document with checkmark */}
        <path d="M78 30 H94 V50" stroke={`url(#${id}-grad)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M94 44 V52 H78 V30 H86" stroke={`url(#${id}-grad)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M82 40 L85 43 L91 37" stroke={`url(#${id}-grad)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // Tutoring Illustration
  if (type === "tutoring") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("select-none overflow-visible", className)}
      >
        <defs>
          <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#536FA8" />
            <stop offset="100%" stopColor="#2F7D5A" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="50" fill={`url(#${id}-grad)`} opacity="0.04" />
        {/* Connected nodes (knowledge transfer) */}
        <circle cx="42" cy="46" r="12" fill="none" stroke={`url(#${id}-grad)`} strokeWidth="2.5" />
        <circle cx="78" cy="74" r="12" fill="none" stroke={`url(#${id}-grad)`} strokeWidth="2.5" />
        <path d="M52 54 L68 66" stroke={`url(#${id}-grad)`} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M64 54 L68 66 L56 62" stroke={`url(#${id}-grad)`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Chat bubles overlapping */}
        <circle cx="76" cy="42" r="7" fill="none" stroke={`url(#${id}-grad)`} strokeWidth="1.5" opacity="0.6" />
        <circle cx="44" cy="76" r="7" fill="none" stroke={`url(#${id}-grad)`} strokeWidth="1.5" opacity="0.6" />
      </svg>
    );
  }

  // NGOs Illustration
  if (type === "ngo") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("select-none overflow-visible", className)}
      >
        <defs>
          <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D88B3A" />
            <stop offset="100%" stopColor="#2F7D5A" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="50" fill={`url(#${id}-grad)`} opacity="0.04" />
        {/* Globe & Leaf / Hands representing help */}
        <circle cx="60" cy="54" r="22" fill="none" stroke={`url(#${id}-grad)`} strokeWidth="2.5" />
        <path d="M38 54 H82" stroke={`url(#${id}-grad)`} strokeWidth="1.5" opacity="0.5" />
        <path d="M60 32 V76" stroke={`url(#${id}-grad)`} strokeWidth="1.5" opacity="0.5" />
        {/* Sprout */}
        <path d="M60 84 V56" stroke={`url(#${id}-grad)`} strokeWidth="3" strokeLinecap="round" />
        <path d="M60 62 Q66 52 74 54 Q68 64 60 62" fill={`url(#${id}-grad)`} />
        <path d="M60 68 Q54 58 46 60 Q52 70 60 68" fill={`url(#${id}-grad)`} />
      </svg>
    );
  }

  // Academy Illustration
  if (type === "academy") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("select-none overflow-visible", className)}
      >
        <defs>
          <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7D2233" />
            <stop offset="100%" stopColor="#536FA8" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="50" fill={`url(#${id}-grad)`} opacity="0.04" />
        {/* Laptop & graduation cap */}
        <rect x="28" y="52" width="64" height="40" rx="3" fill="none" stroke={`url(#${id}-grad)`} strokeWidth="2.5" />
        <line x1="20" y1="92" x2="100" y2="92" stroke={`url(#${id}-grad)`} strokeWidth="4" strokeLinecap="round" />
        {/* Cap sitting on screen */}
        <path d="M60 32 L78 40 L60 48 L42 40 Z" fill="none" stroke={`url(#${id}-grad)`} strokeWidth="2" strokeLinejoin="round" />
        <path d="M51 44 V49 C51 52 69 52 69 49 V44" fill="none" stroke={`url(#${id}-grad)`} strokeWidth="2" />
        {/* Wave details on laptop */}
        <path d="M46 72 Q60 64 74 72" stroke={`url(#${id}-grad)`} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      </svg>
    );
  }

  // Hero Illustration Scene
  if (type === "hero") {
    return (
      <svg
        viewBox="0 0 540 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("w-full h-full select-none overflow-visible", className)}
      >
        <defs>
          <linearGradient id={`${id}-g1`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7D2233" />
            <stop offset="100%" stopColor="#FCF4F5" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${id}-g2`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F7E7EA" />
            <stop offset="100%" stopColor="#FAF7F3" />
          </linearGradient>
          <linearGradient id={`${id}-grad-c1`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9A3247" />
            <stop offset="100%" stopColor="#7D2233" />
          </linearGradient>
          <linearGradient id={`${id}-grad-c2`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4BA67C" />
            <stop offset="100%" stopColor="#2F7D5A" />
          </linearGradient>
          <linearGradient id={`${id}-grad-c3`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D9C6B2" />
            <stop offset="100%" stopColor="#A0522D" />
          </linearGradient>
        </defs>

        {/* Abstract background waves / grid */}
        <path d="M40 280 Q180 340 380 260 T520 320" stroke="#FAF7F3" strokeWidth="40" strokeLinecap="round" opacity="0.5" />
        <path d="M20 180 Q160 220 320 120 T500 220" stroke="#F4ECE4" strokeWidth="24" strokeLinecap="round" opacity="0.3" />

        {/* Floating chemistry / learning icons */}
        {/* Atom */}
        <g transform="translate(420, 80) scale(0.85)">
          <circle cx="40" cy="40" r="28" stroke="#E7DAD1" strokeWidth="1.5" strokeDasharray="4 2" />
          <ellipse cx="40" cy="40" rx="36" ry="12" stroke="#7D2233" strokeWidth="1" transform="rotate(30 40 40)" opacity="0.6" />
          <ellipse cx="40" cy="40" rx="36" ry="12" stroke="#7D2233" strokeWidth="1" transform="rotate(-30 40 40)" opacity="0.6" />
          <circle cx="40" cy="40" r="10" fill={`url(#${id}-grad-c1)`} />
          <circle cx="68" cy="22" r="4" fill="#D88B3A" />
        </g>

        {/* Floating Book / Document */}
        <g transform="translate(80, 60) scale(0.9)">
          <path d="M10 20 H40 V60 H10 Z" fill="none" stroke="#2F7D5A" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M18 20 V60" stroke="#2F7D5A" strokeWidth="2.5" />
          <line x1="24" y1="30" x2="34" y2="30" stroke="#2F7D5A" strokeWidth="2" strokeLinecap="round" />
          <line x1="24" y1="40" x2="34" y2="40" stroke="#2F7D5A" strokeWidth="2" strokeLinecap="round" />
          <line x1="24" y1="50" x2="34" y2="50" stroke="#2F7D5A" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Learner 1 (Front Left) */}
        <g transform="translate(110, 160)">
          {/* Shadow */}
          <ellipse cx="50" cy="210" rx="46" ry="10" fill="#221B1C" opacity="0.05" />
          {/* Torso */}
          <path d="M14 200 C14 170 30 156 50 156 C70 156 86 170 86 200 V210 H14 Z" fill={`url(#${id}-grad-c3)`} />
          {/* Head */}
          <circle cx="50" cy="124" r="28" fill={`url(#${id}-g2)`} stroke="#E7DAD1" strokeWidth="1.5" />
          {/* Hair silhouette */}
          <path d="M26 124 C26 94 74 94 74 124 C66 116 58 116 50 120 Z" fill="#2C2224" />
          {/* Glasses */}
          <circle cx="42" cy="126" r="6" stroke="#7D2233" strokeWidth="1.5" />
          <circle cx="58" cy="126" r="6" stroke="#7D2233" strokeWidth="1.5" />
          <line x1="48" y1="126" x2="52" y2="126" stroke="#7D2233" strokeWidth="1.5" />
        </g>

        {/* Learner 2 (Center back, slightly raised, focusing on board) */}
        <g transform="translate(230, 100)">
          {/* Shadow */}
          <ellipse cx="50" cy="220" rx="42" ry="8" fill="#221B1C" opacity="0.04" />
          {/* Torso */}
          <path d="M18 210 C18 184 32 170 50 170 C68 170 82 184 82 210 V220 H18 Z" fill={`url(#${id}-grad-c1)`} />
          {/* Head */}
          <circle cx="50" cy="138" r="26" fill={`url(#${id}-g2)`} stroke="#E7DAD1" strokeWidth="1.5" />
          {/* Graduation cap floating */}
          <path d="M50 102 L74 112 L50 122 L26 112 Z" fill={`url(#${id}-grad-c1)`} />
          <path d="M38 117 V123 C38 128 62 128 62 123 V117" stroke={`url(#${id}-grad-c1)`} strokeWidth="2.5" />
        </g>

        {/* Learner 3 (Front Right) */}
        <g transform="translate(330, 150)">
          {/* Shadow */}
          <ellipse cx="50" cy="220" rx="50" ry="10" fill="#221B1C" opacity="0.05" />
          {/* Torso */}
          <path d="M12 210 C12 180 28 164 50 164 C72 164 88 180 88 210 V220 H12 Z" fill={`url(#${id}-grad-c2)`} opacity="0.95" />
          {/* Head */}
          <circle cx="50" cy="128" r="30" fill={`url(#${id}-g2)`} stroke="#E7DAD1" strokeWidth="1.5" />
          {/* Hair silhouette */}
          <path d="M22 130 C20 106 80 106 78 130" stroke="#A0522D" strokeWidth="5" strokeLinecap="round" />
        </g>

        {/* Speech wave lines coming from their attention */}
        <path d="M210 160 Q230 140 250 160" stroke="#7D2233" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
        <path d="M204 152 Q230 128 256 152" stroke="#7D2233" strokeWidth="2" strokeLinecap="round" opacity="0.2" />

        <path d="M310 180 Q326 168 342 180" stroke="#2F7D5A" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      </svg>
    );
  }

  return null;
}
