import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/admin/lesson-generation/$jobId")({
  component: () => (
    <RouteWorkspacePage
      title="Generation Job"
      description="View generation job details"
      role="Platform Admin"
      items={[]}
    />
  ),
});
