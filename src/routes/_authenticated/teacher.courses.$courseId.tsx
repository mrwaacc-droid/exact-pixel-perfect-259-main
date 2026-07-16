import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart2, BookOpen, FileText, Sparkles, Users } from "lucide-react";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/shared/DashboardShell";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { dashboardConfigs } from "@/lib/dashboard-config";
import { getTeacherCourseWorkspace } from "@/lib/teacher-course-workspace";
import { requireInstitutionStaff } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/teacher/courses/$courseId")({
  beforeLoad: (ctx) => requireInstitutionStaff(ctx.context),
  component: TeacherCourseDetailPage,
});

function TeacherCourseDetailPage() {
  const { courseId } = Route.useParams();
  const course = getTeacherCourseWorkspace(courseId);

  return (
    <DashboardShell
      config={dashboardConfigs.teacher}
      activePath="/teacher/courses"
      title={course?.title ?? "Course Detail"}
    >
      <PageHeader
        label="Course workspace"
        title={course?.title ?? "Course not found"}
        subtitle={
          course?.description ??
          "Open a course from the teacher course list to manage lessons, materials, students, and analytics."
        }
        action={
          <Link
            to="/teacher/courses"
            className="inline-flex items-center rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[#8A7478] hover:bg-[var(--page-background)]"
          >
            Back to courses
          </Link>
        }
      />

      {!course ? (
        <Card className="border-[var(--border)] bg-white">
          <CardContent className="p-6 text-sm text-[#8A7478]">Course not found.</CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="kr-stat-strip kr-stat-strip--3">
            <div className="kr-stat-card-item">
              <Users className="mx-auto mb-2 h-4 w-4 text-[#8A7478]" />
              <p className="kr-stat-value text-[#191314]">{course.students}</p>
              <p className="kr-stat-label">Students</p>
            </div>
            <div className="kr-stat-card-item">
              <BookOpen className="mx-auto mb-2 h-4 w-4 text-[#8A7478]" />
              <p className="kr-stat-value text-[#191314]">{course.lessons.length}</p>
              <p className="kr-stat-label">Lessons</p>
            </div>
            <div className="kr-stat-card-item kr-stat-card-item--brand">
              <BarChart2 className="mx-auto mb-2 h-4 w-4 text-[var(--crimson)]" />
              <p className="kr-stat-value text-[var(--crimson)]">{course.progress}%</p>
              <p className="kr-stat-label">Progress</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <WorkspaceLink
              to={`/teacher/courses/${course.id}/lessons`}
              icon={<BookOpen className="h-5 w-5" />}
              title="Lessons"
              text="Choose, preview, record, and manage lessons for this course."
            />
            <WorkspaceLink
              to={`/teacher/courses/${course.id}/materials`}
              icon={<FileText className="h-5 w-5" />}
              title="Materials"
              text="Review course source materials and upload supporting content."
            />
            <WorkspaceLink
              to={`/teacher/courses/${course.id}/generate-lessons`}
              icon={<Sparkles className="h-5 w-5" />}
              title="Generate"
              text="Launch the lesson generation flow for course content."
            />
            <WorkspaceLink
              to={`/teacher/courses/${course.id}/students`}
              icon={<Users className="h-5 w-5" />}
              title="Students"
              text="Open the course roster and progress alerts."
            />
          </div>

          <Card className="border-[var(--border)] bg-white">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[#191314]">Lesson queue</h2>
                  <p className="text-sm text-[#8A7478]">Next session: {course.nextSession}</p>
                </div>
                <Link
                  to="/teacher/courses/$courseId/analytics"
                  params={{ courseId: course.id }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[#8A7478] hover:bg-[var(--page-background)]"
                >
                  <BarChart2 className="h-4 w-4" />
                  Analytics
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {course.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex flex-col gap-3 rounded-xl border border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-[#191314]">{lesson.title}</h3>
                        <StatusBadge
                          variant={
                            lesson.status === "ready"
                              ? "success"
                              : lesson.status === "review"
                                ? "warning"
                                : "neutral"
                          }
                        >
                          {lesson.status}
                        </StatusBadge>
                      </div>
                      <p className="mt-1 text-sm text-[#8A7478]">{lesson.objective}</p>
                    </div>
                    <Link
                      to="/classroom/preview/$lessonId"
                      params={{ lessonId: lesson.id }}
                      className="inline-flex items-center justify-center rounded-xl bg-[var(--crimson)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--crimson-dark)]"
                    >
                      Preview
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardShell>
  );
}

function WorkspaceLink({
  to,
  icon,
  title,
  text,
}: {
  to: string;
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <a
      href={to}
      className="block rounded-2xl border border-[var(--border)] bg-white p-5 transition hover:border-[var(--crimson)]/40 hover:shadow-sm"
    >
      <div className="mb-3 inline-flex rounded-xl bg-crimson-soft p-3 text-[var(--crimson)]">{icon}</div>
      <h3 className="font-bold text-[#191314]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#8A7478]">{text}</p>
    </a>
  );
}
