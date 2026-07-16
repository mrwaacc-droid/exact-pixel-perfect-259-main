import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/teacher/lessons/$lessonId/preview")({
  component: () => (
    <RouteWorkspacePage
      title="Preview Lesson"
      description="Preview lesson as learners see it"
      role="Teacher"
      items={[]}
    />
  ),
});
