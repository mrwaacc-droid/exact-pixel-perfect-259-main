import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/institution/programmes")({
  component: () => (
    <RouteWorkspacePage
      title="Programmes"
      description="Manage your institution programmes"
      role="Institution Admin"
      items={[]}
    />
  ),
});
