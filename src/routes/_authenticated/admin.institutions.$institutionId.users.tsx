import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/admin/institutions/$institutionId/users")({
  component: () => (
    <RouteWorkspacePage
      title="Institution Users"
      description="Manage institution members"
      role="Platform Admin"
      items={[]}
    />
  ),
});
