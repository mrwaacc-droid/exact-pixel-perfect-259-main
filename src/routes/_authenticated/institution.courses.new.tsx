import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, BookOpen, FileText, Plus, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { InstitutionShell } from "@/components/institution/InstitutionShell";
import { CreateCourseDialog } from "@/components/institution/CreateCourseDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getMyInstitutions } from "@/lib/institutions.functions";
import { requireInstitutionStaff } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/institution/courses/new")({
  beforeLoad: (ctx) => requireInstitutionStaff(ctx.context),
  component: NewInstitutionCoursePage,
});

function NewInstitutionCoursePage() {
  const myFn = useServerFn(getMyInstitutions);
  const my = useQuery({ queryKey: ["my-institutions"], queryFn: () => myFn() });
  const owned = my.data?.memberships?.[0];
  const institutionId = owned?.institution?.id;

  return (
    <InstitutionShell
      title="Create Course"
      actions={
        <Link to="/institution/courses">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            All courses
          </Button>
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="inline-flex rounded-2xl bg-crimson-soft p-3 text-[var(--crimson)]">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#191314]">Start a new course</h2>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                Create the course shell first, then add lessons, upload course materials, generate
                lessons from source files, and publish when the content is ready.
              </p>
            </div>

            {my.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading institution...</p>
            ) : institutionId ? (
              <CreateCourseDialog
                institutionId={institutionId}
                trigger={
                  <Button className="bg-[var(--crimson)] hover:bg-[var(--crimson-dark)]">
                    <Plus className="h-4 w-4" />
                    Create course
                  </Button>
                }
              />
            ) : (
              <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                No institution is attached to this account yet. Register an institution before
                creating courses.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-3">
          <WorkflowCard
            icon={<BookOpen className="h-4 w-4" />}
            title="1. Course details"
            text="Set title, subject, level, description, and draft or published status."
          />
          <WorkflowCard
            icon={<FileText className="h-4 w-4" />}
            title="2. Materials"
            text="Upload source content so lessons can be generated from the actual course material."
          />
          <WorkflowCard
            icon={<Sparkles className="h-4 w-4" />}
            title="3. Lessons"
            text="Create lessons manually or generate structured lessons from ready materials."
          />
        </div>
      </div>
    </InstitutionShell>
  );
}

function WorkflowCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-crimson-soft p-2 text-[var(--crimson)]">{icon}</div>
          <div>
            <h3 className="font-semibold text-[#191314]">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-[#8A7478]">{text}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
