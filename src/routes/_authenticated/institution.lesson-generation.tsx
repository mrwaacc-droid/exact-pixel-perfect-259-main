import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, Loader2, Sparkles } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shared/DashboardShell";
import { dashboardConfigs } from "@/lib/dashboard-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LessonGenerationModal } from "@/components/institution/LessonGenerationModal";
import { getMyInstitutions } from "@/lib/institutions.functions";
import { listCourses } from "@/lib/courses.functions";
import { requireClientAuthRoute } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/institution/lesson-generation")({
  beforeLoad: () => requireClientAuthRoute(),
  component: InstitutionLessonGenerationPage,
});

function InstitutionLessonGenerationPage() {
  const myInstitutionsFn = useServerFn(getMyInstitutions);
  const listCoursesFn = useServerFn(listCourses);
  const [target, setTarget] = useState<{ id: string; title: string } | null>(null);

  const institutionsQuery = useQuery({
    queryKey: ["my-institutions"],
    queryFn: () => myInstitutionsFn(),
  });
  const institutionId = useMemo(() => {
    const memberships = institutionsQuery.data?.memberships ?? [];
    return memberships[0]?.institution?.id as string | undefined;
  }, [institutionsQuery.data]);

  const coursesQuery = useQuery({
    queryKey: ["institution-courses", institutionId],
    queryFn: () => listCoursesFn({ data: { institution_id: institutionId as string } }),
    enabled: Boolean(institutionId),
  });
  const courses = coursesQuery.data?.courses ?? [];

  const isLoading = institutionsQuery.isLoading || coursesQuery.isLoading;

  return (
    <DashboardShell
      config={dashboardConfigs.institution}
      activePath="/institution/lesson-generation"
      title="Lesson Generation"
      subtitle="Turn approved course materials into complete, teachable lessons — script, board plan, questions, practice, and homework."
    >
      <div className="mx-auto max-w-5xl space-y-6">
        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--crimson)]" />
          </div>
        )}

        {!isLoading && courses.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F7E7EA]">
                <Sparkles className="h-7 w-7 text-[var(--crimson)]" />
              </div>
              <h3 className="text-lg font-black text-heading">No courses yet</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Create a course and upload its materials first — then generate lessons from
                them here.
              </p>
              <Button asChild className="mt-5">
                <Link to={"/institution/courses/new" as any}>Create a course</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && courses.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {courses.map((course: any) => (
              <Card key={course.id}>
                <CardContent className="flex h-full flex-col p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F7E7EA]">
                      <BookOpen className="h-5 w-5 text-[var(--crimson)]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-heading">{course.title}</h3>
                      <p className="text-xs capitalize text-muted-foreground">
                        {course.subject ?? "General"} · {course.status}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-1 items-end justify-between gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        to={"/institution/courses/$courseId" as any}
                        params={{ courseId: course.id } as any}
                      >
                        Open course
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setTarget({ id: course.id, title: course.title })}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate lessons
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {target && (
        <LessonGenerationModal
          courseId={target.id}
          courseTitle={target.title}
          isOpen={Boolean(target)}
          onOpenChange={(open) => {
            if (!open) setTarget(null);
          }}
          onSuccess={() => setTarget(null)}
        />
      )}
    </DashboardShell>
  );
}
