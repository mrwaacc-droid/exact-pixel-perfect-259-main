import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/admin/realtime")({
  component: () => (
    <RouteWorkspacePage
      title="Realtime Presence"
      description="View online users and active sessions"
      role="Platform Admin"
      items={[]}
    />
  ),
});
