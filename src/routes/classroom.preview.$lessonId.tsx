import { createFileRoute, redirect } from "@tanstack/react-router";
import { requireClientRoleRoute } from "@/lib/route-guards";

// The real lesson preview/classroom experience lives at /classroom/$lessonId.
export const Route = createFileRoute("/classroom/preview/$lessonId")({
  beforeLoad: async ({ params }) => {
    await requireClientRoleRoute(["teacher", "institution_admin", "owner", "platform_admin"]);
    throw redirect({
      to: "/classroom/$lessonId",
      params: { lessonId: params.lessonId },
    });
  },
});
