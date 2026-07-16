import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Users,
  Settings as SettingsIcon,
  FolderUp,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { InstitutionShell } from "@/components/institution/InstitutionShell";
import { CreateLessonDialog } from "@/components/institution/CreateLessonDialog";
import { EnrollStudentDialog } from "@/components/institution/EnrollStudentDialog";
import { MaterialsTabContent } from "@/components/institution/MaterialsTabContent";
import { LessonGenerationModal } from "@/components/institution/LessonGenerationModal";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCourse, updateCourseStatus } from "@/lib/courses.functions";
import { listEnrollments, removeEnrollment } from "@/lib/enrollments.functions";
import { updateLessonStatus } from "@/lib/lessons.functions";
import { requireInstitutionStaff } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/institution/courses/$courseId")({
  beforeLoad: (ctx) => requireInstitutionStaff(ctx.context),
  component: CourseDetailPage,
});

function CourseDetailPage() {
  const { courseId } = Route.useParams();
  const [tab, setTab] = useState("overview");
  const [genModalOpen, setGenModalOpen] = useState(false);
  const fn = useServerFn(getCourse);
  const q = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => fn({ data: { course_id: courseId } }),
  });

  if (q.isLoading)
    return (
      <InstitutionShell title="Course">
        <p className="text-muted-foreground">Loading…</p>
      </InstitutionShell>
    );
  if (!q.data?.course)
    return (
      <InstitutionShell title="Course">
        <p className="text-muted-foreground">Course not found.</p>
      </InstitutionShell>
    );

  const { course, lessons } = q.data;

  return (
    <InstitutionShell
      title={course.title}
      actions={
        <Link to="/institution/courses">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            All courses
          </Button>
        </Link>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="capitalize">
          {course.status}
        </Badge>
        {course.subject && <Badge variant="outline">{course.subject}</Badge>}
        {course.level && <Badge variant="outline">{course.level}</Badge>}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <BookOpen className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="lessons">
            <BookOpen className="h-4 w-4" />
            Lessons
          </TabsTrigger>
          <TabsTrigger value="materials">
            <FileText className="h-4 w-4" />
            Materials
          </TabsTrigger>
          <TabsTrigger value="enrollments">
            <Users className="h-4 w-4" />
            Enrollments
          </TabsTrigger>
          <TabsTrigger value="resources">
            <FolderUp className="h-4 w-4" />
            Resources
          </TabsTrigger>
          <TabsTrigger value="settings">
            <SettingsIcon className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Description
              </h3>
              <p className="mt-2">{course.description || "No description set."}</p>
            </CardContent>
          </Card>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Lessons" value={lessons.length} />
            <Stat
              label="Published lessons"
              value={lessons.filter((l: any) => l.status === "published").length}
            />
            <Stat
              label="Enrolled students"
              value={q.data.enrollments.filter((e: any) => e.status === "active").length}
            />
          </div>
        </TabsContent>

        <TabsContent value="lessons" className="mt-4 space-y-3">
          <div className="flex justify-end">
            <CreateLessonDialog courseId={courseId} />
          </div>
          {lessons.length === 0 ? (
            <p className="text-sm text-muted-foreground">No lessons yet.</p>
          ) : (
            lessons.map((l: any) => <LessonRow key={l.id} lesson={l} courseId={courseId} />)
          )}
        </TabsContent>

        <TabsContent value="materials" className="mt-4">
          <MaterialsTabContent
            courseId={courseId}
            institutionId={course.institution_id}
            onGenerateLessons={() => setGenModalOpen(true)}
          />
          <LessonGenerationModal
            courseId={courseId}
            courseTitle={course.title}
            isOpen={genModalOpen}
            onOpenChange={setGenModalOpen}
            onSuccess={() => {
              setGenModalOpen(false);
              setTab("lessons");
              q.refetch();
            }}
          />
        </TabsContent>

        <TabsContent value="enrollments" className="mt-4">
          <EnrollmentsTab courseId={courseId} />
        </TabsContent>

        <TabsContent value="resources" className="mt-4">
          <p className="text-sm text-muted-foreground">
            Use the{" "}
            <Link to="/institution/resources" className="underline">
              Resources library
            </Link>{" "}
            to upload and organize materials for this course.
          </p>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <CourseSettings courseId={courseId} currentStatus={course.status} />
        </TabsContent>
      </Tabs>
    </InstitutionShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function LessonRow({
  lesson,
  courseId,
}: {
  lesson: {
    id: string;
    title: string;
    status: string;
    duration_minutes: number | null;
    difficulty: string | null;
  };
  courseId: string;
}) {
  const qc = useQueryClient();
  const fn = useServerFn(updateLessonStatus);
  const m = useMutation({
    mutationFn: (status: "draft" | "published" | "archived") =>
      fn({ data: { lesson_id: lesson.id, status } }),
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["course", courseId] });
    },
  });
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div>
          <p className="font-medium">{lesson.title}</p>
          <p className="text-xs text-muted-foreground">
            {lesson.difficulty ?? "—"} · {lesson.duration_minutes ?? "?"} min
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="capitalize">
            {lesson.status}
          </Badge>
          {lesson.status === "draft" ? (
            <Button size="sm" variant="outline" onClick={() => m.mutate("published")}>
              Publish
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => m.mutate("draft")}>
              Unpublish
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EnrollmentsTab({ courseId }: { courseId: string }) {
  const fn = useServerFn(listEnrollments);
  const q = useQuery({
    queryKey: ["enrollments", courseId],
    queryFn: () => fn({ data: { course_id: courseId } }),
  });
  const qc = useQueryClient();
  const rmFn = useServerFn(removeEnrollment);
  const m = useMutation({
    mutationFn: (id: string) => rmFn({ data: { enrollment_id: id } }),
    onSuccess: () => {
      toast.success("Removed");
      qc.invalidateQueries({ queryKey: ["enrollments", courseId] });
      qc.invalidateQueries({ queryKey: ["course", courseId] });
    },
  });
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <EnrollStudentDialog courseId={courseId} />
      </div>
      {q.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (q.data?.enrollments ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">No enrollments yet.</p>
      ) : (
        q.data!.enrollments.map((e: any) => (
          <Card key={e.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">
                  {e.profile?.full_name || e.profile?.email || e.student_id.slice(0, 8)}
                </p>
                <p className="text-xs text-muted-foreground">{e.profile?.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {e.status}
                </Badge>
                {e.status === "active" && (
                  <Button size="sm" variant="ghost" onClick={() => m.mutate(e.id)}>
                    Remove
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function CourseSettings({ courseId, currentStatus }: { courseId: string; currentStatus: string }) {
  const qc = useQueryClient();
  const fn = useServerFn(updateCourseStatus);
  const m = useMutation({
    mutationFn: (status: "draft" | "published" | "archived") =>
      fn({ data: { course_id: courseId, status } }),
    onSuccess: () => {
      toast.success("Course updated");
      qc.invalidateQueries({ queryKey: ["course", courseId] });
    },
  });
  return (
    <Card>
      <CardContent className="space-y-3 p-6">
        <h3 className="font-semibold">Course status</h3>
        <p className="text-sm text-muted-foreground">
          Current:{" "}
          <Badge variant="secondary" className="capitalize">
            {currentStatus}
          </Badge>
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={currentStatus === "published"}
            onClick={() => m.mutate("published")}
          >
            Publish
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={currentStatus === "draft"}
            onClick={() => m.mutate("draft")}
          >
            Move to draft
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={currentStatus === "archived"}
            onClick={() => m.mutate("archived")}
          >
            Archive
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
