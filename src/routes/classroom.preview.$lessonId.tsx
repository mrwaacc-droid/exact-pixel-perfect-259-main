import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";
import { requireClientRoleRoute } from "@/lib/route-guards";

export const Route = createFileRoute("/classroom/preview/$lessonId")({
  beforeLoad: () => requireClientRoleRoute(["teacher", "institution_admin", "owner", "platform_admin"]),
  component: () => (
    <RouteWorkspacePage
      role="Classroom"
      title="Lesson Preview"
      description="This preview route is prepared for teacher lesson testing before a real classroom session starts."
      primary={{ label: "Teacher lessons", to: "/teacher/lessons" }}
      secondary={{ label: "Teacher dashboard", to: "/teacher/dashboard" }}
      items={[
        {
          label: "Preview lesson flow",
          to: "/teacher/lessons",
          description: "Check the teaching flow before publishing.",
        },
        {
          label: "Open resources",
          to: "/teacher/resources",
          description: "Validate the attachments that will appear.",
        },
        {
          label: "Start live session",
          to: "/teacher/lessons",
          description: "Move from preview into the classroom.",
        },
      ]}
    />
  ),
});
