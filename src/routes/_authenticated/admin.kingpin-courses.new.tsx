import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/admin/kingpin-courses/new")({
  component: () => (
    <RouteWorkspacePage
      title="New KingPin Course"
      description="Create a platform-owned course"
      role="Platform Admin"
      items={[]}
    />
  ),
});
