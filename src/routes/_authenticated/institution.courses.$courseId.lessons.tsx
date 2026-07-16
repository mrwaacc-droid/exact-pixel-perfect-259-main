import { createFileRoute, redirect } from "@tanstack/react-router";

// Lessons are managed in the Lessons tab of the course detail page.
export const Route = createFileRoute(
  "/_authenticated/institution/courses/$courseId/lessons",
)({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/institution/courses/$courseId",
      params: { courseId: params.courseId },
    } as any);
  },
});
