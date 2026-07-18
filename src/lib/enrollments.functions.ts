import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Aggregate enrollment counts per course, for an institution's "Enrollments" overview. */
export const listInstitutionEnrollmentSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: { institution_id: string }) => data)
  .handler(async ({ data, context }: any) => {
    const { data: courses, error: cErr } = await context.supabase
      .from("courses")
      .select("id, title, status, price_usd")
      .eq("institution_id", data.institution_id)
      .order("created_at", { ascending: false });
    if (cErr) throw new Error(cErr.message);
    const courseIds = (courses ?? []).map((c: any) => c.id);
    if (courseIds.length === 0) return { courses: [] };

    const { data: enrollments, error: eErr } = await context.supabase
      .from("course_enrollments")
      .select("course_id, status")
      .in("course_id", courseIds);
    if (eErr) throw new Error(eErr.message);

    const counts = new Map<string, { active: number; total: number }>();
    for (const e of enrollments ?? []) {
      const bucket = counts.get(e.course_id) ?? { active: 0, total: 0 };
      bucket.total += 1;
      if (e.status === "active" || e.status === "completed") bucket.active += 1;
      counts.set(e.course_id, bucket);
    }

    return {
      courses: (courses ?? []).map((c: any) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        priceUsd: Number(c.price_usd ?? 0),
        activeEnrollments: counts.get(c.id)?.active ?? 0,
        totalEnrollments: counts.get(c.id)?.total ?? 0,
      })),
    };
  });

export const listEnrollments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: { course_id: string }) => data)
  .handler(async ({ data, context }: any) => {
    const { data: rows, error } = await context.supabase
      .from("course_enrollments")
      .select("id, student_id, status, enrolled_at, completed_at")
      .eq("course_id", data.course_id)
      .order("enrolled_at", { ascending: false });
    if (error) throw new Error(error.message);
    const ids = (rows ?? []).map((r: any) => r.student_id);
    let profiles: Record<string, { full_name: string | null; email: string | null }> = {};
    if (ids.length) {
      const { data: profs } = await context.supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", ids);
      profiles = Object.fromEntries(
        (profs ?? []).map((p: any) => [p.id, { full_name: p.full_name, email: p.email }]),
      );
    }
    return {
      enrollments: (rows ?? []).map((r: any) => ({
        ...r,
        profile: profiles[r.student_id] ?? null,
      })),
    };
  });

export const enrollStudent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        course_id: z.string().uuid(),
        email: z.string().email(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }: any) => {
    const { data: course, error: cErr } = await context.supabase
      .from("courses")
      .select("id, institution_id")
      .eq("id", data.course_id)
      .single();
    if (cErr) throw new Error(cErr.message);

    const { data: profile, error: pErr } = await context.supabase
      .from("profiles")
      .select("id")
      .eq("email", data.email)
      .maybeSingle();
    if (pErr) throw new Error(pErr.message);
    if (!profile) throw new Error("No registered user with that email. Ask them to sign up first.");

    const { error } = await context.supabase.from("course_enrollments").insert({
      institution_id: course.institution_id,
      course_id: course.id,
      student_id: profile.id,
      status: "active",
      enrolled_by: context.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeEnrollment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ enrollment_id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }: any) => {
    const { error } = await context.supabase
      .from("course_enrollments")
      .update({ status: "removed" })
      .eq("id", data.enrollment_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
