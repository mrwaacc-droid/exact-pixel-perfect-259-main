import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/admin/courses")({
  component: () => (
    <RouteWorkspacePage
      title="All Courses"
      description="View all courses across the platform"
      role="Platform Admin"
      items={[]}
    />
  ),
});
