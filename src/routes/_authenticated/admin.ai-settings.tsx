import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/admin/ai-settings")({
  component: () => (
    <RouteWorkspacePage
      title="AI Settings"
      description="Configure AI providers and generation defaults"
      role="Platform Admin"
      items={[]}
    />
  ),
});
