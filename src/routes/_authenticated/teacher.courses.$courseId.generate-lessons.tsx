import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/shared/DashboardShell";
import { dashboardConfigs } from "@/lib/dashboard-config";
import { LessonGenerationModal } from "@/components/institution/LessonGenerationModal";
import { getCourse } from "@/lib/courses.functions";

export const Route = createFileRoute(
  "/_authenticated/teacher/courses/$courseId/generate-lessons",
)({
  component: TeacherGenerateLessonsPage,
});

function TeacherGenerateLessonsPage() {
  const { courseId } = Route.useParams();
  const navigate = useNavigate();
  const getCourseFn = useServerFn(getCourse);
  const [isOpen, setIsOpen] = useState(true);

  const courseQuery = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseFn({ data: { course_id: courseId } }),
  });

  const goBack = () =>
    navigate({
      to: "/teacher/courses/$courseId",
      params: { courseId },
    } as any);

  return (
    <DashboardShell
      config={dashboardConfigs.teacher}
      activePath="/teacher/courses"
      title="Generate Lessons"
      subtitle="Turn your uploaded materials into structured, teachable lessons."
    >
      <LessonGenerationModal
        courseId={courseId}
        courseTitle={courseQuery.data?.course?.title ?? "this course"}
        isOpen={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) goBack();
        }}
        onSuccess={() => goBack()}
      />
    </DashboardShell>
  );
}
