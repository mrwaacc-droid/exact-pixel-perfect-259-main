import { createFileRoute, redirect } from "@tanstack/react-router";

// Lesson creation already lives in the Lessons tab of the course detail page.
export const Route = createFileRoute("/_authenticated/institution/courses/$courseId/lessons/new")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/institution/courses/$courseId",
      params: { courseId: params.courseId },
    });
  },
});
