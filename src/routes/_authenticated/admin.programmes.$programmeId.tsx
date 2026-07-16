import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/admin/programmes/$programmeId")({
  component: () => (
    <RouteWorkspacePage
      title="Programme Detail"
      description="View programme details"
      role="Platform Admin"
      items={[]}
    />
  ),
});
