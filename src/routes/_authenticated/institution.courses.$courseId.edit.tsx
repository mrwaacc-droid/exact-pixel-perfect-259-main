import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/institution/courses/$courseId/edit")({
  component: () => (
    <RouteWorkspacePage
      title="Edit Course"
      description="Edit course details and settings"
      role="Institution Admin"
      items={[]}
    />
  ),
});
