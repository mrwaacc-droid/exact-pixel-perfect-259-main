import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/teacher/sessions/$sessionId")({
  component: () => (
    <RouteWorkspacePage
      title="Session Detail"
      description="View session details"
      role="Teacher"
      items={[]}
    />
  ),
});
