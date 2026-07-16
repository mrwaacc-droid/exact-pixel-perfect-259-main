import { createFileRoute } from "@tanstack/react-router";
import { RouteWorkspacePage } from "@/components/route/RouteWorkspacePage";
import { requireTeacher } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/teacher/resources")({
  beforeLoad: (ctx) => requireTeacher(ctx.context),
  component: () => (
    <RouteWorkspacePage
      role="Teacher"
      title="Resources"
      description="Teacher resources and teaching materials are ready to organize and reuse."
      primary={{ label: "Teacher dashboard", to: "/teacher/dashboard" }}
      secondary={{ label: "Courses", to: "/teacher/courses" }}
      items={[
        {
          label: "Resource library",
          to: "/teacher/resources",
          description: "Manage PDFs, slides, and lesson aids.",
        },
        {
          label: "Attach to lesson",
          to: "/teacher/lessons",
          description: "Link materials directly to a lesson.",
        },
        {
          label: "Preview classroom",
          to: "/classroom/preview/lesson-demo",
          description: "See how resources appear to learners.",
        },
      ]}
    />
  ),
});
