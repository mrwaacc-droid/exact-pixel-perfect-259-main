import { createFileRoute, redirect } from "@tanstack/react-router";

// Course settings already live in the Settings tab of the course detail page.
export const Route = createFileRoute("/_authenticated/institution/courses/$courseId/settings")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/institution/courses/$courseId",
      params: { courseId: params.courseId },
    });
  },
});
