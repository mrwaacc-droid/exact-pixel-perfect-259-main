import { createFileRoute, redirect } from "@tanstack/react-router";

// Materials are managed in the Materials tab of the course detail page.
export const Route = createFileRoute(
  "/_authenticated/institution/courses/$courseId/materials",
)({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/institution/courses/$courseId",
      params: { courseId: params.courseId },
    } as any);
  },
});
