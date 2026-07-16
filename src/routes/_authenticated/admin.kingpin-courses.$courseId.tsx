import { createFileRoute, Link } from "@tanstack/react-router";
import { PlatformAdminSectionPage, BackToSectionLink } from "@/components/dashboard/platform/PlatformAdminSectionPage";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";
import { requirePlatformAdmin } from "@/lib/route-guards";
import { getKingpinGrade9MathematicsCourseById } from "@/lib/kingpin-grade9-mathematics-catalog";

export const Route = createFileRoute("/_authenticated/admin/kingpin-courses/$courseId")({
  beforeLoad: (ctx) => requirePlatformAdmin(ctx.context),
  component: AdminKingpinCourseDetailPage,
});

function AdminKingpinCourseDetailPage() {
  const { courseId } = Route.useParams();
  const course = getKingpinGrade9MathematicsCourseById(courseId);

  return (
    <PlatformAdminSectionPage
      activePath="/admin/kingpin-courses"
      title={course?.title ?? "KingPin Course"}
      subtitle={course?.description ?? "Review code-defined KingPin course structure and implementation details."}
      empty={!course}
      emptyTitle="Course not found"
      emptyDescription="This KingPin course is not available in the code-defined Grade 9 Mathematics catalog."
    >
      {!course ? null : (
        <>
          <BackToSectionLink to="/admin/kingpin-courses">Back to KingPin courses</BackToSectionLink>

          <div className="mb-6 grid gap-4 sm:grid-cols-4">
            <MetricCard label="Modules" value={String(course.modules.length)} />
            <MetricCard
              label="Lessons"
              value={String(course.modules.reduce((sum, module) => sum + module.lessons.length, 0))}
            />
            <MetricCard label="Audience groups" value={String(course.audience.length)} />
            <MetricCard label="Delivery mode" value={course.visibility === "platform_admin_only" ? "Admin only" : "Public"} />
          </div>

          <div className="mb-6 rounded-2xl border border-[var(--gray-200)] bg-white p-5">
            <div className="flex flex-wrap gap-2">
              <StatusBadge variant="info">{course.sourceType}</StatusBadge>
              <StatusBadge variant={course.visibility === "platform_admin_only" ? "warning" : "success"}>
                {course.visibility}
              </StatusBadge>
              <StatusBadge variant="neutral">{course.pricingLabel}</StatusBadge>
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--gray-600)]">{course.heroDescription}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-[var(--gray-200)] bg-white p-5">
              <h2 className="text-lg font-bold text-[var(--gray-900)]">Term and module structure</h2>
              <div className="mt-4 space-y-4">
                {course.modules.map((module) => (
                  <div key={module.id} className="rounded-2xl border border-[var(--gray-100)] p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-[var(--gray-900)]">{module.title}</h3>
                        <p className="mt-1 text-sm text-[var(--gray-500)]">{module.overview}</p>
                      </div>
                      <StatusBadge variant="default">{`${module.lessons.length} lessons`}</StatusBadge>
                    </div>
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--gray-600)]">
                      {module.outcomes.slice(0, 4).map((outcome) => (
                        <li key={outcome}>{outcome}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-[var(--gray-200)] bg-white p-5">
                <h2 className="text-lg font-bold text-[var(--gray-900)]">Included resources</h2>
                <ul className="mt-4 space-y-2 text-sm text-[var(--gray-600)]">
                  {course.includedResources.map((resource) => (
                    <li key={resource}>• {resource}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-[var(--gray-200)] bg-white p-5">
                <h2 className="text-lg font-bold text-[var(--gray-900)]">Assessment model</h2>
                <ul className="mt-4 space-y-2 text-sm text-[var(--gray-600)]">
                  {course.assessmentModel.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-[var(--gray-200)] bg-white p-5">
                <h2 className="text-lg font-bold text-[var(--gray-900)]">Actions</h2>
                <div className="mt-4 flex flex-col gap-3">
                  <Link
                    to="/admin/kingpin-courses/$courseId/lessons"
                    params={{ courseId: String(course.id) }}
                    className="inline-flex items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--primary-dark)]"
                  >
                    View lessons
                  </Link>
                  <a
                    href={`/courses/${course.slug}`}
                    className="inline-flex items-center justify-center rounded-xl border border-[var(--gray-200)] bg-white px-4 py-2.5 text-sm font-bold text-[var(--gray-700)] transition hover:bg-[var(--gray-50)]"
                  >
                    Open public course page
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
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
