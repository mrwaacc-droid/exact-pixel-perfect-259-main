import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";
import { requireTeacher } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/teacher/messages")({
  beforeLoad: (ctx) => requireTeacher(ctx.context),
  component: () => (
    <RouteWorkspacePage
      role="Teacher"
      title="Messages"
      description="Message your students, answer questions, and follow up on alerts from your courses."
      primary={{ label: "Teacher dashboard", to: "/teacher/dashboard" }}
      secondary={{ label: "Students", to: "/teacher/students" }}
      items={[
        {
          label: "Student conversations",
          to: "/teacher/messages",
          description: "Direct messages with learners in your courses.",
        },
        {
          label: "Students",
          to: "/teacher/students",
          description: "Pick a student to message.",
        },
        {
          label: "Analytics",
          to: "/teacher/analytics",
          description: "Spot learners who need a follow-up message.",
        },
      ]}
    />
  ),
});
