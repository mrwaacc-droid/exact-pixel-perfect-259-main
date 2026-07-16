import { createFileRoute, redirect } from "@tanstack/react-router";

// Enrollment management lives in the Enrollments tab of the course page.
export const Route = createFileRoute(
  "/_authenticated/institution/courses/$courseId/enrollments",
)({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/institution/courses/$courseId",
      params: { courseId: params.courseId },
    } as any);
  },
});
