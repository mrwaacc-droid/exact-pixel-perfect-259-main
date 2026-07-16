import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/admin/programmes")({
  component: () => (
    <RouteWorkspacePage
      title="All Programmes"
      description="View all programmes across institutions"
      role="Platform Admin"
      items={[]}
    />
  ),
});
