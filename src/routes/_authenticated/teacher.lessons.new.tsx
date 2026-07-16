import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/teacher/lessons/new")({
  component: () => (
    <RouteWorkspacePage
      title="Create Lesson"
      description="Create a new lesson manually"
      role="Teacher"
      items={[]}
    />
  ),
});
