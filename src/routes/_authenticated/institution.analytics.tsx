import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";
import { requireInstitutionAdmin } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/institution/analytics")({
  beforeLoad: (ctx) => requireInstitutionAdmin(ctx.context),
  component: () => (
    <RouteWorkspacePage
      role="Institution"
      title="Analytics"
      description="Course performance, student progress, quiz averages, and completion rates are prepared here."
      primary={{ label: "Institution dashboard", to: "/institution/dashboard" }}
      secondary={{ label: "Courses", to: "/institution/courses" }}
      items={[
        {
          label: "Course performance",
          to: "/institution/analytics",
          description: "Compare course outcomes and engagement.",
        },
        {
          label: "Student progress",
          to: "/institution/analytics",
          description: "Monitor completion and mastery trends.",
        },
        {
          label: "Quiz averages",
          to: "/institution/analytics",
          description: "Review score distributions and outcomes.",
        },
      ]}
    />
  ),
});
