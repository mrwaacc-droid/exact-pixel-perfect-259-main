import { createFileRoute, redirect } from "@tanstack/react-router";

// Per-lesson progress already renders inline on the student course detail page.
export const Route = createFileRoute("/_authenticated/student/courses/$courseId/progress")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/student/courses/$courseId",
      params: { courseId: params.courseId },
    });
  },
});
