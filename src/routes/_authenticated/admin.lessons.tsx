import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/admin/lessons")({
  component: () => (
    <RouteWorkspacePage
      title="All Lessons"
      description="View all lessons across the platform"
      role="Platform Admin"
      items={[]}
    />
  ),
});
