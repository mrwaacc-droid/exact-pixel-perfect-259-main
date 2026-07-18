import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PlatformAdminSectionPage } from "@/components/dashboard/platform/PlatformAdminSectionPage";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";
import { listPlatformLessonGenerationJobs } from "@/lib/admin.functions";
import { requirePlatformAdmin } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/admin/lesson-generation")({
  beforeLoad: (ctx) => requirePlatformAdmin(ctx.context),
  component: AdminLessonGenerationPage,
  head: () => ({
    meta: [
      { title: "Lesson Generation — Platform Admin" },
      { name: "description", content: "Monitor all AI lesson generation jobs" },
    ],
  }),
});

function statusVariant(status: string): "success" | "warning" | "error" | "info" | "neutral" {
  if (status === "Completed") return "success";
  if (status === "Running" || status === "Processing" || status === "Pending") return "info";
  if (status === "Failed") return "error";
  return "neutral";
}

function AdminLessonGenerationPage() {
  const [status, setStatus] = useState("");
  const fn = useServerFn(listPlatformLessonGenerationJobs);

  const { data, isLoading, error } = useQuery({
    queryKey: ["platform-lesson-generation-jobs", { status }],
    queryFn: () => fn({ data: { status: status || undefined } }),
    staleTime: 15000,
    refetchInterval: 20000,
  });

  const rows = data?.rows ?? [];

  return (
    <PlatformAdminSectionPage
      activePath="/admin/lesson-generation"
      title="Lesson Generation Jobs"
      label="AI pipeline"
      subtitle="Every AI lesson-generation job triggered across institutions."
      loading={isLoading}
      error={(error as Error | null)?.message ?? null}
      empty={!isLoading && rows.length === 0}
      emptyTitle="No jobs found"
      emptyDescription="Lesson generation jobs will appear here once institutions run them."
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--gray-500)]">{data?.total ?? 0} total jobs</p>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-[var(--gray-200)] bg-white px-4 py-2.5 text-sm text-[var(--gray-900)] focus:border-[var(--primary)] focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="running">Running</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--gray-200)] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--gray-200)] bg-[var(--gray-50)] text-xs font-semibold uppercase tracking-wider text-[var(--gray-500)]">
              <tr>
                <th className="px-4 py-3">Job</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--gray-100)]">
              {rows.map((j) => (
                <tr key={j.id} className="transition hover:bg-[var(--gray-50)]">
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs text-[var(--gray-500)]">{j.id.slice(0, 8)}</p>
                    {j.error && <p className="mt-0.5 text-xs text-red-600">{j.error}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={statusVariant(j.status)}>{j.status}</StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-[var(--gray-600)]">
                    {j.generated}/{j.requested} lessons
                  </td>
                  <td className="px-4 py-3 text-[var(--gray-500)]">
                    {j.updatedAt ? new Date(j.updatedAt).toLocaleString() : "—"}
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
