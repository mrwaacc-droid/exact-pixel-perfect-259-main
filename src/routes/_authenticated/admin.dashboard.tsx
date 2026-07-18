import { createFileRoute } from "@tanstack/react-router";
import { PlatformAdminDashboard } from "@/components/dashboard/platform/PlatformAdminDashboard";
import { requirePlatformAdmin } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  beforeLoad: (ctx) => requirePlatformAdmin(ctx.context),
  component: PlatformAdminDashboard,
  head: () => ({
    meta: [
      { title: "Platform Admin — Klassruum" },
      { name: "description", content: "Platform administration dashboard" },
    ],
  }),
});
