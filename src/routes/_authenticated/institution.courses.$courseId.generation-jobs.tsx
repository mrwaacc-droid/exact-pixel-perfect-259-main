import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/institution/courses/$courseId/generation-jobs")({
  component: () => (
    <RouteWorkspacePage
      title="Generation Jobs"
      description="View lesson generation jobs for this course"
      role="Institution Admin"
      items={[]}
    />
  ),
});
