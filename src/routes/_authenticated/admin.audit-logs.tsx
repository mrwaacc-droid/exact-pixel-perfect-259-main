import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/admin/audit-logs")({
  component: () => (
    <RouteWorkspacePage
      title="Audit Logs"
      description="Platform audit trail"
      role="Platform Admin"
      items={[]}
    />
  ),
});
