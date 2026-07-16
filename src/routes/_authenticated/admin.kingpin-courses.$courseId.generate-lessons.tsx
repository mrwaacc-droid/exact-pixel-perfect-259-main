import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/admin/kingpin-courses/$courseId/generate-lessons")({
  component: () => (
    <RouteWorkspacePage
      title="Generate Lessons"
      description="AI lesson generation for KingPin course"
      role="Platform Admin"
      items={[]}
    />
  ),
});
