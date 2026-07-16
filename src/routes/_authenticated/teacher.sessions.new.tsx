import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/teacher/sessions/new")({
  component: () => (
    <RouteWorkspacePage
      title="Start Session"
      description="Start a new classroom session"
      role="Teacher"
      items={[]}
    />
  ),
});
