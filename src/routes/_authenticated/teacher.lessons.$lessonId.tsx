import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/teacher/lessons/$lessonId")({
  component: () => (
    <RouteWorkspacePage
      title="Lesson Detail"
      description="View lesson details"
      role="Teacher"
      items={[]}
    />
  ),
});
