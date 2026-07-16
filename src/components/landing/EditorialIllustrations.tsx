import { cn } from "@/lib/utils";
import type { JSX, ReactNode } from "react";

type IllustrationProps = {
  className?: string;
};

type JourneyKind = "materials" | "support" | "delivery" | "evidence";
type RoleKind = "learner" | "teacher" | "admin" | "parent" | "school" | "university" | "training" | "tutoring" | "ngo" | "academy";

function PeopleBase({
  className,
  children,
  viewBox = "0 0 720 520",
  label,
}: IllustrationProps & {
  children: ReactNode;
  viewBox?: string;
  label: string;
}) {
  return (
    <svg
      className={cn("editorial-illustration", className)}
      viewBox={viewBox}
      role="img"
      aria-label={label}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );
}

function Person({
  x,
  y,
  scale = 1,
  accent = "red",
  pose = "stand",
}: {
  x: number;
  y: number;
  scale?: number;
  accent?: "red" | "brown" | "beige" | "ink";
  pose?: "stand" | "sit" | "point" | "think";
}) {
  const accentClass = `ed-fill-${accent}`;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse className="ed-shadow" cx="56" cy="186" rx="52" ry="10" />
      <path className="ed-fill-white ed-stroke" d="M33 84c0-25 17-44 41-44s41 19 41 44c0 24-17 43-41 43s-41-19-41-43Z" />
      <path className="ed-fill-ink" d="M36 77c7-31 58-37 75-9-13-3-29-2-45 2-12 4-21 7-30 7Z" />
      <path className={`${accentClass} ed-stroke`} d="M24 180c3-39 22-61 50-61 30 0 49 23 52 61v18H24v-18Z" />
      <path className="ed-stroke" d="M56 121l18 22 18-22" />
      <path className="ed-stroke" d="M53 85h7M88 85h7M68 103h16" />
      {pose === "point" && <path className="ed-stroke ed-line-red" d="M122 146c31-22 58-41 86-48" />}
      {pose === "think" && (
        <>
          <circle className="ed-fill-red" cx="122" cy="50" r="7" />
          <circle className="ed-fill-beige" cx="143" cy="35" r="5" />
          <circle className="ed-fill-ink" cx="159" cy="21" r="3.5" />
        </>
      )}
      {pose === "sit" && <path className="ed-stroke" d="M34 194c26 11 58 11 84 0" />}
    </g>
  );
}

function LessonBoard({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path className="ed-fill-white ed-stroke" d="M0 0h276c18 0 32 14 32 32v154c0 18-14 32-32 32H0V0Z" />
      <path className="ed-line-red" d="M26 55h116M26 86h162M26 117h92" />
      <path className="ed-stroke" d="M206 53h58M206 84h42M206 115h68" />
      <path className="ed-fill-beige" d="M28 152h144c7 0 12 5 12 12s-5 12-12 12H28c-7 0-12-5-12-12s5-12 12-12Z" />
      <path className="ed-fill-red" d="M221 151h54v25h-54z" />
    </g>
  );
}

function Desk({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path className="ed-fill-beige ed-stroke" d="M0 0h218l28 70H25L0 0Z" />
      <path className="ed-stroke" d="M40 70v54M208 70v54" />
      <path className="ed-line-red" d="M48 28h58M48 45h92" />
      <path className="ed-stroke" d="M152 24h46M157 42h34" />
    </g>
  );
}

export function TeachingThreadScene({ className }: IllustrationProps) {
  return (
    <PeopleBase className={cn("editorial-illustration--hero", className)} label="Teacher guiding learners through a live lesson">
      <path className="ed-thread ed-thread--draw" d="M112 352C184 214 300 150 459 168c74 8 128 47 165 113" />
      <LessonBoard x={332} y={92} scale={0.95} />
      <Desk x={254} y={318} scale={0.9} />
      <Person x={76} y={170} scale={1.08} accent="red" pose="point" />
      <Person x={286} y={216} scale={0.72} accent="beige" pose="sit" />
      <Person x={438} y={224} scale={0.72} accent="brown" pose="think" />
      <path className="ed-fill-white ed-stroke" d="M536 334h96c14 0 26 12 26 26v54c0 14-12 26-26 26h-96c-14 0-26-12-26-26v-54c0-14 12-26 26-26Z" />
      <path className="ed-line-red" d="M534 366h74M534 392h48" />
      <path className="ed-stroke" d="M342 403c60 28 139 29 201 4" />
    </PeopleBase>
  );
}

export function LearnerSupportScene({ className }: IllustrationProps) {
  return (
    <PeopleBase className={className} label="Learner receives help when a lesson becomes difficult">
      <path className="ed-thread ed-thread--draw" d="M85 324c88-90 177-123 267-98 71 20 120 15 214-58" />
      <Desk x={230} y={327} scale={0.95} />
      <Person x={64} y={194} scale={0.88} accent="red" pose="point" />
      <Person x={318} y={196} scale={0.86} accent="beige" pose="think" />
      <Person x={532} y={178} scale={0.82} accent="brown" />
      <g transform="translate(420 82)">
        <path className="ed-fill-white ed-stroke" d="M0 0h148c14 0 26 12 26 26v86c0 14-12 26-26 26H0V0Z" />
        <path className="ed-line-red" d="M25 42h76M25 68h104" />
        <path className="ed-stroke" d="M25 94h62" />
      </g>
    </PeopleBase>
  );
}

