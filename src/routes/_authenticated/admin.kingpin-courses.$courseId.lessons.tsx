import { createFileRoute, Link } from "@tanstack/react-router";
import { PlatformAdminSectionPage, BackToSectionLink } from "@/components/dashboard/platform/PlatformAdminSectionPage";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";
import { requirePlatformAdmin } from "@/lib/route-guards";
import { getKingpinGrade9MathematicsCourseById } from "@/lib/kingpin-grade9-mathematics-catalog";
import { buildKingpinGrade9MathematicsClassroomContent } from "@/lib/kingpin-grade9-mathematics-classroom";

export const Route = createFileRoute("/_authenticated/admin/kingpin-courses/$courseId/lessons")({
  beforeLoad: (ctx) => requirePlatformAdmin(ctx.context),
  component: AdminKingpinCourseLessonsPage,
});

function AdminKingpinCourseLessonsPage() {
  const { courseId } = Route.useParams();
  const course = getKingpinGrade9MathematicsCourseById(courseId);

  const lessons = course
    ? course.modules.flatMap((module) =>
      module.lessons.map((lesson, index) => ({
        module,
        lesson,
        classroomReady: Boolean(buildKingpinGrade9MathematicsClassroomContent(lesson.id)),
        order: index + 1,
      })),
    )
    : [];

  return (
    <PlatformAdminSectionPage
      activePath="/admin/kingpin-courses"
      title={course ? `${course.title} Lessons` : "Course Lessons"}
      subtitle="Review the lesson-by-lesson structure that powers the Grade 9 Mathematics KingPin curriculum catalog."
      empty={!course}
      emptyTitle="Course not found"
      emptyDescription="This KingPin course is not available in the Grade 9 Mathematics code catalog."
    >
      {!course ? null : (
        <>
          <BackToSectionLink to={`/admin/kingpin-courses/${course.id}`}>
            Back to course detail
          </BackToSectionLink>

          <div className="mb-6 rounded-2xl border border-[var(--gray-200)] bg-white p-5">
            <p className="text-sm text-[var(--gray-600)]">
              Term 1 lessons are classroom-ready today and can be opened directly through the non-UUID
              classroom route. Term 2 and Term 3 lessons are fully cataloged and sync into the database,
              but still need the same deep classroom payload conversion if you want them live in the AI classroom.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--gray-200)] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[var(--gray-200)] bg-[var(--gray-50)] text-xs font-semibold uppercase tracking-wider text-[var(--gray-500)]">
                  <tr>
                    <th className="px-4 py-3">Lesson</th>
                    <th className="px-4 py-3">Module</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Classroom payload</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--gray-100)]">
                  {lessons.map(({ module, lesson }) => (
                    <tr key={lesson.id} className="transition hover:bg-[var(--gray-50)]">
                      <td className="px-4 py-3 align-top">
                        <p className="font-semibold text-[var(--gray-900)]">{lesson.title}</p>
                        <p className="mt-1 text-xs text-[var(--gray-500)]">{lesson.objective}</p>
                        <p className="mt-1 text-[11px] text-[var(--gray-400)]">{lesson.id}</p>
                      </td>
                      <td className="px-4 py-3 align-top text-[var(--gray-600)]">{module.title}</td>
                      <td className="px-4 py-3 align-top text-[var(--gray-600)]">{lesson.durationMinutes} min</td>
                      <td className="px-4 py-3 align-top">
                        <StatusBadge variant={buildKingpinGrade9MathematicsClassroomContent(lesson.id) ? "success" : "warning"}>
                          {buildKingpinGrade9MathematicsClassroomContent(lesson.id) ? "ready" : "catalog only"}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3 align-top">
                        {buildKingpinGrade9MathematicsClassroomContent(lesson.id) ? (
                          <a
                            href={`/classroom/${lesson.id}`}
                            className="text-sm font-semibold text-[var(--primary)] hover:underline"
                          >
                            Open classroom
                          </a>
                        ) : (
                          <span className="text-xs text-[var(--gray-400)]">Awaiting classroom builder</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Link
              to="/admin/kingpin-courses/$courseId"
              params={{ courseId: String(course.id) }}
              className="inline-flex items-center justify-center rounded-xl border border-[var(--gray-200)] bg-white px-4 py-2.5 text-sm font-bold text-[var(--gray-700)] transition hover:bg-[var(--gray-50)]"
            >
              Back to course detail
            </Link>
          </div>
        </>
      )}
    </PlatformAdminSectionPage>
  );
}
