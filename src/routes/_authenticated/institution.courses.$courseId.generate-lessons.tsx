import { createFileRoute, redirect } from "@tanstack/react-router";

// Generation runs from the Materials tab of the course detail page.
export const Route = createFileRoute(
  "/_authenticated/institution/courses/$courseId/generate-lessons",
)({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/institution/courses/$courseId",
      params: { courseId: params.courseId },
    } as any);
  },
});
