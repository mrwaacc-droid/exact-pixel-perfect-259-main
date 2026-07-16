import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/institution/lesson-generation/$jobId")({
  component: () => (
    <RouteWorkspacePage
      title="Generation Job"
      description="View and review generated lessons"
      role="Institution Admin"
      items={[]}
    />
  ),
});
