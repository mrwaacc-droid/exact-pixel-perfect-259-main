import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  component: () => (
    <RouteWorkspacePage
      title="Platform Dashboard"
      description="Overview of the Klassruum platform"
      role="Platform Admin"
      items={[]}
    />
  ),
});
