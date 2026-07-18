import { useState, useRef, useCallback } from "react";
import {
  Eye,
  Captions,
  AlignLeft,
  ZoomIn,
  Target,
  Type,
  RefreshCw,
  Sun,
  Droplets,
  Wind,
} from "lucide-react";

const MODES = [
  { id: "standard", label: "Standard", icon: RefreshCw },
  { id: "captions", label: "Captions", icon: Captions },
  { id: "lowvision", label: "Low vision", icon: ZoomIn },
  { id: "dyslexia", label: "Dyslexia", icon: Type },
  { id: "focus", label: "Focus mode", icon: AlignLeft },
  { id: "motor", label: "Motor support", icon: Target },
  { id: "textfirst", label: "Text-first", icon: AlignLeft },
] as const;

type ModeId = (typeof MODES)[number]["id"];

/* ── shared lesson content ─────────────────────────────────── */

const LESSON = {
  title: "Photosynthesis",
  subtitle: "How plants convert light into energy",
  steps: [
    { icon: Sun, label: "Sunlight", desc: "Light energy is absorbed by chlorophyll in the leaf." },
    {
      icon: Droplets,
      label: "Water + CO₂",
      desc: "Roots absorb water; stomata take in carbon dioxide.",
    },
    {
      icon: Wind,
      label: "Oxygen + Glucose",
      desc: "The plant releases oxygen and stores energy as glucose.",
    },
  ],
  caption:
    '"The green chlorophyll inside the leaf absorbs light energy to convert carbon dioxide and water into glucose."',
  transcript: [
    {
      time: "00:32",
      speaker: "Clara",
      text: "Let's look at the leaf under magnification. See the tiny pores?",
    },
    {
      time: "00:45",
      speaker: "Clara",
      text: "Those are stomata — they let carbon dioxide enter the leaf.",
    },
    {
      time: "01:02",
      speaker: "Clara",
      text: "Water travels up from the roots through the stem into the leaf.",
    },
    {
      time: "01:18",
      speaker: "Clara",
      text: "Chlorophyll captures sunlight and starts the conversion process.",
    },
  ],
};

/* ── mini diagram (shared, adapts per mode) ────────────────── */

function LessonDiagram({ mode }: { mode: ModeId }) {
  const isHighContrast = mode === "lowvision";
  const strokeColor = isHighContrast ? "#facc15" : "#22c55e";
  const fillColor = isHighContrast ? "#facc15" : "#22c55e";
  const textColor = isHighContrast ? "#fef9c3" : "#1A1415";
  const accentColor = isHighContrast ? "#fde68a" : "#D97706";
  const fontSize = mode === "lowvision" ? 12 : 9;

  return (
    <svg
      width="100%"
      height="140"
      viewBox="0 0 320 140"
      fill="none"
      role="img"
      aria-label="Photosynthesis diagram: sunlight, water, and carbon dioxide are converted into oxygen and glucose"
    >
      {/* leaf shape */}
      <path
        d="M40,110 Q160,50 280,40 C240,80 180,130 40,110 Z"
        fill={fillColor}
        fillOpacity={isHighContrast ? 0.2 : 0.12}
        stroke={strokeColor}
        strokeWidth={isHighContrast ? 2.5 : 1.5}
      />
      {/* veins */}
      <path
        d="M40,110 Q160,50 280,40"
        stroke={strokeColor}
        strokeWidth={isHighContrast ? 2 : 1.5}
        strokeLinecap="round"
      />
      <path d="M100,95 Q130,75 120,65" stroke={strokeColor} strokeWidth="1" opacity="0.6" />
      <path d="M160,80 Q190,60 180,50" stroke={strokeColor} strokeWidth="1" opacity="0.6" />
      <path d="M220,68 Q250,48 240,38" stroke={strokeColor} strokeWidth="1" opacity="0.6" />
      {/* sunlight */}
      <path
        d="M135,8 L150,40"
        stroke={accentColor}
        strokeWidth={isHighContrast ? 2 : 1.5}
        strokeDasharray="4,3"
      />
      <circle cx="130" cy="8" r="6" fill={accentColor} fillOpacity="0.3" />
      <text x="108" y={fontSize + 6} fill={accentColor} fontSize={fontSize} fontWeight="700">
        Sunlight
      </text>
      {/* CO2 */}
      <path d="M25,45 Q75,50 105,75" stroke="#C25565" strokeWidth={isHighContrast ? 2 : 1.5} />
      <text x="8" y="38" fill="#C25565" fontSize={fontSize} fontWeight="700">
        CO₂
      </text>
      {/* O2 */}
      <path
        d="M195,90 Q255,85 295,60"
        stroke={strokeColor}
        strokeWidth={isHighContrast ? 2 : 1.5}
      />
      <text x="230" y="108" fill={strokeColor} fontSize={fontSize} fontWeight="700">
        O₂
      </text>
      {/* chlorophyll dot */}
      <circle cx="165" cy="72" r={isHighContrast ? 4 : 3} fill={fillColor} />
      <text x="145" y="90" fill={textColor} fontSize={fontSize - 1} fontWeight="600">
        Chlorophyll
      </text>
    </svg>
  );
}

