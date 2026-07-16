import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/teacher/sessions/$sessionId/activity")({
  component: () => (
    <RouteWorkspacePage
      title="Session Activity"
      description="View session activity log"
      role="Teacher"
      items={[]}
    />
  ),
});
