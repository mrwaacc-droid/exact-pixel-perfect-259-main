import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/institution/programmes/$programmeId/edit")({
  component: () => (
    <RouteWorkspacePage
      title="Edit Programme"
      description="Edit programme details"
      role="Institution Admin"
      items={[]}
    />
  ),
});
