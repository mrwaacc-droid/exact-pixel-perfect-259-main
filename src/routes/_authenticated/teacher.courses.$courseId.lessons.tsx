import { createFileRoute, redirect } from "@tanstack/react-router";

// The lesson queue already lives inline on the course workspace page.
export const Route = createFileRoute("/_authenticated/teacher/courses/$courseId/lessons")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/teacher/courses/$courseId",
      params: { courseId: params.courseId },
    });
  },
});
