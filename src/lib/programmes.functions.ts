import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listInstitutionProgrammes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: { institution_id: string }) =>
    z.object({ institution_id: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }: any) => {
    if (!context.supabase) return { programmes: [] };
    const { data: rows, error } = await context.supabase
      .from("programmes")
      .select(
        "id, title, description, subject_area, level, grade, status, timeline_weeks, created_at",
      )
      .eq("institution_id", data.institution_id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const programmeIds = (rows ?? []).map((p: any) => p.id);
    const courseCounts = new Map<string, number>();
    if (programmeIds.length) {
      const { data: courses } = await context.supabase
        .from("courses")
        .select("programme_id")
        .in("programme_id", programmeIds);
      for (const c of courses ?? []) {
        if (!c.programme_id) continue;
        courseCounts.set(c.programme_id, (courseCounts.get(c.programme_id) ?? 0) + 1);
      }
    }

    return {
      programmes: (rows ?? []).map((p: any) => ({
        ...p,
        courseCount: courseCounts.get(p.id) ?? 0,
      })),
    };
  });

const CreateProgrammeSchema = z.object({
  institution_id: z.string().uuid(),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).optional(),
  subject_area: z.string().trim().max(120).optional(),
  level: z.string().trim().max(80).optional(),
  grade: z.coerce.number().int().min(1).max(20).optional(),
  timeline_weeks: z.coerce.number().int().min(1).max(260).optional(),
});

export const createProgramme = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => CreateProgrammeSchema.parse(data))
  .handler(async ({ data, context }: any) => {
    const { data: row, error } = await context.supabase
      .from("programmes")
      .insert({
        institution_id: data.institution_id,
        title: data.title,
        description: data.description ?? null,
        subject_area: data.subject_area ?? null,
        level: data.level ?? null,
        grade: data.grade ?? null,
        timeline_weeks: data.timeline_weeks ?? null,
        status: "active",
        created_by: context.userId,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return { programme: row };
  });

export const updateProgrammeStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        programme_id: z.string().uuid(),
        status: z.enum(["active", "archived"]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }: any) => {
    const { error } = await context.supabase
      .from("programmes")
      .update({ status: data.status })
      .eq("id", data.programme_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
