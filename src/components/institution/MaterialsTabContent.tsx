import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Trash2, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { listCourseMaterials, deleteCourseMaterial } from "@/lib/course-materials.functions";
import { MaterialUploadDialog } from "./MaterialUploadDialog";

interface MaterialsTabContentProps {
  courseId: string;
  institutionId: string;
  onGenerateLessons?: () => void;
}

export function MaterialsTabContent({
  courseId,
  institutionId,
  onGenerateLessons,
}: MaterialsTabContentProps) {
  const listFn = useServerFn(listCourseMaterials);
  const deleteFn = useServerFn(deleteCourseMaterial);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["course_materials", courseId],
    queryFn: () => listFn({ data: { course_id: courseId } }),
  });

  const materials = data?.materials ?? [];
  const readyCount = materials.filter((m: any) => m.processing_status === "ready").length;

  const handleDelete = async (materialId: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    try {
      await deleteFn({ data: { material_id: materialId } });
      toast.success("Material deleted");
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">
            <CheckCircle2 className="h-3 w-3" />
            Ready
          </div>
        );
      case "processing":
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs font-medium">
            <Clock className="h-3 w-3 animate-spin" />
            Processing
          </div>
        );
      case "failed":
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium">
            <AlertCircle className="h-3 w-3" />
            Failed
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-700 rounded text-xs font-medium">
            {status}
          </div>
        );
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading materials...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header with Upload Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Course Materials</h3>
          <p className="text-sm text-muted-foreground">{materials.length} material(s) uploaded</p>
        </div>
        <MaterialUploadDialog
          courseId={courseId}
          onSuccess={() => {
            refetch();
          }}
        />
      </div>

      {/* Materials List */}
      {materials.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <p className="text-muted-foreground">No materials uploaded yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Upload course materials to generate lessons
          </p>
        </div>
      ) : (
        <div className="space-y-2 border rounded-lg divide-y">
          {materials.map((material: any) => (
            <div
              key={material.id}
              className="p-4 flex items-start justify-between hover:bg-muted/30 transition"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <h4 className="font-medium truncate">{material.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{material.type}</span>
                      {getStatusBadge(material.processing_status)}
                    </div>
                    {material.processing_status === "failed" && material.processing_error && (
                      <p className="text-xs text-red-600 mt-1">{material.processing_error}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {material.file_url && `File: ${material.file_url}`}
                      {material.link_url && `Link: ${material.link_url}`}
                      {!material.file_url && !material.link_url && "Text content"}
                    </p>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(material.id, material.title)}
                className="ml-2 flex-shrink-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Generate Lessons CTA */}
      {readyCount > 0 && (
        <div className="mt-6 p-4 bg-[#F7E7EA] border border-[#F7E7EA] rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-[#191314]">Ready to Generate Lessons</h4>
              <p className="text-sm text-[#521326] mt-1">
                You have {readyCount} material(s) ready. Generate AI-powered lessons from them.
              </p>
            </div>
            <Button
              className="ml-3 flex-shrink-0 bg-[#7D2233] hover:bg-[#521326] text-white"
              onClick={onGenerateLessons}
            >
              Generate Lessons
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
