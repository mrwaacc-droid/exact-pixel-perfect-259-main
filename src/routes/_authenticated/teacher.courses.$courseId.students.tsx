import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Mail, Users } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shared/DashboardShell";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { dashboardConfigs } from "@/lib/dashboard-config";
import { getTeacherCourseWorkspace } from "@/lib/teacher-course-workspace";
import { requireInstitutionStaff } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/teacher/courses/$courseId/students")({
  beforeLoad: (ctx) => requireInstitutionStaff(ctx.context),
  component: TeacherCourseStudentsPage,
});

const STUDENTS = [
  { name: "Amina Otieno", progress: 82, status: "on track" },
  { name: "Brian Mwangi", progress: 61, status: "follow up" },
  { name: "Clara Wanjiku", progress: 74, status: "on track" },
  { name: "David Kamau", progress: 48, status: "follow up" },
];

function TeacherCourseStudentsPage() {
  const { courseId } = Route.useParams();
  const course = getTeacherCourseWorkspace(courseId);

  return (
    <DashboardShell
      config={dashboardConfigs.teacher}
      activePath="/teacher/courses"
      title={course?.title ? `${course.title} Students` : "Course Students"}
    >
      <PageHeader
        label="Course roster"
        title={course?.title ? `${course.title} students` : "Course not found"}
        subtitle="Review learners, progress, and follow-up needs for this course."
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
        <div className="space-y-4">
          <div className="kr-stat-strip kr-stat-strip--3">
            <div className="kr-stat-card-item">
              <Users className="mx-auto mb-2 h-4 w-4 text-[#8A7478]" />
              <p className="kr-stat-value text-[#191314]">{course.students}</p>
              <p className="kr-stat-label">Enrolled</p>
            </div>
            <div className="kr-stat-card-item kr-stat-card-item--success">
              <CheckCircle2 className="mx-auto mb-2 h-4 w-4 text-green-600" />
              <p className="kr-stat-value text-green-700">2</p>
              <p className="kr-stat-label">On track</p>
            </div>
            <div className="kr-stat-card-item kr-stat-card-item--warning">
              <AlertTriangle className="mx-auto mb-2 h-4 w-4 text-amber-600" />
              <p className="kr-stat-value text-amber-700">2</p>
              <p className="kr-stat-label">Follow up</p>
            </div>
          </div>

          {STUDENTS.map((student) => (
            <Card key={student.name} className="border-[var(--border)] bg-white">
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-bold text-[#191314]">{student.name}</h2>
                  <p className="text-sm text-[#8A7478]">{student.progress}% course progress</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={student.status === "on track" ? "default" : "secondary"}>
                    {student.status}
                  </Badge>
                  <a
                    href={`mailto:${student.name.toLowerCase().replace(/\s+/g, ".")}@example.com`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[#8A7478] hover:bg-[var(--page-background)]"
                  >
                    <Mail className="h-4 w-4" />
                    Message
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
