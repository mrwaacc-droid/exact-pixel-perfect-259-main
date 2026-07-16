import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/institution/programmes/new")({
  component: () => (
    <RouteWorkspacePage
      title="Create Programme"
      description="Create a new academic programme"
      role="Institution Admin"
      items={[]}
    />
  ),
});
