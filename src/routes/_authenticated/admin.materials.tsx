import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/admin/materials")({
  component: () => (
    <RouteWorkspacePage
      title="All Materials"
      description="View all course materials"
      role="Platform Admin"
      items={[]}
    />
  ),
});
