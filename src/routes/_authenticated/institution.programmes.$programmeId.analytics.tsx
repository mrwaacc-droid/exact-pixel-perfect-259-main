import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/institution/programmes/$programmeId/analytics")({
  component: () => (
    <RouteWorkspacePage
      title="Programme Analytics"
      description="Programme performance analytics"
      role="Institution Admin"
      items={[]}
    />
  ),
});
