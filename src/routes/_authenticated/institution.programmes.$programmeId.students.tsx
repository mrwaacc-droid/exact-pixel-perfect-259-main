import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/institution/programmes/$programmeId/students")({
  component: () => (
    <RouteWorkspacePage
      title="Programme Students"
      description="View students enrolled in this programme"
      role="Institution Admin"
      items={[]}
    />
  ),
});
