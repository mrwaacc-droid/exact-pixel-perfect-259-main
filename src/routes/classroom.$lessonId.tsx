import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AIVideoClassroom } from "@/components/classroom/AIVideoClassroom";
import { loadClassroomLesson } from "@/lib/classroom-lesson.functions";
import { DEMO_LESSON_LIST, getDemoLessonContent } from "@/lib/demo-lessons/demo-lesson-registry";
import { buildKingpinGrade9MathematicsClassroomContent } from "@/lib/kingpin-grade9-mathematics-classroom";
import { startLearnerSession, endSession } from "@/lib/live-sessions.functions";
import type { ClassroomLessonContent } from "@/lib/classroom-content";
import { requireClientAuthRoute } from "@/lib/route-guards";

const SITE_URL = "https://klassruum.com";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/classroom/$lessonId")({
  beforeLoad: ({ params }) => {
    if (!UUID_RE.test(params.lessonId)) return;
    return requireClientAuthRoute();
  },
  head: ({ params }) => {
    const demoMeta = DEMO_LESSON_LIST.find((lesson) => lesson.id === params.lessonId);
    const title = demoMeta
      ? `${demoMeta.title} — Live AI Classroom Demo | Klassruum`
      : "Live AI Classroom Lesson | Klassruum";
    const description = demoMeta
      ? `Start the ${demoMeta.subject} demo lesson: ${demoMeta.description} Experience an AI teacher, live whiteboard, voice explanations, captions, transcript, notes, accessibility modes, and lesson progress evidence.`
      : "Open a live Klassruum AI classroom lesson with teacher-led explanations, interactive whiteboard, captions, transcript, accessibility modes, notes, and learner progress evidence.";
    const url = `${SITE_URL}/classroom/${params.lessonId}`;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        {
          name: "keywords",
          content:
            "AI classroom lesson, live AI teacher, interactive whiteboard lesson, classroom demo, accessible online learning, live captions, lesson transcript, AI tutor, learner progress",
        },
        { name: "author", content: "Klassruum" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: Classroom,
});

/**
 * The live AI classroom. For a real (UUID) lesson id it loads the published
 * lesson from the database. Any non-UUID id is looked up from the demo lesson
 * registry (supports multiple demo subjects: math, chemistry, english, etc.).
 */
function Classroom() {
  const { lessonId } = Route.useParams();
  const navigate = useNavigate();

  // Demo classroom content is synchronous and should be available on the first
  // render. This avoids direct demo URLs showing only "Preparing your classroom"
  // during SSR and gives the page indexable, useful content immediately.
  const initialDemoContent = !UUID_RE.test(lessonId)
    ? (buildKingpinGrade9MathematicsClassroomContent(lessonId) ??
      getDemoLessonContent(lessonId) ??
      getDemoLessonContent("demo"))
    : null;

  const [content, setContent] = useState<ClassroomLessonContent | null>(() => initialDemoContent);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(() =>
    initialDemoContent ? "ready" : "loading",
  );
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    // ── Demo lesson (non-UUID ID) ─────────────────────────────────────
    if (!UUID_RE.test(lessonId)) {
      const codeContent = buildKingpinGrade9MathematicsClassroomContent(lessonId);
      const demoContent = codeContent ?? getDemoLessonContent(lessonId);
      if (demoContent) {
        setContent(demoContent);
        setStatus("ready");
      } else {
        // Unknown demo ID — fall back to the default math demo
        const fallback = getDemoLessonContent("demo");
        if (fallback) {
          setContent(fallback);
          setStatus("ready");
        } else {
          setStatus("error");
        }
      }
      return;
    }

    // ── Real database lesson (UUID) ───────────────────────────────────
    setStatus("loading");
    loadClassroomLesson({ data: { lesson_id: lessonId } })
      .then((res) => {
        if (cancelled) return;
        if (res.content) {
          setContent(res.content);
          setStatus("ready");
          startLearnerSession({ data: { lesson_id: lessonId } })
            .then((s) => {
              if (!cancelled) setSessionId(s.sessionId);
            })
            .catch(() => {
              /* non-fatal */
            });
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  function leaveClassroom() {
    if (sessionId) {
      endSession({ data: { session_id: sessionId } }).catch(() => { });
    }
    navigate({ to: UUID_RE.test(lessonId) ? "/student/dashboard" : "/demo/classroom" });
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground transition-colors duration-200">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
          <p className="text-sm text-muted-foreground">Preparing your classroom…</p>
        </div>
      </div>
    );
  }

  if (status === "error" || !content) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center text-foreground transition-colors duration-200">
        <div>
          <h1 className="text-2xl font-semibold">Lesson not available</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            This lesson has no published teaching content yet, or you don't have access to it.
          </p>
          <button
            onClick={() => navigate({ to: "/student/dashboard" })}
            className="mt-6 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <AIVideoClassroom
      content={content}
      sessionId={sessionId}
      onExit={leaveClassroom}
      autoPlay={true}
    />
  );
}
