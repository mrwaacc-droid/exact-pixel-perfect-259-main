import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Activity, Building2, Sparkles } from "lucide-react";
import { PlatformAdminSectionPage } from "@/components/dashboard/platform/PlatformAdminSectionPage";
import { listPlatformActivity } from "@/lib/admin.functions";
import { requirePlatformAdmin } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/admin/activity")({
  beforeLoad: (ctx) => requirePlatformAdmin(ctx.context),
  component: AdminActivityPage,
  head: () => ({
    meta: [
      { title: "Activity — Platform Admin" },
      { name: "description", content: "Recent platform-wide activity" },
    ],
  }),
});

function activityIcon(type: string) {
  if (type === "institution") return Building2;
  if (type === "job") return Sparkles;
  return Activity;
}

function AdminActivityPage() {
  const fn = useServerFn(listPlatformActivity);
  const { data, isLoading, error } = useQuery({
    queryKey: ["platform-activity"],
    queryFn: () => fn({ data: {} }),
    staleTime: 15000,
  });

  const rows = data?.rows ?? [];

  return (
    <PlatformAdminSectionPage
      activePath="/admin/activity"
      title="Platform Activity"
      label="Feed"
      subtitle="Recent events across sessions, institutions, and lesson generation."
      loading={isLoading}
      error={(error as Error | null)?.message ?? null}
      empty={!isLoading && rows.length === 0}
      emptyTitle="No recent activity"
      emptyDescription="Activity across the platform will appear here as it happens."
    >
      <div className="overflow-hidden rounded-2xl border border-[var(--gray-200)] bg-white">
        <div className="divide-y divide-[var(--gray-100)]">
          {rows.map((r) => {
            const Icon = activityIcon(r.type);
            return (
              <div key={r.id} className="flex items-start gap-3 px-4 py-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--gray-100)]">
                  <Icon className="h-4 w-4 text-[var(--gray-500)]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[var(--gray-900)]">{r.title}</p>
                  <p className="truncate text-xs text-[var(--gray-500)]">{r.description}</p>
                </div>
                <p className="shrink-0 text-xs text-[var(--gray-400)]">
                  {r.timestamp ? new Date(r.timestamp).toLocaleString() : "—"}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </PlatformAdminSectionPage>
  );
}
