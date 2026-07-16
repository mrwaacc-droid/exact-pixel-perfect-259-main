import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/admin/lesson-generation")({
  component: () => (
    <RouteWorkspacePage
      title="Lesson Generation Jobs"
      description="Monitor all AI lesson generation jobs"
      role="Platform Admin"
      items={[]}
    />
  ),
});
