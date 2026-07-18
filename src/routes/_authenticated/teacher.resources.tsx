import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { FileText, FolderUp, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shared/DashboardShell";
import { dashboardConfigs } from "@/lib/dashboard-config";
import { UploadResourceDialog } from "@/components/institution/UploadResourceDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMyInstitutions } from "@/lib/institutions.functions";
import { listResources } from "@/lib/resources.functions";
import { requireTeacher } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/teacher/resources")({
  beforeLoad: (ctx) => requireTeacher(ctx.context),
  component: TeacherResourcesPage,
});

const ICONS: Record<string, typeof FileText> = {
  pdf: FileText,
  text: FileText,
  image: ImageIcon,
  link: LinkIcon,
  video: FileText,
  audio: FileText,
  slides: FileText,
  document: FileText,
};

function TeacherResourcesPage() {
  const myFn = useServerFn(getMyInstitutions);
  const my = useQuery({ queryKey: ["my-institutions"], queryFn: () => myFn() });
  const institutionId = my.data?.memberships?.[0]?.institution?.id;

  const listFn = useServerFn(listResources);
  const q = useQuery({
    queryKey: ["resources", institutionId],
    queryFn: () => listFn({ data: { institution_id: institutionId! } }),
    enabled: !!institutionId,
  });

  const resources = q.data?.resources ?? [];

  return (
    <DashboardShell
      config={dashboardConfigs.teacher}
      activePath="/teacher/resources"
      title="Resources"
      subtitle="Your institution's shared library of teaching materials."
    >
      {institutionId && (
        <div className="mb-6 flex justify-end">
          <UploadResourceDialog
            institutionId={institutionId}
            trigger={<Button>Upload Resource</Button>}
          />
        </div>
      )}

      {!institutionId ? (
        my.isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <FolderUp className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <h2 className="mt-3 text-lg font-semibold">No shared resource library</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Resources appear here once you're part of an institution's teaching team.
            </p>
          </div>
        )
      ) : q.isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : resources.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <FolderUp className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <h2 className="mt-3 text-lg font-semibold">No resources yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload PDFs, notes, images, or links to build your library.
          </p>
          <div className="mt-6">
            <UploadResourceDialog institutionId={institutionId} />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((r: any) => {
            const Icon = ICONS[r.type] ?? FileText;
            return (
              <Card key={r.id}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold">{r.title}</h3>
                      <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">
                        {r.type}
                      </p>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {r.status}
                    </Badge>
                  </div>
                  {r.description && (
                    <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                      {r.description}
                    </p>
                  )}
                  {Array.isArray(r.tags) && r.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {(r.tags as string[]).map((t: any) => (
                        <Badge key={t} variant="outline" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
