import { createFileRoute, redirect } from "@tanstack/react-router";

// Starting a lesson opens the AI classroom for that lesson.
export const Route = createFileRoute("/_authenticated/student/lessons/$lessonId/start")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/classroom/$lessonId",
      params: { lessonId: params.lessonId },
    } as any);
  },
});
