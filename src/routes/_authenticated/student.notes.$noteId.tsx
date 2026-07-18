import { createFileRoute, redirect } from "@tanstack/react-router";

// Note detail already renders inline on the notes list page's master/detail layout.
export const Route = createFileRoute("/_authenticated/student/notes/$noteId")({
  beforeLoad: () => {
    throw redirect({ to: "/student/notes" });
  },
});