/* ── step cards (shared structure) ─────────────────────────── */

function StepCard({
  icon: Icon,
  label,
  desc,
  variant,
}: {
  icon: typeof Sun;
  label: string;
  desc: string;
  variant: "standard" | "highcontrast" | "dyslexia" | "focus" | "motor";
}) {
  const base = "flex items-start gap-3 rounded-xl border p-4 transition-colors";
  const styles: Record<string, string> = {
    standard: "bg-white border-border text-body",
    highcontrast: "bg-gray-900 border-yellow-400 text-yellow-100",
    dyslexia: "bg-white border-2 border-border text-body",
    focus: "bg-white/80 border-blue-200 text-body",
    motor: "bg-white border-2 border-border text-body",
  };
  const iconBg: Record<string, string> = {
    standard: "bg-soft-green text-green-700",
    highcontrast: "bg-yellow-400/20 text-yellow-300",
    dyslexia: "bg-soft-green text-green-700",
    focus: "bg-soft-blue text-blue-700",
    motor: "bg-soft-green text-green-700",
  };

  return (
    <div className={`${base} ${styles[variant]}`}>
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg[variant]}`}
      >
        <Icon size={16} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <div
          className={`text-sm font-semibold mb-0.5 ${variant === "highcontrast" ? "text-yellow-300" : "text-heading"}`}
        >
          {label}
        </div>
        <div
          className={`text-[13px] leading-relaxed ${variant === "dyslexia" ? "a11y-dyslexia-text" : ""}`}
        >
          {desc}
        </div>
      </div>
    </div>
  );
}

/* ── mode panels ───────────────────────────────────────────── */

function StandardPanel() {
  return (
    <div className="flex flex-col gap-5 h-full">
      <div className="bg-soft-green/50 rounded-xl border border-green-100 p-4">
        <div className="text-[10px] font-semibold text-green-600 uppercase tracking-wider mb-2">
          Live Board · Diagram
        </div>
        <LessonDiagram mode="standard" />
      </div>
      <div className="grid gap-2.5">
        {LESSON.steps.map((s) => (
          <StepCard key={s.label} icon={s.icon} label={s.label} desc={s.desc} variant="standard" />
        ))}
      </div>
    </div>
  );
}

function CaptionsPanel() {
  return (
    <div className="flex flex-col gap-5 h-full">
      <div className="bg-soft-green/50 rounded-xl border border-green-100 p-4">
        <div className="text-[10px] font-semibold text-green-600 uppercase tracking-wider mb-2">
          Live Board · Diagram
        </div>
        <LessonDiagram mode="standard" />
      </div>
      <div className="grid gap-2.5">
        {LESSON.steps.map((s) => (
          <StepCard key={s.label} icon={s.icon} label={s.label} desc={s.desc} variant="standard" />
        ))}
      </div>
      {/* live captions bar */}
      <div className="bg-white rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
          <span className="text-[10px] font-semibold text-green-400 uppercase tracking-wider">
            Live Captions
          </span>
        </div>
        <p className="text-[14px] font-medium text-white leading-relaxed">{LESSON.caption}</p>
      </div>
    </div>
  );
}

function LowVisionPanel() {
  return (
    <div className="flex flex-col gap-5 h-full a11y-lowvision">
      <div className="rounded-xl border-2 border-yellow-400 bg-gray-900 p-4">
        <div className="text-[11px] font-bold text-yellow-300 uppercase tracking-widest mb-2">
          Live Board · Diagram
        </div>
        <LessonDiagram mode="lowvision" />
      </div>
      <div className="grid gap-3">
        {LESSON.steps.map((s) => (
          <StepCard
            key={s.label}
            icon={s.icon}
            label={s.label}
            desc={s.desc}
            variant="highcontrast"
          />
        ))}
      </div>
    </div>
  );
}

function DyslexiaPanel() {
  return (
    <div className="flex flex-col gap-5 h-full a11y-dyslexia">
      <div className="bg-soft-green/50 rounded-xl border-2 border-green-200 p-4">
        <div className="text-[10px] font-semibold text-green-600 uppercase tracking-wider mb-2">
          Live Board · Diagram
        </div>
        <LessonDiagram mode="standard" />
      </div>
      <div className="grid gap-3">
        {LESSON.steps.map((s) => (
          <StepCard key={s.label} icon={s.icon} label={s.label} desc={s.desc} variant="dyslexia" />
        ))}
      </div>
    </div>
  );
}

function FocusPanel() {
  return (
    <div className="flex flex-col items-center justify-center h-full a11y-focus">
      <div className="max-w-sm w-full bg-white rounded-2xl border border-blue-200 shadow-sm p-6 text-center">
        <div className="w-10 h-10 rounded-full bg-soft-blue flex items-center justify-center mx-auto mb-3">
          <Target size={18} className="text-blue-600" aria-hidden="true" />
        </div>
        <h4 className="text-base font-bold text-heading mb-1">Main Objective</h4>
        <p className="text-[14px] text-body leading-relaxed font-medium">
          Plants convert radiant solar energy into chemical bonding energy through photosynthesis.
        </p>
      </div>
    </div>
  );
}

function MotorPanel() {
  return (
    <div className="flex flex-col gap-5 h-full">
      <div className="bg-soft-green/50 rounded-xl border border-green-100 p-4">
        <div className="text-[10px] font-semibold text-green-600 uppercase tracking-wider mb-2">
          Live Board · Diagram
        </div>
        <LessonDiagram mode="standard" />
      </div>
      <div className="grid gap-2.5">
        {LESSON.steps.map((s) => (
          <StepCard key={s.label} icon={s.icon} label={s.label} desc={s.desc} variant="motor" />
        ))}
      </div>
      {/* large keyboard-action buttons */}
      <div className="flex gap-3 pt-1">
        <button
          className="flex-1 h-14 bg-crimson text-white rounded-xl text-sm font-semibold
                     focus-visible:ring-2 focus-visible:ring-ink/50 focus-visible:ring-offset-2
                     active:scale-[0.98] transition-transform"
        >
          ← Previous Step
        </button>
        <button
          className="flex-1 h-14 bg-education-green text-white rounded-xl text-sm font-semibold
                     focus-visible:ring-2 focus-visible:ring-education-green/50 focus-visible:ring-offset-2
                     active:scale-[0.98] transition-transform"
        >
          Next Step →
        </button>
      </div>
      <p className="text-[11px] text-muted text-center">
        Navigate with{" "}
        <kbd className="px-1.5 py-0.5 bg-page-background-alt rounded text-[10px] font-mono border border-border">
          Tab
        </kbd>{" "}
        and{" "}
        <kbd className="px-1.5 py-0.5 bg-page-background-alt rounded text-[10px] font-mono border border-border">
          Space
        </kbd>
      </p>
    </div>
  );
}

function TextFirstPanel() {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-learning-blue animate-pulse" aria-hidden="true" />
        <span className="text-[10px] font-semibold text-learning-blue uppercase tracking-wider">
          Full Transcript · Auto-generated
        </span>
      </div>
      <div className="flex-1 space-y-3 max-h-[260px] overflow-y-auto pr-1">
        {LESSON.transcript.map((entry) => (
          <div
            key={entry.time}
            className="flex gap-3 p-3 rounded-lg bg-page-background-alt border border-border"
          >
            <span className="text-[12px] font-mono font-semibold text-learning-blue shrink-0 pt-0.5">
              {entry.time}
            </span>
            <div className="min-w-0">
              <span className="text-[12px] font-semibold text-heading">{entry.speaker}: </span>
              <span className="text-[13px] text-body leading-relaxed">{entry.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── main component ────────────────────────────────────────── */

const PANELS: Record<ModeId, React.FC> = {
  standard: StandardPanel,
  captions: CaptionsPanel,
  lowvision: LowVisionPanel,
  dyslexia: DyslexiaPanel,
  focus: FocusPanel,
  motor: MotorPanel,
  textfirst: TextFirstPanel,
};

export function AccessibilityExperience() {
  const [activeMode, setActiveMode] = useState<ModeId>("standard");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = MODES.findIndex((m) => m.id === activeMode);
      let nextIndex = currentIndex;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % MODES.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + MODES.length) % MODES.length;
      } else if (e.key === "Home") {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        nextIndex = MODES.length - 1;
      } else {
        return;
      }

      const nextMode = MODES[nextIndex];
      setActiveMode(nextMode.id);
      tabRefs.current[nextIndex]?.focus();
    },
    [activeMode],
  );

  const Panel = PANELS[activeMode];
  const panelBg =
    activeMode === "lowvision"
      ? "bg-gray-950 border-yellow-400"
      : "bg-page-background border-border";

  return (
    <section className="cine-section" id="accessibility" style={{ background: "var(--white, #FFFFFF)" }}>
      <div className="mx-auto max-w-[1240px] px-6">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-10">
          <span className="cine-section-eyebrow justify-center">
            <Eye size={12} />
            Adaptive Delivery
          </span>
          <h2 className="cine-section-title mt-2">
            The same lesson. A classroom shaped for each learner.
          </h2>
          <p className="cine-section-sub mt-5 mx-auto">
            Klassruum adapts the virtual environment dynamically — layout, typography, colors, and controls all respond to the learner's needs. Click any mode below to see the interface adapt instantly. Interface and teaching languages can be set independently, and every mode meets WCAG 2.2 accessibility standards.
          </p>
        </div>

        {/* SEO content row */}
        <div className="mx-auto mb-12 grid max-w-4xl gap-4 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-crimson-soft">
              <Captions size={18} className="text-crimson-dark" />
            </div>
            <p className="text-[15px] font-semibold text-ink">Live captions</p>
            <p className="text-[14px] text-muted">Every spoken word is captioned in real time and saved to the transcript.</p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-crimson-soft">
              <Type size={18} className="text-crimson-dark" />
            </div>
            <p className="text-[15px] font-semibold text-ink">Dyslexia-friendly</p>
            <p className="text-[14px] text-muted">Adjustable spacing, readable fonts, and slower board pacing for reading ease.</p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-crimson-soft">
              <Target size={18} className="text-crimson-dark" />
            </div>
            <p className="text-[15px] font-semibold text-ink">Focus & motor support</p>
            <p className="text-[14px] text-muted">Distraction-free layouts and large keyboard-action buttons for every learner.</p>
          </div>
        </div>

        {/* Tab list */}
        <div
          className="flex flex-wrap justify-center gap-2 mb-10"
          role="tablist"
          aria-label="Accessibility modes"
        >
          {MODES.map((mode, index) => {
            const isSelected = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                role="tab"
                id={`tab-${mode.id}`}
                aria-selected={isSelected}
                aria-controls={`panel-${mode.id}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setActiveMode(mode.id)}
                onKeyDown={handleTabKeyDown}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium transition-all border focus-visible:ring-2 focus-visible:ring-learning-blue focus-visible:ring-offset-2 ${isSelected
                  ? "bg-crimson text-white border-border shadow-sm"
                  : "bg-white text-body border-border hover:border-border-strong hover:text-heading"
                  }`}
              >
                <mode.icon size={13} aria-hidden="true" />
                {mode.label}
              </button>
            );
          })}
        </div>

        {/* Panel */}
        <div className="max-w-3xl mx-auto">
          <div
            role="tabpanel"
            id={`panel-${activeMode}`}
            aria-labelledby={`tab-${activeMode}`}
            className={`mockup-window w-full overflow-hidden flex flex-col min-h-[420px] transition-all duration-300 ${panelBg}`}
          >
            {/* Chrome bar */}
            <div
              className={`h-9 border-b flex items-center px-4 justify-between shrink-0 ${activeMode === "lowvision"
                ? "bg-gray-900 border-yellow-400/30"
                : "bg-page-background-alt border-border"
                }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red" aria-hidden="true" />
                <span
                  className="w-2.5 h-2.5 rounded-full bg-achievement-orange"
                  aria-hidden="true"
                />
                <span
                  className={`w-2.5 h-2.5 rounded-full ${activeMode === "lowvision" ? "bg-yellow-400" : "bg-education-green"
                    }`}
                  aria-hidden="true"
                />
                <span
                  className={`text-[10px] ml-2 font-medium ${activeMode === "lowvision" ? "text-yellow-300" : "text-muted"
                    }`}
                >
                  Session preview · Photosynthesis
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 flex flex-col text-left overflow-y-auto">
              <Panel />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
