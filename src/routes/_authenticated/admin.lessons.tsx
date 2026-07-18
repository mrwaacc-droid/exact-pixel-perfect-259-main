import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search } from "lucide-react";
import { PlatformAdminSectionPage } from "@/components/dashboard/platform/PlatformAdminSectionPage";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";
import { listPlatformLessons } from "@/lib/admin.functions";
import { requirePlatformAdmin } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/admin/lessons")({
  beforeLoad: (ctx) => requirePlatformAdmin(ctx.context),
  component: AdminLessonsPage,
  head: () => ({
    meta: [
      { title: "Lessons — Platform Admin" },
      { name: "description", content: "View all lessons across the platform" },
    ],
  }),
});

function statusVariant(status: string): "success" | "warning" | "neutral" {
  if (status === "Published") return "success";
  if (status === "Draft") return "warning";
  return "neutral";
}

function AdminLessonsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const fn = useServerFn(listPlatformLessons);

  const { data, isLoading, error } = useQuery({
    queryKey: ["platform-lessons", { search, status }],
    queryFn: () => fn({ data: { search: search || undefined, status: status || undefined } }),
    staleTime: 15000,
  });

  const rows = data?.rows ?? [];

  return (
    <PlatformAdminSectionPage
      activePath="/admin/lessons"
      title="Lessons"
      label="Content"
      subtitle="Every lesson created across institutions, KingPin, and private teachers."
      loading={isLoading}
      error={(error as Error | null)?.message ?? null}
      empty={!isLoading && rows.length === 0}
      emptyTitle="No lessons found"
      emptyDescription="Adjust your search or filters."
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--gray-200)] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gray-500)]">
            Total lessons
          </p>
          <p className="mt-2 text-2xl font-bold text-[var(--gray-900)]">{data?.total ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-[var(--gray-200)] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gray-500)]">
            Published
          </p>
          <p className="mt-2 text-2xl font-bold text-[var(--gray-900)]">
            {rows.filter((r) => r.status === "Published").length}
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--gray-400)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title..."
            className="w-full rounded-xl border border-[var(--gray-200)] bg-white py-2.5 pl-10 pr-4 text-sm text-[var(--gray-900)] placeholder:text-[var(--gray-400)] focus:border-[var(--primary)] focus:outline-none"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-[var(--gray-200)] bg-white px-4 py-2.5 text-sm text-[var(--gray-900)] focus:border-[var(--primary)] focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--gray-200)] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--gray-200)] bg-[var(--gray-50)] text-xs font-semibold uppercase tracking-wider text-[var(--gray-500)]">
              <tr>
                <th className="px-4 py-3">Lesson</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Institution</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--gray-100)]">
              {rows.map((l) => (
                <tr key={l.id} className="transition hover:bg-[var(--gray-50)]">
                  <td className="px-4 py-3 font-semibold text-[var(--gray-900)]">{l.title}</td>
                  <td className="px-4 py-3 text-[var(--gray-600)]">{l.courseTitle ?? "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={statusVariant(l.status)}>{l.status}</StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-[var(--gray-600)]">
                    {l.durationMinutes ? `${l.durationMinutes} min` : "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--gray-600)]">{l.institutionName ?? "—"}</td>
                  <td className="px-4 py-3 text-[var(--gray-500)]">
                    {l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "—"}
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
