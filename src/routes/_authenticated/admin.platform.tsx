import { createFileRoute, redirect } from "@tanstack/react-router";

// The platform admin dashboard lives at /admin/dashboard (the sidebar's actual link target).
export const Route = createFileRoute("/_authenticated/admin/platform")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/dashboard" });
  },
});
