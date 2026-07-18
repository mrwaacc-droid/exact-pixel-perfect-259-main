import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search } from "lucide-react";
import { PlatformAdminSectionPage } from "@/components/dashboard/platform/PlatformAdminSectionPage";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";
import { listPlatformCourses } from "@/lib/admin.functions";
import { requirePlatformAdmin } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/admin/courses")({
  beforeLoad: (ctx) => requirePlatformAdmin(ctx.context),
  component: AdminCoursesPage,
  head: () => ({
    meta: [
      { title: "Courses — Platform Admin" },
      { name: "description", content: "View all courses across the platform" },
    ],
  }),
});

function statusVariant(status: string): "success" | "warning" | "neutral" {
  if (status === "Published") return "success";
  if (status === "Draft") return "warning";
  return "neutral";
}

function AdminCoursesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const fn = useServerFn(listPlatformCourses);

  const { data, isLoading, error } = useQuery({
    queryKey: ["platform-courses", { search, status }],
    queryFn: () => fn({ data: { search: search || undefined, status: status || undefined } }),
    staleTime: 15000,
  });

  const rows = data?.rows ?? [];

  return (
    <PlatformAdminSectionPage
      activePath="/admin/courses"
      title="Courses"
      label="Catalog"
      subtitle="Every course across institutions, KingPin, and private teachers."
      loading={isLoading}
      error={(error as Error | null)?.message ?? null}
      empty={!isLoading && rows.length === 0}
      emptyTitle="No courses found"
      emptyDescription="Adjust your search or filters."
    >
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
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Institution</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--gray-100)]">
              {rows.map((c) => (
                <tr key={c.id} className="transition hover:bg-[var(--gray-50)]">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[var(--gray-900)]">{c.title}</p>
                    <p className="text-xs text-[var(--gray-500)]">
                      {[c.subject, c.level].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-[var(--gray-600)]">
                    {c.institutionName ?? c.programmeName ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={statusVariant(c.status)}>{c.status}</StatusBadge>
                  </td>
                  <td className="px-4 py-3 capitalize text-[var(--gray-600)]">
                    {c.sourceType ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--gray-500)]">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
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
