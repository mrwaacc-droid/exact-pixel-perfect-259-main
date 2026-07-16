import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/institution/programmes/$programmeId")({
  component: () => (
    <RouteWorkspacePage
      title="Programme"
      description="View programme details and courses"
      role="Institution Admin"
      items={[]}
    />
  ),
});
