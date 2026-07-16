import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/admin/kingpin-courses/$courseId/materials")({
  component: () => (
    <RouteWorkspacePage
      title="Course Materials"
      description="Manage KingPin course materials"
      role="Platform Admin"
      items={[]}
    />
  ),
});
