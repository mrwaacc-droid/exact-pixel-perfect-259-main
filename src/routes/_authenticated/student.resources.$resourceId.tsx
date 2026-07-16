import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";
import { requireStudent } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/student/resources/$resourceId")({
  beforeLoad: (ctx) => requireStudent(ctx.context),
  component: () => (
    <RouteWorkspacePage
      role="Student"
      title="Resource Detail"
      description="Open a specific resource, then download, save to notes, or ask AI about it later."
      primary={{ label: "Back to resources", to: "/student/resources" }}
      secondary={{ label: "Open notes", to: "/student/notes" }}
      items={[
        {
          label: "Open resource",
          to: "/student/resources",
          description: "Read the attached material in a focused view.",
        },
        {
          label: "Download file",
          to: "/student/resources",
          description: "Keep an offline copy for later study.",
        },
        {
          label: "Ask AI about this resource",
          to: "/student/resources",
          description: "Use a classroom-aware prompt later.",
        },
      ]}
    />
  ),
});
