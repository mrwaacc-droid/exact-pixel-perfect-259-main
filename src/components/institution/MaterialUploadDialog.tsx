import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { uploadCourseMaterial } from "@/lib/course-materials.functions";
import { supabase } from "@/integrations/supabase/client";

const MATERIAL_TYPES = [
  { value: "pdf", label: "PDF Document" },
  { value: "document", label: "Word/Text Document" },
  { value: "slide", label: "Presentation/Slides" },
  { value: "image", label: "Image" },
  { value: "text", label: "Plain Text" },
  { value: "link", label: "External Link" },
  { value: "worksheet", label: "Worksheet" },
  { value: "syllabus", label: "Syllabus" },
];

interface MaterialUploadDialogProps {
  courseId: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (materialId: string, title: string) => void;
}

export function MaterialUploadDialog({
  courseId,
  isOpen: controlledOpen,
  onOpenChange,
  onSuccess,
}: MaterialUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : open;
  const handleOpenChange = onOpenChange || setOpen;

  const [uploadMethod, setUploadMethod] = useState<"file" | "text" | "link">("file");
  const [form, setForm] = useState({
    title: "",
    type: "",
    file: null as File | null,
    text: "",
    link: "",
    syllabusRef: "",
  });

  const qc = useQueryClient();
  const fn = useServerFn(uploadCourseMaterial);
  const m = useMutation({
    mutationFn: async () => {
      let fileUrl: string | undefined;
      let linkUrl: string | undefined;
      let extractedText: string | undefined;
      let images: { url: string; caption?: string; extracted_context?: string }[] = [];

      if (uploadMethod === "file" && form.file) {
        const file = form.file;

        // Pull the text out of the file so lesson generation can ground on it.
        // Loaded lazily: the pdf parser is heavy and browser-only.
        const pdfExtract = await import("@/lib/pdf-extract").catch(() => null);
        if (pdfExtract) {
          try {
            extractedText = (await pdfExtract.extractMaterialText(file)) ?? undefined;
          } catch {
            extractedText = undefined;
          }

          // Also pull real diagrams/photos already embedded in the PDF so
          // lessons can illustrate with the actual course content first.
          // Isolated from the text-extraction try/catch above so an image
          // failure never discards already-extracted text.
          try {
            const pageImages = await pdfExtract.extractPdfPageImages(file);
            const uploaded = await Promise.all(
              pageImages.map(async (pageImage) => {
                const imagePath = `${courseId}/material-images/${crypto.randomUUID()}.png`;
                const { error: imgErr } = await supabase.storage
                  .from("resources")
                  .upload(imagePath, pageImage.blob, { contentType: "image/png" });
                if (imgErr) return null;
                // Long-lived signed URL — the "resources" bucket is private,
                // and material_images.image_url is read directly by the
                // classroom UI, not re-signed at read time.
                const { data: signed } = await supabase.storage
                  .from("resources")
                  .createSignedUrl(imagePath, 60 * 60 * 24 * 365 * 10);
                if (!signed?.signedUrl) return null;
                return {
                  url: signed.signedUrl,
                  caption: `Page ${pageImage.pageNumber}`,
                  extracted_context: pageImage.captionText || undefined,
                };
              }),
            );
            images = uploaded.flatMap((img) => (img ? [img] : []));
          } catch {
            images = [];
          }
        }

        // Store the original file; extraction failure alone shouldn't block upload.
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${courseId}/${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from("resources")
          .upload(path, file);
        if (uploadError && !extractedText) {
          throw new Error(
            `Could not store the file (${uploadError.message}). ` +
              "Try again, or paste the content using the Text tab.",
          );
        }
        fileUrl = uploadError ? undefined : path;
      } else if (uploadMethod === "text") {
        extractedText = form.text;
      } else if (uploadMethod === "link") {
        linkUrl = form.link;
      }

      return fn({
        data: {
          course_id: courseId,
          title: form.title,
          type: form.type as any,
          file_url: fileUrl,
          link_url: linkUrl,
          extracted_text: extractedText,
          syllabus_reference: form.syllabusRef || undefined,
          images: images.length ? images : undefined,
        },
      });
    },
    onSuccess: (result) => {
      toast.success("Material uploaded successfully");
      qc.invalidateQueries({ queryKey: ["course_materials", courseId] });
      handleOpenChange(false);
      setForm({ title: "", type: "", file: null, text: "", link: "", syllabusRef: "" });
      setUploadMethod("file");
      onSuccess?.(result.materialId, result.title);
    },
    onError: (e: Error) => {
      toast.error(`Upload failed: ${e.message}`);
    },
  });

  const isFormValid =
    form.title &&
    form.type &&
    (uploadMethod === "file" ? form.file : uploadMethod === "text" ? form.text : form.link);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Upload Material
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Course Material</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Material Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Chapter 3: Quadratic Equations"
              maxLength={255}
            />
            <p className="text-xs text-muted-foreground mt-1">{form.title.length}/255</p>
          </div>

          {/* Material Type */}
          <div>
            <Label htmlFor="type">Material Type *</Label>
            <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val })}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select material type" />
              </SelectTrigger>
              <SelectContent>
                {MATERIAL_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Upload Method Tabs */}
          <div>
            <Label>Content Source</Label>
            <Tabs value={uploadMethod} onValueChange={(val) => setUploadMethod(val as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="file">Upload File</TabsTrigger>
                <TabsTrigger value="text">Paste Text</TabsTrigger>
                <TabsTrigger value="link">Add Link</TabsTrigger>
              </TabsList>

              <TabsContent value="file" className="space-y-3 mt-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}
                    accept=".pdf,.doc,.docx,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="text-muted-foreground">
                      <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs mt-1">PDF, Word, PowerPoint, Excel, Image, etc.</p>
                    </div>
                  </label>
                  {form.file && (
                    <div className="mt-4 p-3 bg-[#F7E7EA] rounded flex items-center justify-between">
                      <span className="text-sm text-[#191314] truncate">{form.file.name}</span>
                      <button
                        onClick={() => setForm({ ...form, file: null })}
                        className="text-[#7D2233] hover:text-[#521326]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="text" className="space-y-3 mt-4">
                <Textarea
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  placeholder="Paste or type the course material text here..."
                  className="min-h-48"
                  maxLength={100000}
                />
                <p className="text-xs text-muted-foreground">
                  {form.text.length}/100000 characters
                </p>
              </TabsContent>

              <TabsContent value="link" className="space-y-3 mt-4">
                <Input
                  type="url"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="https://example.com/material"
                />
                <p className="text-xs text-muted-foreground">
                  Link to external resource (Google Drive, YouTube, etc.)
                </p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Syllabus Reference (Optional) */}
          <div>
            <Label htmlFor="syllabus">Syllabus Reference (Optional)</Label>
            <Input
              id="syllabus"
              value={form.syllabusRef}
              onChange={(e) => setForm({ ...form, syllabusRef: e.target.value })}
              placeholder="e.g., Week 3, Module 2.1"
              maxLength={255}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => m.mutate()} disabled={!isFormValid || m.isPending}>
            {m.isPending ? "Uploading..." : "Upload Material"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