export function GovernanceReviewScene({ className }: IllustrationProps) {
  return (
    <PeopleBase className={className} label="Institution reviews lessons while family and learner stay connected">
      <path className="ed-thread ed-thread--draw" d="M101 342c74-116 187-160 337-131 64 12 116 43 161 93" />
      <g transform="translate(290 78)">
        <path className="ed-fill-white ed-stroke" d="M0 0h238c18 0 32 14 32 32v214c0 18-14 32-32 32H0V0Z" />
        <path className="ed-line-red" d="M36 54h124M36 88h164M36 122h98" />
        <path className="ed-stroke" d="M36 168h198M36 204h138" />
        <path className="ed-fill-red" d="M184 45h42v42h-42z" />
      </g>
      <Person x={84} y={196} scale={0.9} accent="ink" pose="point" />
      <Person x={522} y={184} scale={0.82} accent="brown" />
      <Person x={240} y={238} scale={0.74} accent="red" pose="think" />
      <path className="ed-stroke" d="M86 433h548" />
    </PeopleBase>
  );
}

export function FamilyProgressScene({ className }: IllustrationProps) {
  return (
    <PeopleBase className={className} label="Family follows progress from a learner's classroom record">
      <path className="ed-thread ed-thread--draw" d="M124 315c80-78 170-101 270-69 71 23 129 18 203-19" />
      <Person x={124} y={190} scale={0.88} accent="brown" />
      <Person x={256} y={220} scale={0.72} accent="red" pose="sit" />
      <g transform="translate(420 120)">
        <path className="ed-fill-white ed-stroke" d="M0 0h170c16 0 30 14 30 30v144c0 16-14 30-30 30H0V0Z" />
        <path className="ed-line-red" d="M30 50h104M30 82h70" />
        <path className="ed-stroke" d="M30 125h132" />
        <path className="ed-fill-red" d="M30 145h96v12H30z" />
      </g>
    </PeopleBase>
  );
}

export function JourneyIllustration({ kind, className }: IllustrationProps & { kind: JourneyKind }) {
  const map: Record<JourneyKind, JSX.Element> = {
    materials: (
      <PeopleBase className={className} viewBox="0 0 260 220" label="Teacher preparing materials">
        <path className="ed-thread" d="M32 154c43-49 93-65 150-46" />
        <Person x={28} y={42} scale={0.62} accent="red" pose="point" />
        <path className="ed-fill-white ed-stroke" d="M132 38h90v118h-90z" />
        <path className="ed-line-red" d="M148 72h48M148 96h58" />
        <path className="ed-stroke" d="M148 120h42" />
      </PeopleBase>
    ),
    support: (
      <PeopleBase className={className} viewBox="0 0 260 220" label="Learner working through difficulty">
        <path className="ed-thread" d="M40 145c42-40 87-52 136-35" />
        <Person x={72} y={38} scale={0.7} accent="beige" pose="think" />
        <Desk x={126} y={148} scale={0.42} />
      </PeopleBase>
    ),
    delivery: (
      <PeopleBase className={className} viewBox="0 0 260 220" label="Teacher delivering a lesson">
        <LessonBoard x={96} y={38} scale={0.44} />
        <Person x={36} y={52} scale={0.62} accent="red" pose="point" />
      </PeopleBase>
    ),
    evidence: (
      <PeopleBase className={className} viewBox="0 0 260 220" label="Family and institution read learning evidence">
        <Person x={32} y={52} scale={0.62} accent="brown" />
        <path className="ed-fill-white ed-stroke" d="M128 45h94v122h-94z" />
        <path className="ed-line-red" d="M144 82h48M144 108h62" />
        <path className="ed-fill-red" d="M144 137h54v10h-54z" />
      </PeopleBase>
    ),
  };

  return map[kind];
}

export function RoleFigure({ kind, className }: IllustrationProps & { kind: RoleKind }) {
  const iconMap: Record<RoleKind, JSX.Element> = {
    learner: <Person x={58} y={38} scale={0.72} accent="red" pose="think" />,
    teacher: <Person x={56} y={38} scale={0.72} accent="red" pose="point" />,
    admin: <Person x={56} y={38} scale={0.72} accent="ink" pose="point" />,
    parent: <Person x={48} y={38} scale={0.72} accent="brown" />,
    school: <path className="ed-stroke ed-line-red" d="M44 144V78l56-34 56 34v66M30 144h140M72 144v-36h56v36M88 86h24" />,
    university: <path className="ed-stroke ed-line-red" d="M30 86h144M44 86v58M76 86v58M108 86v58M140 86v58M24 144h156M34 86l62-38 68 38" />,
    training: <path className="ed-stroke ed-line-red" d="M58 82a28 28 0 1 0 1 0M128 116a22 22 0 1 0 1 0M84 106l25 15" />,
    tutoring: <path className="ed-stroke ed-line-red" d="M54 82a25 25 0 1 0 1 0M126 124a25 25 0 1 0 1 0M76 96l28 18M130 58h40v42h-40z" />,
    ngo: <path className="ed-stroke ed-line-red" d="M92 54a42 42 0 1 0 1 0M50 96h84M92 54v84M92 142V92M92 108c20-20 38-18 48-8M92 118c-20-20-38-18-48-8" />,
    academy: <path className="ed-stroke ed-line-red" d="M40 82h116v70H40zM26 152h144M98 36l42 18-42 18-42-18zM78 65v14c14 8 26 8 40 0V65" />,
  };

  return (
    <PeopleBase className={className} viewBox="0 0 210 210" label={`${kind} illustration`}>
      <path className="ed-thread" d="M36 156c42-64 92-84 150-60" />
      {iconMap[kind]}
    </PeopleBase>
  );
}
