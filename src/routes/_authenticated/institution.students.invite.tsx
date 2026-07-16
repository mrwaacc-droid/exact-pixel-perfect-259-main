import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";
import { requireInstitutionStaff } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/institution/students/invite")({
  beforeLoad: (ctx) => requireInstitutionStaff(ctx.context),
  component: () => (
    <RouteWorkspacePage
      role="Institution Admin"
      title="Invite Students"
      description="A route prepared for inviting learners individually or in bulk to your institution."
      primary={{ label: "Students", to: "/institution/students" }}
      secondary={{ label: "Enrollments", to: "/institution/enrollments" }}
      items={[
        {
          label: "All students",
          to: "/institution/students",
          description: "Browse learners already in your institution.",
        },
        {
          label: "Enrollments",
          to: "/institution/enrollments",
          description: "Manage course enrollments and pending invites.",
        },
        {
          label: "Courses",
          to: "/institution/courses",
          description: "Pick a course to enroll invited students into.",
        },
      ]}
    />
  ),
});
