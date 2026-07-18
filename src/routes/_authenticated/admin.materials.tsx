import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PlatformAdminSectionPage } from "@/components/dashboard/platform/PlatformAdminSectionPage";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";
import { listPlatformMaterials } from "@/lib/admin.functions";
import { requirePlatformAdmin } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/admin/materials")({
  beforeLoad: (ctx) => requirePlatformAdmin(ctx.context),
  component: AdminMaterialsPage,
  head: () => ({
    meta: [
      { title: "Materials — Platform Admin" },
      { name: "description", content: "View all course materials" },
    ],
  }),
});

function statusVariant(status: string): "success" | "warning" | "error" | "neutral" {
  if (status === "Ready" || status === "Completed") return "success";
  if (status === "Processing" || status === "Pending") return "warning";
  if (status === "Failed") return "error";
  return "neutral";
}

function AdminMaterialsPage() {
  const [status, setStatus] = useState("");
  const fn = useServerFn(listPlatformMaterials);

  const { data, isLoading, error } = useQuery({
    queryKey: ["platform-materials", { status }],
    queryFn: () => fn({ data: { status: status || undefined } }),
    staleTime: 15000,
  });

  const rows = data?.rows ?? [];

  return (
    <PlatformAdminSectionPage
      activePath="/admin/materials"
      title="Materials"
      label="Content sources"
      subtitle="Uploaded course materials and their processing status."
      loading={isLoading}
      error={(error as Error | null)?.message ?? null}
      empty={!isLoading && rows.length === 0}
      emptyTitle="No materials found"
      emptyDescription="Materials uploaded by institutions will appear here."
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--gray-500)]">{data?.total ?? 0} total materials</p>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-[var(--gray-200)] bg-white px-4 py-2.5 text-sm text-[var(--gray-900)] focus:border-[var(--primary)] focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--gray-200)] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--gray-200)] bg-[var(--gray-50)] text-xs font-semibold uppercase tracking-wider text-[var(--gray-500)]">
              <tr>
                <th className="px-4 py-3">Material</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--gray-100)]">
              {rows.map((m) => (
                <tr key={m.id} className="transition hover:bg-[var(--gray-50)]">
                  <td className="px-4 py-3 font-semibold text-[var(--gray-900)]">{m.title}</td>
                  <td className="px-4 py-3 capitalize text-[var(--gray-600)]">{m.type}</td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={statusVariant(m.processingStatus)}>
                      {m.processingStatus}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-[var(--gray-500)]">
                    {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "—"}
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
