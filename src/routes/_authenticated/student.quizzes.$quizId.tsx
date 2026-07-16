import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";
import { requireStudent } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/student/quizzes/$quizId")({
  beforeLoad: (ctx) => requireStudent(ctx.context),
  component: () => (
    <RouteWorkspacePage
      role="Student"
      title="Quiz Detail"
      description="A per-quiz review page for scores, answer explanations, and retake status."
      primary={{ label: "Back to quizzes", to: "/student/quizzes" }}
      secondary={{ label: "Open progress", to: "/student/progress" }}
      items={[
        {
          label: "Review answers",
          to: "/student/quizzes",
          description: "See the reasoning behind each response.",
        },
        {
          label: "Retake quiz",
          to: "/student/quizzes",
          description: "Try again if the lesson allows a retake.",
        },
        {
          label: "View session summary",
          to: "/student/sessions/session-demo/summary",
          description: "Reconnect the quiz to the lesson session.",
        },
      ]}
    />
  ),
});
