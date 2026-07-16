import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/institution/programmes/$programmeId/courses")({
  component: () => (
    <RouteWorkspacePage
      title="Programme Courses"
      description="Manage courses in this programme"
      role="Institution Admin"
      items={[]}
    />
  ),
});
