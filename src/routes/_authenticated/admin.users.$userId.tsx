import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/admin/users/$userId")({
  component: () => (
    <RouteWorkspacePage
      title="User Detail"
      description="View and manage user details"
      role="Platform Admin"
      items={[]}
    />
  ),
});
