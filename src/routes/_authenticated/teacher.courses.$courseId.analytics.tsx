import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, BarChart2, BookOpen, TrendingUp, Users } from "lucide-react";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/shared/DashboardShell";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { dashboardConfigs } from "@/lib/dashboard-config";
import { getTeacherCourseWorkspace } from "@/lib/teacher-course-workspace";
import { requireInstitutionStaff } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/teacher/courses/$courseId/analytics")({
  beforeLoad: (ctx) => requireInstitutionStaff(ctx.context),
  component: TeacherCourseAnalyticsPage,
});

function TeacherCourseAnalyticsPage() {
  const { courseId } = Route.useParams();
  const course = getTeacherCourseWorkspace(courseId);

  return (
    <DashboardShell
      config={dashboardConfigs.teacher}
      activePath="/teacher/courses"
      title={course?.title ? `${course.title} Analytics` : "Course Analytics"}
    >
      <PageHeader
        label="Course analytics"
        title={course?.title ? `${course.title} analytics` : "Course not found"}
        subtitle="Track lesson progress, weak topics, and follow-up needs for this course."
        action={
          <Link
            to="/teacher/courses/$courseId"
            params={{ courseId }}
            className="inline-flex items-center rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[#8A7478] hover:bg-[var(--page-background)]"
          >
            Course overview
          </Link>
        }
      />

      {!course ? (
        <Card className="border-[var(--border)] bg-white">
          <CardContent className="p-6 text-sm text-[#8A7478]">Course not found.</CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          <div className="kr-stat-strip kr-stat-strip--3">
            <div className="kr-stat-card-item kr-stat-card-item--brand">
              <TrendingUp className="mx-auto mb-2 h-4 w-4 text-[var(--crimson)]" />
              <p className="kr-stat-value text-[var(--crimson)]">{course.progress}%</p>
              <p className="kr-stat-label">Course progress</p>
            </div>
            <div className="kr-stat-card-item">
              <Users className="mx-auto mb-2 h-4 w-4 text-[#8A7478]" />
              <p className="kr-stat-value text-[#191314]">{course.students}</p>
              <p className="kr-stat-label">Students</p>
            </div>
            <div className="kr-stat-card-item kr-stat-card-item--warning">
              <AlertTriangle className="mx-auto mb-2 h-4 w-4 text-amber-600" />
              <p className="kr-stat-value text-amber-700">3</p>
              <p className="kr-stat-label">Follow-ups</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <AnalyticsCard
              icon={<BookOpen className="h-5 w-5" />}
              title="Lesson readiness"
              text={`${course.lessons.filter((lesson) => lesson.status === "ready").length} lessons are ready for classroom delivery.`}
            />
            <AnalyticsCard
              icon={<BarChart2 className="h-5 w-5" />}
              title="Weak topics"
              text="Use lesson reviews and classroom results to prioritize revision topics."
            />
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function AnalyticsCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <Card className="border-[var(--border)] bg-white">
      <CardContent className="flex gap-3 p-5">
        <div className="rounded-xl bg-crimson-soft p-3 text-[var(--crimson)]">{icon}</div>
        <div>
          <h2 className="font-bold text-[#191314]">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-[#8A7478]">{text}</p>
        </div>
      </CardContent>
    </Card>
  );
}
