import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";

export const Route = createFileRoute("/_authenticated/student/transcripts")({
  component: () => (
    <RouteWorkspacePage
      title="Transcripts"
      description="View your classroom transcripts"
      role="Learner"
      items={[]}
    />
  ),
});
