import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/admin/institutions/$institutionId")({
  component: () => (
    <RouteWorkspacePage
      title="Institution Detail"
      description="View institution details"
      role="Platform Admin"
      items={[]}
    />
  ),
});
