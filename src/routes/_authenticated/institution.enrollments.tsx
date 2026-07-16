import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";
import { requireInstitutionAdmin } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/institution/enrollments")({
  beforeLoad: (ctx) => requireInstitutionAdmin(ctx.context),
  component: () => (
    <RouteWorkspacePage
      role="Institution"
      title="Enrollments"
      description="Course enrollment management, bulk enroll, and enrollment status tools are prepared here."
      primary={{ label: "Institution dashboard", to: "/institution/dashboard" }}
      secondary={{ label: "Students", to: "/institution/students" }}
      items={[
        {
          label: "Bulk enroll",
          to: "/institution/enrollments",
          description: "Add many learners to a course at once.",
        },
        {
          label: "Status overview",
          to: "/institution/enrollments",
          description: "Check who is active, pending, or removed.",
        },
        {
          label: "Course assignment",
          to: "/institution/courses",
          description: "Match learners to the right courses.",
        },
      ]}
    />
  ),
});
