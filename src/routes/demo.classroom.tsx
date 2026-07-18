import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { AIVideoClassroom } from "@/components/classroom/AIVideoClassroom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  DEMO_LESSON_LIST,
  getDemoLessonContent,
  type DemoLessonMeta,
} from "@/lib/demo-lessons/demo-lesson-registry";
import {
  Accessibility,
  ArrowRight,
  Brain,
  BookOpen,
  Calculator,
  CheckCircle2,
  CirclePlay as PlayCircle,
  Clock,
  FlaskConical,
  GraduationCap,
  LucideIcon,
  PanelTop,
  ShieldCheck,
  Sparkles,
  Video,
  Volume2,
} from "lucide-react";

const SITE_URL = "https://klassruum.com";

export const Route = createFileRoute("/demo/classroom")({
  head: () => ({
    meta: [
      { title: "Try the AI Classroom Demo - Voice, Whiteboard & Accessibility | Klassruum" },
      {
        name: "description",
        content:
          "Try Klassruum's AI classroom demo with live teacher voice, interactive whiteboard, captions, lesson transcript, notes, accessibility modes, learner questions, and progress evidence - no account needed.",
      },
      {
        name: "keywords",
        content:
          "AI classroom demo, virtual classroom demo, AI teacher demo, interactive whiteboard demo, accessible online learning, live captions, classroom transcript, lesson notes, education technology demo",
      },
      { name: "author", content: "Klassruum" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Try the Klassruum AI Classroom Demo" },
      {
        property: "og:description",
        content:
          "Pick a demo lesson and experience a real AI teacher-led classroom with voice, whiteboard, captions, notes, transcript, accessibility modes, and learner support.",
      },
      { property: "og:url", content: `${SITE_URL}/demo/classroom` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Klassruum AI Classroom Demo" },
      {
        name: "twitter:description",
        content:
          "Experience AI teacher-led lessons with whiteboard, voice, captions, transcript, notes, and accessibility - no account needed.",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/demo/classroom` }],
  }),
  component: DemoClassroomPage,
});

function DemoClassroomPage() {
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  if (selectedLesson) {
    const content = getDemoLessonContent(selectedLesson);
    if (!content) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#FBF8F5]">
          <div className="text-center">
            <p className="text-[#6B5E57]">Lesson not found.</p>
            <button
              type="button"
              onClick={() => setSelectedLesson(null)}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-[var(--ink)] px-4 text-sm font-semibold text-white"
            >
              Back to lessons
            </button>
          </div>
        </div>
      );
    }
    return (
      <ErrorBoundary label="This demo lesson hit a problem">
        <AIVideoClassroom content={content} onExit={() => setSelectedLesson(null)} autoPlay={true} />
      </ErrorBoundary>
    );
  }

  return (
    <div className="demo-classroom-shell min-h-screen bg-[#FBF8F5] text-[var(--ink)]">
      <header className="sticky top-0 z-40 border-b border-[#E5E0DB] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <Logo size={34} />
          </Link>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              to="/auth"
              className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-[#E5E0DB] bg-white px-3 text-xs font-semibold text-[#1A1415] transition-colors hover:border-[#D5CFC9] hover:bg-[#FBF8F5] sm:px-4 sm:text-sm"
            >
              Sign in
            </Link>
            <Link
              to="/auth"
              className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-[#221B1C] bg-[#221B1C] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#1A1415] sm:px-4 sm:text-sm"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:py-10">
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch">
          <div className="border border-[#E5E0DB] bg-white p-6 shadow-[0_10px_28px_rgba(34,27,28,0.06)] sm:p-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-[#E5E0DB] bg-[#FBF8F5] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#1A1415]">
              <Sparkles className="h-3.5 w-3.5" />
              No account needed
            </div>

            <h1 className="max-w-2xl font-headings text-3xl font-extrabold leading-tight tracking-tight text-[#221B1C] sm:text-4xl">
              Choose a lesson, then enter the classroom.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#57494A]">
              Try a full teaching session with voice, board work, captions, notes, and learner
              support running together. The demo starts immediately in your browser.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Metric label="Lesson flow" value="Guided" />
              <Metric label="Access tools" value="Ready" />
              <Metric label="Setup time" value="0 min" />
            </div>
          </div>

          <div className="border border-[#E5E0DB] bg-[#221B1C] p-6 text-white shadow-[0_10px_28px_rgba(34,27,28,0.14)]">
            <div className="flex items-center justify-between gap-4 border-b border-white/12 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/50">
                  Session brief
                </p>
                <p className="mt-1 text-lg font-bold text-white">What opens next</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center border border-white/12 bg-white/8">
                <PanelTop className="h-5 w-5 text-[var(--crimson-soft)]" />
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {[
                ["Teacher voice", "The lesson is spoken, paced, and captioned."],
                ["Board sequence", "Ideas are built step by step on the whiteboard."],
                ["Learner support", "Questions, notes, transcript, and access tools stay close."],
              ].map(([title, desc]) => (
                <div key={title} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--crimson-soft)]" />
                  <div>
                    <p className="text-sm font-bold text-white">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-white/60">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8" aria-label="Demo lessons">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6B5E57]">
                Demo lessons
              </p>
              <h2 className="mt-1 font-headings text-xl font-extrabold text-[#221B1C]">
                Pick one teaching path
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#6B5E57]">
              Each lesson opens the same classroom environment, tuned to the subject and teacher.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {DEMO_LESSON_LIST.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onSelect={() => setSelectedLesson(lesson.id)}
              />
            ))}
          </div>
        </section>

        <section
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Classroom features"
        >
          <FeatureCard
            icon={Video}
            title="AI Teacher"
            desc="Voice-first teaching with a real teacher persona"
          />
          <FeatureCard
            icon={Brain}
            title="Smart Whiteboard"
            desc="Step-by-step explanations written in real time"
          />
          <FeatureCard
            icon={Accessibility}
            title="Accessibility"
            desc="Captions, focus mode, pace control, screen reader"
          />
          <FeatureCard
            icon={Volume2}
            title="Voice Interaction"
            desc="Speak or type your questions during the lesson"
          />
        </section>

        <section className="mt-8 border border-[#E5E0DB] bg-white p-5 text-left shadow-[0_10px_28px_rgba(34,27,28,0.06)] sm:p-6">
          <div className="flex flex-col justify-between gap-3 border-b border-[#EDEBE8] pb-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6B5E57]">
                What to expect
              </p>
              <h2 className="mt-1 font-headings text-xl font-extrabold text-[#221B1C]">
                A classroom rhythm, not a video playlist
              </h2>
            </div>
            <ShieldCheck className="hidden h-6 w-6 text-[#1A1415] sm:block" />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              [
                "Meet your AI teacher",
                "Each subject has a dedicated teacher who guides you through the lesson.",
              ],
              [
                "Watch the whiteboard",
                "Concepts, equations, and examples appear step by step as the teacher explains.",
              ],
              [
                "Ask questions anytime",
                "Type or speak your question. The teacher responds using the lesson context.",
              ],
              [
                "Learn at your pace",
                "The lesson flows automatically. Captions and notes are always available.",
              ],
            ].map(([title, desc], i) => (
              <div key={title} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#E5E0DB] bg-[#FBF8F5] text-sm font-bold text-[#1A1415]">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-[#221B1C]">{title}</h3>
                  <p className="text-sm text-[#6B5E57]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-8 text-center text-sm text-[#9A8D88]">
          This demo runs entirely in your browser. No account or installation required.
        </p>
      </main>
    </div>
  );
}

function LessonCard({ lesson, onSelect }: { lesson: DemoLessonMeta; onSelect: () => void }) {
  const visual = getLessonVisual(lesson);
  const LessonIcon = visual.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex h-full flex-col overflow-hidden border border-[#E5E0DB] bg-white text-left shadow-[0_10px_28px_rgba(34,27,28,0.06)] transition-all hover:-translate-y-0.5 hover:border-[#D5CFC9] hover:shadow-[0_18px_42px_rgba(34,27,28,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1415] focus-visible:ring-offset-2"
    >
      <div className={`h-1.5 ${visual.bar}`} />
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-5 flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center ${visual.iconBg} text-white shadow-sm`}>
            <LessonIcon className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#6B5E57]">
              {lesson.subject}
            </p>
            <h3 className="mt-1 text-lg font-extrabold leading-tight text-[#221B1C] transition-colors group-hover:text-[#1A1415]">
              {lesson.title}
            </h3>
          </div>
        </div>

        <p className="text-sm font-semibold text-[#57494A]">{lesson.course}</p>
        <p className="mt-3 flex-1 text-sm leading-6 text-[#57494A]">{lesson.description}</p>

        <div className="mt-5 border-t border-[#EDEBE8] pt-4">
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[#6B5E57]">
            <span className="flex items-center gap-1">
              <GraduationCap className="h-3.5 w-3.5" />
              {lesson.teacher}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {lesson.duration}
            </span>
          </div>
          <span className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[#221B1C] bg-[#221B1C] text-sm font-bold text-white transition-colors group-hover:bg-[#1A1415]">
            <PlayCircle className="h-4 w-4" />
            Start lesson
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#EDEBE8] bg-[#FBF8F5] p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B5E57]">{label}</p>
      <p className="mt-2 text-lg font-bold tracking-tight text-[#221B1C]">{value}</p>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-lg border border-[#E5E0DB] bg-white p-4 shadow-[0_10px_28px_rgba(34,27,28,0.05)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#E5E0DB] bg-[#FBF8F5] text-[#1A1415]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-3 font-semibold text-[#221B1C]">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-[#6B5E57]">{desc}</p>
    </div>
  );
}

function getLessonVisual(lesson: DemoLessonMeta): {
  icon: LucideIcon;
  iconBg: string;
  bar: string;
} {
  if (lesson.subject === "Mathematics") {
    return {
      icon: Calculator,
      iconBg: "bg-[var(--crimson)]",
      bar: "bg-[var(--crimson)]",
    };
  }

  if (lesson.subject === "Chemistry") {
    return {
      icon: FlaskConical,
      iconBg: "bg-[#7C3AED]",
      bar: "bg-[#7C3AED]",
    };
  }

  return {
    icon: BookOpen,
    iconBg: "bg-[#059669]",
    bar: "bg-[#059669]",
  };
}
