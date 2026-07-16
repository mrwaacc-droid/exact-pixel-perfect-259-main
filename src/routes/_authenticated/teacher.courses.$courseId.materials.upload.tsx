import { createFileRoute, redirect } from "@tanstack/react-router";

// Uploading happens through the dialog on the course materials page.
export const Route = createFileRoute(
  "/_authenticated/teacher/courses/$courseId/materials/upload",
)({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/teacher/courses/$courseId/materials",
      params: { courseId: params.courseId },
    } as any);
  },
});
