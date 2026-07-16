import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/institution/courses/$courseId/teachers")({
  component: () => (
    <RouteWorkspacePage
      title="Course Teachers"
      description="Manage teachers assigned to this course"
      role="Institution Admin"
      items={[]}
    />
  ),
});
