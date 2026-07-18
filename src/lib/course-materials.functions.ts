import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ─────────────────────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────────────────────

const UploadSchema = z.object({
  course_id: z.string().uuid(),
  title: z.string().trim().min(1).max(255),
  type: z.enum(["pdf", "document", "slide", "image", "text", "link", "worksheet", "syllabus"]),
  file_url: z.string().url().optional(),
  link_url: z.string().url().optional(),
  extracted_text: z.string().max(100000).optional(),
  syllabus_reference: z.string().max(255).optional(),
  material_role: z
    .enum(["teacher_guide", "learner_book", "reference_text", "syllabus", "institution_excerpt", "other"])
    .optional(),
  book_title: z.string().trim().max(255).optional(),
  publisher: z.string().trim().max(160).optional(),
  edition_year: z.string().trim().max(40).optional(),
  material_rights_status: z
    .enum(["licensed", "institution_provided", "public_domain", "metadata_only", "pending_review"])
    .default("institution_provided"),
  rights_notes: z.string().trim().max(1000).optional(),
  curriculum_metadata: z.record(z.string(), z.unknown()).optional(),
  /** Real images extracted from the uploaded file (e.g. PDF pages with diagrams/photos). */
  images: z
    .array(
      z.object({
        url: z.string().url(),
        caption: z.string().max(300).optional(),
        extracted_context: z.string().max(2000).optional(),
      }),
    )
    .max(10)
    .optional(),
});

const UpdateStatusSchema = z.object({
  material_id: z.string().uuid(),
  processing_status: z.enum(["pending", "processing", "ready", "failed"]),
  processing_error: z.string().max(500).optional(),
});

const DeleteSchema = z.object({
  material_id: z.string().uuid(),
});

const ListSchema = z.object({
  course_id: z.string().uuid(),
});

async function canManageCourseMaterials(context: any, institutionId: string) {
  const { data: member } = await context.supabase
    .from("institution_members")
    .select("role")
    .eq("institution_id", institutionId)
    .eq("user_id", context.userId)
    .maybeSingle();

  if (member && ["owner", "admin", "teacher"].includes(member.role)) return true;

  const { data: profile } = await context.supabase
    .from("profiles")
    .select("role")
    .eq("id", context.userId)
    .maybeSingle();

  return profile?.role === "platform_admin";
}

// ─────────────────────────────────────────────────────────────────────────────
// Upload Material
// ─────────────────────────────────────────────────────────────────────────────

export const uploadCourseMaterial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => UploadSchema.parse(data))
  .handler(async ({ data, context }: any) => {
    // Verify user is admin/teacher of the course's institution
    const { data: course, error: courseErr } = await context.supabase
      .from("courses")
      .select("institution_id")
      .eq("id", data.course_id)
      .single();

    if (courseErr) throw new Error(`Course not found: ${courseErr.message}`);

    if (!(await canManageCourseMaterials(context, course.institution_id))) {
      throw new Error("Not authorized to upload materials for this course");
    }

    const hasSourceText = Boolean(data.extracted_text?.trim());
    if (hasSourceText && data.material_rights_status === "metadata_only") {
      throw new Error("Metadata-only materials cannot include extracted source text.");
    }

    // Insert material
    const { data: material, error: insertErr } = await context.supabase
      .from("course_materials")
      .insert({
        institution_id: course.institution_id,
        course_id: data.course_id,
        title: data.title,
        type: data.type,
        file_url: data.file_url || null,
        link_url: data.link_url || null,
        extracted_text: data.extracted_text || null,
        syllabus_reference: data.syllabus_reference || null,
        material_role: data.material_role || null,
        book_title: data.book_title || null,
        publisher: data.publisher || null,
        edition_year: data.edition_year || null,
        material_rights_status: data.material_rights_status,
        rights_notes: data.rights_notes || null,
        curriculum_metadata: data.curriculum_metadata || {},
        processing_status: "ready", // For Phase 1, assume ready (no extraction pipeline yet)
        processing_error: null,
        uploaded_by: context.userId,
      })
      .select("id, processing_status, title")
      .single();

    if (insertErr) throw new Error(`Upload failed: ${insertErr.message}`);

    if (data.images?.length) {
      const { error: imagesErr } = await context.supabase.from("material_images").insert(
        data.images.map((img: { url: string; caption?: string; extracted_context?: string }) => ({
          institution_id: course.institution_id,
          course_id: data.course_id,
          course_material_id: material.id,
          image_url: img.url,
          caption: img.caption || null,
          extracted_context: img.extracted_context || null,
        })),
      );
      // Don't fail the whole upload over image persistence — the material
      // and its text are already saved, which is what generation needs most.
      if (imagesErr) console.warn(`[course-materials] Failed to save material images: ${imagesErr.message}`);
    }

    return {
      success: true,
      materialId: material.id,
      title: material.title,
      processingStatus: material.processing_status,
      message: "Material uploaded successfully",
    };
  });

