import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/teacher/courses/$courseId/lessons")({
  component: () => (
    <RouteWorkspacePage
      title="Course Lessons"
      description="View and manage lessons"
      role="Teacher"
      items={[]}
    />
  ),
});
