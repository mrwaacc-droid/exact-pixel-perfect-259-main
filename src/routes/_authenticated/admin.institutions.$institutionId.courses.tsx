import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/admin/institutions/$institutionId/courses")({
  component: () => (
    <RouteWorkspacePage
      title="Institution Courses"
      description="View institution courses"
      role="Platform Admin"
      items={[]}
    />
  ),
});
