import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/institution/courses/$courseId/settings")({
  component: () => (
    <RouteWorkspacePage
      title="Course Settings"
      description="Course configuration and settings"
      role="Institution Admin"
      items={[]}
    />
  ),
});
