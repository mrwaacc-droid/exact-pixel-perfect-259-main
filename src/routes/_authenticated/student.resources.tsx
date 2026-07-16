import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { StudentShell } from "@/components/student/StudentShell";
import { FileText, ExternalLink, Folder } from "lucide-react";
import { requireStudent } from "@/lib/route-guards";
import { getStudentResources } from "@/lib/student.functions";

export const Route = createFileRoute("/_authenticated/student/resources")({
  beforeLoad: (ctx) => requireStudent(ctx.context),
  component: StudentResources,
});

const TYPE_META: Record<string, { label: string; color: string }> = {
  pdf: { label: "PDF", color: "#dc2626" },
  document: { label: "Doc", color: "#7D2233" },
  slide: { label: "Slides", color: "#7c3aed" },
  image: { label: "Image", color: "#db2777" },
  link: { label: "Link", color: "#0891b2" },
  worksheet: { label: "Worksheet", color: "#16a34a" },
  syllabus: { label: "Syllabus", color: "#ea580c" },
  text: { label: "Text", color: "var(--muted)" },
};

function StudentResources() {
  const fn = useServerFn(getStudentResources);
  const q = useQuery({ queryKey: ["student-resources"], queryFn: () => fn() });
  const resources = q.data?.resources ?? [];

  return (
    <StudentShell title="Resources">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {q.isLoading ? (
          <p className="text-sm text-[var(--gray-500)]">Loading resources…</p>
        ) : resources.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--gray-200)] bg-white p-10 text-center md:col-span-2 xl:col-span-3">
            <Folder className="mx-auto mb-2 h-8 w-8 text-[var(--gray-400)]" />
            <p className="text-sm font-semibold text-[var(--gray-900)]">No resources yet</p>
            <p className="mt-1 text-sm text-[var(--gray-500)]">
              Resources shared by your instructors will appear here.
            </p>
          </div>
        ) : (
          resources.map((r: any) => {
            const meta = TYPE_META[r.type] ?? TYPE_META.text;
            const url = r.linkUrl ?? r.fileUrl;
            return (
              <a
                key={r.id}
                href={url || "#"}
                target={url ? "_blank" : undefined}
                rel="noreferrer"
                className="kr-pcard block p-5 transition hover:border-[var(--primary)] hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                    style={{ background: `${meta.color}1a`, color: meta.color }}
                  >
                    {meta.label}
                  </span>
                  {url && <ExternalLink className="h-3.5 w-3.5 text-[var(--gray-400)]" />}
                </div>
                <div className="mt-3 flex items-start gap-2">
                  <FileText className="mt-0.5 h-4 w-4 text-[var(--primary)]" />
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-[var(--gray-900)]">{r.title}</h3>
                    <p className="truncate text-xs text-[var(--gray-500)]">{r.courseTitle}</p>
                  </div>
                </div>
              </a>
            );
          })
        )}
      </div>
    </StudentShell>
  );
}
