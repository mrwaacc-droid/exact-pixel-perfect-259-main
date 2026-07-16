import { createFileRoute, redirect } from "@tanstack/react-router";

// Uploading happens through the Materials tab dialog on the course page.
export const Route = createFileRoute(
  "/_authenticated/institution/courses/$courseId/materials/upload",
)({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/institution/courses/$courseId",
      params: { courseId: params.courseId },
    } as any);
  },
});
