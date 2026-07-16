import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { PlatformAdminSectionPage } from "@/components/dashboard/platform/PlatformAdminSectionPage";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";
import { requirePlatformAdmin } from "@/lib/route-guards";
import { getKingpinGrade9MathematicsCourses } from "@/lib/kingpin-grade9-mathematics-catalog";
import { syncKingpinGrade9MathematicsCatalog } from "@/lib/kingpin-grade9-mathematics-sync.functions";
import { BookOpen, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/kingpin-courses")({
  beforeLoad: (ctx) => requirePlatformAdmin(ctx.context),
  component: AdminKingpinCoursesPage,
  head: () => ({
    meta: [
      { title: "KingPin Courses — Platform Admin" },
      { name: "description", content: "Manage code-defined KingPin curriculum courses and sync them into the platform catalog." },
    ],
  }),
});

function AdminKingpinCoursesPage() {
  const syncFn = useServerFn(syncKingpinGrade9MathematicsCatalog);
  const courses = getKingpinGrade9MathematicsCourses();

  const syncMutation = useMutation({
    mutationFn: () => syncFn({ data: { publishPublicCourse: true } }),
    onSuccess: (result) => {
      toast.success(`Synced ${result.syncedCourses} Grade 9 Mathematics courses to the database.`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const totalLessons = courses.reduce(
    (sum, course) => sum + course.modules.reduce((lessonSum, module) => lessonSum + module.lessons.length, 0),
    0,
  );

  return (
    <PlatformAdminSectionPage
      activePath="/admin/kingpin-courses"
      title="KingPin Courses"
      label="Curriculum catalog"
      subtitle="Code-defined KingPin CBC mathematics courses that can be synced into the database, surfaced to learners, and extended into live classroom delivery."
      actions={[
        {
          label: syncMutation.isPending ? "Syncing…" : "Sync Grade 9 Mathematics",
          to: "/admin/kingpin-courses",
        },
      ]}
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MetricCard label="Code-defined courses" value={String(courses.length)} />
        <MetricCard label="Total lessons" value={String(totalLessons)} />
        <MetricCard label="Classroom-ready Term 1 lessons" value="46" />
      </div>

      <div className="mb-6 rounded-2xl border border-[var(--gray-200)] bg-white p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--gray-900)]">Grade 9 Mathematics sync</h2>
            <p className="mt-1 text-sm text-[var(--gray-500)]">
              Creates or updates the KingPin Academy Grade 9 Mathematics courses in the database,
              publishes the full-year and Term 1 courses for learner/public catalog visibility, and
              materializes Term 1 classroom lesson structures.
            </p>
          </div>
          <button
            type="button"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${syncMutation.isPending ? "animate-spin" : ""}`} />
            {syncMutation.isPending ? "Syncing" : "Run sync"}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--gray-200)] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--gray-200)] bg-[var(--gray-50)] text-xs font-semibold uppercase tracking-wider text-[var(--gray-500)]">
              <tr>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Visibility</th>
                <th className="px-4 py-3">Modules</th>
                <th className="px-4 py-3">Lessons</th>
                <th className="px-4 py-3">Focus</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--gray-100)]">
              {courses.map((course) => {
                const lessonCount = course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
                const publishedTarget = course.id.includes("full-year") || course.id.includes("term1");
                return (
                  <tr key={course.id} className="transition hover:bg-[var(--gray-50)]">
                    <td className="px-4 py-3 align-top">
                      <p className="font-semibold text-[var(--gray-900)]">{course.title}</p>
                      <p className="mt-1 text-xs text-[var(--gray-500)]">{course.subtitle}</p>
                      <p className="mt-1 text-[11px] text-[var(--gray-400)]">{course.slug}</p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="space-y-2">
                        <StatusBadge variant={course.visibility === "platform_admin_only" ? "warning" : "success"}>
                          {course.visibility === "platform_admin_only" ? "admin only" : "public"}
                        </StatusBadge>
                        <div>
                          <StatusBadge variant={publishedTarget ? "success" : "neutral"}>
                            {publishedTarget ? "sync publishes" : "sync keeps draft"}
                          </StatusBadge>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-[var(--gray-700)]">{course.modules.length}</td>
                    <td className="px-4 py-3 align-top text-[var(--gray-700)]">{lessonCount}</td>
                    <td className="px-4 py-3 align-top text-[var(--gray-600)]">
                      {course.modules[0]?.title ?? "—"}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col gap-2">
                        <Link
                          to="/admin/kingpin-courses/$courseId"
                          params={{ courseId: course.id }}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline"
                        >
                          <BookOpen className="h-4 w-4" /> View detail
                        </Link>
                        <Link
                          to="/admin/kingpin-courses/$courseId/lessons"
                          params={{ courseId: course.id }}
                          className="text-xs font-semibold text-[var(--gray-500)] hover:text-[var(--gray-900)]"
                        >
                          Open lessons
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </PlatformAdminSectionPage>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--gray-200)] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gray-500)]">{label}</p>
      <p className="mt-2 text-2xl font-bold text-[var(--gray-900)]">{value}</p>
    </div>
  );
}
