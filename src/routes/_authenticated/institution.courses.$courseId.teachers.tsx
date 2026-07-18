import { createFileRoute, redirect } from "@tanstack/react-router";

// Teacher-to-course assignment already lives on the institution Teachers page.
export const Route = createFileRoute("/_authenticated/institution/courses/$courseId/teachers")({
  beforeLoad: () => {
    throw redirect({ to: "/institution/teachers" });
  },
});
