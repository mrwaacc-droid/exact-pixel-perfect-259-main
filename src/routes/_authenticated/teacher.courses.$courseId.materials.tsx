import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/shared/DashboardShell";
import { dashboardConfigs } from "@/lib/dashboard-config";
import { MaterialsTabContent } from "@/components/institution/MaterialsTabContent";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/teacher/courses/$courseId/materials")({
  component: TeacherCourseMaterialsPage,
});

function TeacherCourseMaterialsPage() {
  const { courseId } = Route.useParams();
  const navigate = useNavigate();

  return (
    <DashboardShell
      config={dashboardConfigs.teacher}
      activePath="/teacher/courses"
      title="Course Materials"
      subtitle="Upload syllabus, textbooks, and notes — the AI teacher grounds every lesson in them."
    >
      <Card>
        <CardContent className="p-6">
          <MaterialsTabContent
            courseId={courseId}
            institutionId=""
            onGenerateLessons={() =>
              navigate({
                to: "/teacher/courses/$courseId/generate-lessons",
                params: { courseId },
              } as any)
            }
          />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