// ─────────────────────────────────────────────────────────────────────────────
// List Course Materials
// ─────────────────────────────────────────────────────────────────────────────

export const listCourseMaterials = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => ListSchema.parse(data))
  .handler(async ({ data, context }: any) => {
    const { data: materials, error } = await context.supabase
      .from("course_materials")
      .select(
        "id, title, type, processing_status, processing_error, file_url, link_url, created_at, uploaded_by, syllabus_reference, material_role, book_title, publisher, edition_year, material_rights_status, rights_notes, curriculum_metadata",
      )
      .eq("course_id", data.course_id)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return {
      materials: materials ?? [],
      count: materials?.length ?? 0,
    };
  });

// ─────────────────────────────────────────────────────────────────────────────
// Get Material Detail
// ─────────────────────────────────────────────────────────────────────────────

export const getCourseMaterial = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: { material_id: string }) =>
    z.object({ material_id: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }: any) => {
    const { data: material, error } = await context.supabase
      .from("course_materials")
      .select("*")
      .eq("id", data.material_id)
      .single();

    if (error) throw new Error(error.message);
    return { material };
  });

// ─────────────────────────────────────────────────────────────────────────────
// Update Material Status (for processing pipeline)
// ─────────────────────────────────────────────────────────────────────────────

export const updateMaterialStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => UpdateStatusSchema.parse(data))
  .handler(async ({ data, context }: any) => {
    const { error } = await context.supabase
      .from("course_materials")
      .update({
        processing_status: data.processing_status,
        processing_error: data.processing_error || null,
      })
      .eq("id", data.material_id);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ─────────────────────────────────────────────────────────────────────────────
// Delete Material
// ─────────────────────────────────────────────────────────────────────────────

export const deleteCourseMaterial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => DeleteSchema.parse(data))
  .handler(async ({ data, context }: any) => {
    // Get material to verify ownership
    const { data: material, error: getErr } = await context.supabase
      .from("course_materials")
      .select("id, course_id, courses(institution_id)")
      .eq("id", data.material_id)
      .single();

    if (getErr) throw new Error(getErr.message);

    // Verify authorization
    if (!(await canManageCourseMaterials(context, (material.courses as any).institution_id))) {
      throw new Error("Not authorized to delete this material");
    }

    // Delete material_images first (cascade)
    await context.supabase
      .from("material_images")
      .delete()
      .eq("course_material_id", data.material_id);

    // Delete material
    const { error: deleteErr } = await context.supabase
      .from("course_materials")
      .delete()
      .eq("id", data.material_id);

    if (deleteErr) throw new Error(deleteErr.message);
    return { ok: true, message: "Material deleted successfully" };
  });

// ─────────────────────────────────────────────────────────────────────────────
// Get Total Text from All Ready Materials (for lesson generation context)
// ─────────────────────────────────────────────────────────────────────────────

export const getCourseMateriaisText = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => ListSchema.parse(data))
  .handler(async ({ data, context }: any) => {
    const { data: materials, error } = await context.supabase
      .from("course_materials")
      .select(
        "title, extracted_text, type, processing_status, syllabus_reference, material_role, book_title, publisher, edition_year, material_rights_status",
      )
      .eq("course_id", data.course_id)
      .eq("processing_status", "ready")
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);

    const combinedText = materials
      ?.map((m: any) => {
        const book = m.book_title ? ` | book: ${m.book_title}` : "";
        const publisher = m.publisher ? ` | publisher: ${m.publisher}` : "";
        const syllabus = m.syllabus_reference ? ` | syllabus: ${m.syllabus_reference}` : "";
        const role = m.material_role ? ` | role: ${m.material_role}` : "";
        const rights = m.material_rights_status ? ` | rights: ${m.material_rights_status}` : "";
        const header = `[${m.title} - ${m.type}${role}${book}${publisher}${syllabus}${rights}]`;
        const content = m.extracted_text || "(No text extracted)";
        return `${header}\n${content}`;
      })
      .join("\n\n");

    return {
      combinedText: combinedText || "",
      materialCount: materials?.length ?? 0,
      materialsList:
        materials?.map((m: any) => ({
          title: m.title,
          type: m.type,
          materialRole: m.material_role ?? null,
          bookTitle: m.book_title ?? null,
          publisher: m.publisher ?? null,
          editionYear: m.edition_year ?? null,
          syllabusReference: m.syllabus_reference ?? null,
          materialRightsStatus: m.material_rights_status ?? null,
        })) ?? [],
    };
  });
