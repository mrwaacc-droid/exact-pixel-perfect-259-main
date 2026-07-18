import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PlatformAdminSectionPage } from "@/components/dashboard/platform/PlatformAdminSectionPage";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";
import { listPlatformProgrammes } from "@/lib/admin.functions";
import { requirePlatformAdmin } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/admin/programmes")({
  beforeLoad: (ctx) => requirePlatformAdmin(ctx.context),
  component: AdminProgrammesPage,
  head: () => ({
    meta: [
      { title: "Programmes — Platform Admin" },
      { name: "description", content: "View all programmes across institutions" },
    ],
  }),
});

function AdminProgrammesPage() {
  const fn = useServerFn(listPlatformProgrammes);
  const { data, isLoading, error } = useQuery({
    queryKey: ["platform-programmes"],
    queryFn: () => fn({ data: {} }),
    staleTime: 15000,
  });

  const rows = data?.rows ?? [];

  return (
    <PlatformAdminSectionPage
      activePath="/admin/programmes"
      title="Programmes"
      label="Curriculum"
      subtitle="Every programme created by an institution on the platform."
      loading={isLoading}
      error={(error as Error | null)?.message ?? null}
      empty={!isLoading && rows.length === 0}
      emptyTitle="No programmes found"
      emptyDescription="Programmes will appear here once institutions create them."
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--gray-200)] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gray-500)]">
            Total programmes
          </p>
          <p className="mt-2 text-2xl font-bold text-[var(--gray-900)]">{data?.total ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-[var(--gray-200)] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gray-500)]">
            Active
          </p>
          <p className="mt-2 text-2xl font-bold text-[var(--gray-900)]">
            {rows.filter((r) => r.status === "active").length}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--gray-200)] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--gray-200)] bg-[var(--gray-50)] text-xs font-semibold uppercase tracking-wider text-[var(--gray-500)]">
              <tr>
                <th className="px-4 py-3">Programme</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--gray-100)]">
              {rows.map((p) => (
                <tr key={p.id} className="transition hover:bg-[var(--gray-50)]">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[var(--gray-900)]">{p.name}</p>
                    {p.description && (
                      <p className="line-clamp-1 text-xs text-[var(--gray-500)]">{p.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={p.status === "active" ? "success" : "neutral"}>
                      {p.status}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-[var(--gray-500)]">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PlatformAdminSectionPage>
  );
}
