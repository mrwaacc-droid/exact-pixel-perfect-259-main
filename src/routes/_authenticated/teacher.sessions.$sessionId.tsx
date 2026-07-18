import { createFileRoute, redirect } from "@tanstack/react-router";

// The real live-session experience lives at /classroom/session/$sessionId.
export const Route = createFileRoute("/_authenticated/teacher/sessions/$sessionId")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/classroom/session/$sessionId",
      params: { sessionId: params.sessionId },
    });
  },
});
