import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/admin/activity")({
  component: () => (
    <RouteWorkspacePage
      title="Platform Activity"
      description="Recent platform-wide activity"
      role="Platform Admin"
      items={[]}
    />
  ),
});
