import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/admin/institutions/$institutionId/activity")({
  component: () => (
    <RouteWorkspacePage
      title="Institution Activity"
      description="View institution activity log"
      role="Platform Admin"
      items={[]}
    />
  ),
});
