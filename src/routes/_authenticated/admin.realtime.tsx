import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Radio } from "lucide-react";
import { PlatformAdminSectionPage } from "@/components/dashboard/platform/PlatformAdminSectionPage";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";
import { getPlatformRealtime } from "@/lib/admin.functions";
import { requirePlatformAdmin } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/admin/realtime")({
  beforeLoad: (ctx) => requirePlatformAdmin(ctx.context),
  component: AdminRealtimePage,
  head: () => ({
    meta: [
      { title: "Realtime — Platform Admin" },
      { name: "description", content: "View online users and active sessions" },
    ],
  }),
});

function AdminRealtimePage() {
  const fn = useServerFn(getPlatformRealtime);
  const { data, isLoading, error } = useQuery({
    queryKey: ["platform-realtime"],
    queryFn: () => fn(),
    refetchInterval: 30000,
  });

  const liveSessions = data?.liveSessions ?? [];

  return (
    <PlatformAdminSectionPage
      activePath="/admin/realtime"
      title="Realtime Presence"
      label="Live"
      subtitle="Online users and active classroom sessions across the platform."
      loading={isLoading}
      error={(error as Error | null)?.message ?? null}
      empty={!isLoading && liveSessions.length === 0 && (data?.onlineUsers ?? 0) === 0}
      emptyTitle="Nothing live right now"
      emptyDescription="Online users and active sessions will appear here as they happen."
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--gray-200)] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gray-500)]">
            Online users (last 15 min)
          </p>
          <p className="mt-2 text-2xl font-bold text-[var(--gray-900)]">{data?.onlineUsers ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-[var(--gray-200)] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gray-500)]">
            Institutions active
          </p>
          <p className="mt-2 text-2xl font-bold text-[var(--gray-900)]">
            {data?.onlineInstitutions ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--gray-200)] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gray-500)]">
            Live sessions
          </p>
          <p className="mt-2 text-2xl font-bold text-[var(--gray-900)]">{liveSessions.length}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--gray-200)] bg-white">
        <div className="border-b border-[var(--gray-200)] bg-[var(--gray-50)] px-4 py-3">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--gray-500)]">
            <Radio className="h-3.5 w-3.5 text-red-500" /> Live sessions
          </p>
        </div>
        {liveSessions.length === 0 ? (
          <p className="p-6 text-sm text-[var(--gray-500)]">No live sessions right now.</p>
        ) : (
          <div className="divide-y divide-[var(--gray-100)]">
            {liveSessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-semibold text-[var(--gray-900)]">{s.title}</p>
                  <p className="text-xs text-[var(--gray-500)]">
                    Started {s.startedAt ? new Date(s.startedAt).toLocaleString() : "—"}
                  </p>
                </div>
                <StatusBadge variant="success">{s.status}</StatusBadge>
              </div>
            ))}
          </div>
        )}
      </div>
    </PlatformAdminSectionPage>
  );
}
