import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/student/courses/$courseId/progress")({
  component: () => (
    <RouteWorkspacePage
      title="Course Progress"
      description="Track your progress in this course"
      role="Learner"
      items={[]}
    />
  ),
});
