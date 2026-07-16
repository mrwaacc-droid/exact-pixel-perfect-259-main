import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";
import { requireStudent } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/student/notes/$noteId")({
  beforeLoad: (ctx) => requireStudent(ctx.context),
  component: () => (
    <RouteWorkspacePage
      role="Student"
      title="Note Details"
      description="This route is ready for a specific note, summary, and whiteboard export view."
      primary={{ label: "Back to notes", to: "/student/notes" }}
      secondary={{ label: "Open dashboard", to: "/student/dashboard" }}
      items={[
        {
          label: "Lesson summary",
          to: "/student/notes",
          description: "Review the key ideas captured from the lesson.",
        },
        {
          label: "Whiteboard export",
          to: "/student/notes",
          description: "Bring back diagrams, formulas, and annotations.",
        },
        {
          label: "Homework section",
          to: "/student/notes",
          description: "Keep follow-up work and reminders together.",
        },
      ]}
    />
  ),
});
