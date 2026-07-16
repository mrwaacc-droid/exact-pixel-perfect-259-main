import { createFileRoute } from "@tanstack/react-router";
import { ParentSectionPage } from "@/components/dashboard/parent/ParentSectionPage";
import { requireParent } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/parent/sessions")({
  beforeLoad: (ctx) => requireParent(ctx.context),
  component: () => <ParentSectionPage section="sessions" />,
});
