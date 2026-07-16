/**
 * admin.functions.ts
 *
 * Platform-wide administration server functions.
 *
 * These power the Platform Admin dashboard sections (Users, Institutions,
 * Programmes, Materials, Lesson Generation, Realtime, Usage, Support, Activity,
 * Audit Logs, System Health, AI Settings, Plans, Settings).
 *
 * Design notes:
 * - All reads use the service-role `supabaseAdmin` client so platform admins
 *   can see across every institution (RLS is bypassed for trusted server use).
 * - Each function asserts the caller is a `platform_admin` before serving data.
 * - In demo mode (Supabase not configured), functions return safe empty/zero
 *   payloads so the dashboards still render for exploration.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { KENYAN_CBC_SUBJECT_MATRIX } from "@/lib/kenyan-cbc-curriculum";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const FALLBACK_CURRENCY = "USD";

function toMinorUnits(amount: unknown): number {
  if (amount === null || amount === undefined) return 0;
  const parsed = typeof amount === "string" ? Number(amount) : amount;
  if (typeof parsed !== "number" || !Number.isFinite(parsed)) return 0;
  return Math.round(parsed);
}

function normalizeCurrency(input?: string | null): string {
  return (input || FALLBACK_CURRENCY).toUpperCase();
}

function safeRows<T = any>(result: { data: T[] | null; error: any }): T[] {
  if (result.error) return [];
  return (result.data ?? []) as T[];
}

function compactStatus(status: string | null | undefined): string {
  if (!status) return "Draft";
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Assert the caller is a platform admin. Throws if not.
 * Reads the profile role via the authenticated (RLS) client.
 */
async function assertPlatformAdmin(context: any): Promise<void> {
  if (!context?.userId) {
    throw new Error("Authentication required.");
  }
  // Demo-mode callers (platform_admin) are allowed through.
  if (!isSupabaseConfigured()) return;

  const supabase = context.supabase;
  if (supabase) {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (data?.role !== "platform_admin") {
      throw new Error("Platform admin access required.");
    }
  }
}

async function getAdminClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

const demoEmpty = {
  rows: [],
  total: 0,
};

// ─────────────────────────────────────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────────────────────────────────────

export const listPlatformUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: { search?: string; role?: string; limit?: number } = {}) => data)
  .handler(async ({ data, context }: any) => {
    await assertPlatformAdmin(context);
    if (!isSupabaseConfigured()) {
      return { ...demoEmpty, roleBreakdown: {} };
    }
    const admin = await getAdminClient();
    const limit = Math.min(Math.max(data.limit ?? 100, 1), 300);

    let query = admin
      .from("profiles")
      .select("id, full_name, email, role, teacher_type, learner_type, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (data.role) query = query.eq("role", data.role);
    if (data.search) {
      query = query.or(`full_name.ilike.%${data.search}%,email.ilike.%${data.search}%`);
    }

    const [usersRes, countRes, roleRes] = await Promise.all([
      query,
      admin.from("profiles").select("id", { count: "exact", head: true }),
      admin.from("profiles").select("role"),
    ]);

    const roleBreakdown: Record<string, number> = {};
    for (const row of safeRows<any>(roleRes)) {
      const key = row.role ?? "unknown";
      roleBreakdown[key] = (roleBreakdown[key] ?? 0) + 1;
    }

    return {
      rows: safeRows<any>(usersRes).map((u) => ({
        id: u.id,
        fullName: u.full_name ?? "Unnamed",
        email: u.email ?? "—",
        role: u.role ?? "unknown",
        teacherType: u.teacher_type ?? null,
        learnerType: u.learner_type ?? null,
        createdAt: u.created_at ?? null,
      })),
      total: countRes.count ?? 0,
      roleBreakdown,
    };
  });

// ─────────────────────────────────────────────────────────────────────────────
// Institutions
// ─────────────────────────────────────────────────────────────────────────────

export const listPlatformInstitutions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: { search?: string; status?: string; limit?: number } = {}) => data)
  .handler(async ({ data, context }: any) => {
    await assertPlatformAdmin(context);
    if (!isSupabaseConfigured()) return demoEmpty;

    const admin = await getAdminClient();
    const limit = Math.min(Math.max(data.limit ?? 100, 1), 300);

    let query = admin
      .from("institutions")
      .select("id, name, status, created_at, country, plan")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (data.status) query = query.eq("status", data.status);
    if (data.search) query = query.ilike("name", `%${data.search}%`);

    const [instRes, countRes] = await Promise.all([
      query,
      admin.from("institutions").select("id", { count: "exact", head: true }),
    ]);

    const institutions = safeRows<any>(instRes);
    const instIds = institutions.map((i) => i.id);

    const memberCounts = new Map<string, number>();
    const subByInst = new Map<string, any>();
    if (instIds.length) {
      const [membersRes, subsRes] = await Promise.all([
        admin
          .from("institution_members")
          .select("institution_id")
          .in("institution_id", instIds)
          .eq("status", "active"),
        admin
          .from("institution_subscriptions")
          .select("institution_id, plan_slug, status, current_period_end")
          .in("institution_id", instIds),
      ]);
      for (const m of safeRows<any>(membersRes)) {
        memberCounts.set(m.institution_id, (memberCounts.get(m.institution_id) ?? 0) + 1);
      }
      for (const s of safeRows<any>(subsRes)) {
        if (!subByInst.has(s.institution_id)) subByInst.set(s.institution_id, s);
      }
    }

    return {
      rows: institutions.map((i) => ({
        id: i.id,
        name: i.name ?? "Unnamed",
        status: i.status ?? "active",
        country: i.country ?? null,
        plan: i.plan ?? null,
        createdAt: i.created_at ?? null,
        members: memberCounts.get(i.id) ?? 0,
        subscription: subByInst.get(i.id) ?? null,
      })),
      total: countRes.count ?? 0,
    };
  });

// ─────────────────────────────────────────────────────────────────────────────
// Programmes
// ─────────────────────────────────────────────────────────────────────────────

export const listPlatformProgrammes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: { limit?: number } = {}) => data)
  .handler(async ({ data, context }: any) => {
    await assertPlatformAdmin(context);
    if (!isSupabaseConfigured()) return demoEmpty;

    const admin = await getAdminClient();
    const limit = Math.min(Math.max(data.limit ?? 100, 1), 300);

    const [progRes, countRes] = await Promise.all([
      admin
        .from("programmes")
        .select("id, name, description, institution_id, status, created_at")
        .order("created_at", { ascending: false })
        .limit(limit),
      admin.from("programmes").select("id", { count: "exact", head: true }),
    ]);

    return {
      rows: safeRows<any>(progRes).map((p) => ({
        id: p.id,
        name: p.name ?? p.title ?? "Untitled",
        description: p.description ?? null,
        institutionId: p.institution_id ?? null,
        status: p.status ?? "active",
        createdAt: p.created_at ?? null,
      })),
      total: countRes.count ?? 0,
    };
  });

// ─────────────────────────────────────────────────────────────────────────────
// Courses (all DB-backed courses across institutions)
// ─────────────────────────────────────────────────────────────────────────────

export const listPlatformCourses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: { search?: string; status?: string; limit?: number } = {}) => data)
  .handler(async ({ data, context }: any) => {
    await assertPlatformAdmin(context);
    if (!isSupabaseConfigured()) return demoEmpty;

    const admin = await getAdminClient();
    const limit = Math.min(Math.max(data.limit ?? 100, 1), 300);

    let query = admin
      .from("courses")
      .select(
        "id, title, subject, level, status, institution_id, programme_id, source_type, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (data.status) query = query.eq("status", data.status);
    if (data.search) query = query.ilike("title", `%${data.search}%`);

    const [coursesRes, countRes] = await Promise.all([
      query,
      admin.from("courses").select("id", { count: "exact", head: true }),
    ]);

    // Resolve institution + programme names for richer rows.
    const courses = safeRows<any>(coursesRes);
    const instIds = Array.from(new Set(courses.map((c) => c.institution_id).filter(Boolean)));
    const progIds = Array.from(new Set(courses.map((c) => c.programme_id).filter(Boolean)));

    const nameByInst = new Map<string, string>();
    const nameByProg = new Map<string, string>();
    if (instIds.length) {
      const instRes = await admin.from("institutions").select("id, name").in("id", instIds);
      for (const i of safeRows<any>(instRes)) nameByInst.set(i.id, i.name ?? "Institution");
    }
    if (progIds.length) {
      const progRes = await admin.from("programmes").select("id, name").in("id", progIds);
      for (const p of safeRows<any>(progRes)) nameByProg.set(p.id, p.name ?? "Programme");
    }

    return {
      rows: courses.map((c) => ({
        id: c.id,
        title: c.title ?? "Untitled",
        subject: c.subject ?? null,
        level: c.level ?? null,
        status: compactStatus(c.status),
        institutionId: c.institution_id ?? null,
        institutionName: c.institution_id ? (nameByInst.get(c.institution_id) ?? null) : null,
        programmeId: c.programme_id ?? null,
        programmeName: c.programme_id ? (nameByProg.get(c.programme_id) ?? null) : null,
        sourceType: c.source_type ?? null,
        createdAt: c.created_at ?? null,
      })),
      total: countRes.count ?? 0,
    };
  });

export const listKingpinKenyanCbcRollout = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: { grade?: number } = {}) => data)
  .handler(async ({ data, context }: any) => {
    await assertPlatformAdmin(context);

    const fallbackRows = KENYAN_CBC_SUBJECT_MATRIX.filter(
      (row) => !data.grade || row.grade === data.grade,
    ).map((row) => ({
      grade: row.grade,
      subject: row.subject,
      subjectSlug: row.slug,
      programmeId: null,
      courseId: null,
      courseSlug: `kenyan-cbc-grade-${row.grade}-${row.slug}`,
      courseStatus: "draft",
      materialCount: 0,
      usableMaterialCount: 0,
      bookMetadataCount: 0,
      lessonCount: 0,
      publishedLessonCount: 0,
      scopeCount: 0,
      coveredScopeCount: 0,
      sectionCount: 0,
      teachingItemCount: 0,
      detailedLessonCount: 0,
      hasCourseShell: false,
      hasUsableMaterial: false,
      hasDraftLessons: false,
      hasDetailedLessons: false,
      readyForPublishReview: false,
    }));

    if (!isSupabaseConfigured()) {
      return summarizeKenyanCbcRows(fallbackRows);
    }

    const admin = await getAdminClient();
    let query = (admin as any)
      .from("kingpin_kenyan_cbc_course_completeness")
      .select("*")
      .order("grade", { ascending: true })
      .order("subject", { ascending: true });

    if (data.grade) query = query.eq("grade", data.grade);

    const result = await query;
    if (result.error) {
      return summarizeKenyanCbcRows(fallbackRows);
    }

    const rows = safeRows<any>(result).map((row) => ({
      grade: row.grade,
      subject: row.subject,
      subjectSlug: row.subject_slug,
      programmeId: row.programme_id ?? null,
      courseId: row.course_id ?? null,
      courseSlug: row.course_slug ?? null,
      courseStatus: row.course_status ?? "draft",
      materialCount: row.material_count ?? 0,
      usableMaterialCount: row.usable_material_count ?? 0,
      bookMetadataCount: row.book_metadata_count ?? 0,
      lessonCount: row.lesson_count ?? 0,
      publishedLessonCount: row.published_lesson_count ?? 0,
      scopeCount: row.scope_count ?? 0,
      coveredScopeCount: row.covered_scope_count ?? 0,
      sectionCount: row.section_count ?? 0,
      teachingItemCount: row.teaching_item_count ?? 0,
      detailedLessonCount: row.detailed_lesson_count ?? 0,
      hasCourseShell: Boolean(row.has_course_shell),
      hasUsableMaterial: Boolean(row.has_usable_material),
      hasDraftLessons: Boolean(row.has_draft_lessons),
      hasDetailedLessons: Boolean(row.has_detailed_lessons),
      readyForPublishReview: Boolean(row.ready_for_publish_review),
    }));

    return summarizeKenyanCbcRows(rows);
  });

function summarizeKenyanCbcRows(rows: Array<{
  grade: number;
  subject?: string;
  subjectSlug?: string;
  programmeId?: string | null;
  courseId?: string | null;
  courseSlug?: string | null;
  courseStatus?: string;
  materialCount: number;
  usableMaterialCount: number;
  bookMetadataCount?: number;
  lessonCount: number;
  publishedLessonCount?: number;
  scopeCount?: number;
  coveredScopeCount?: number;
  sectionCount?: number;
  teachingItemCount?: number;
  detailedLessonCount?: number;
  hasCourseShell: boolean;
  hasUsableMaterial?: boolean;
  hasDraftLessons?: boolean;
  hasDetailedLessons?: boolean;
  readyForPublishReview: boolean;
}>) {
  const gradeSummary = [6, 7, 8, 9].map((grade) => {
    const gradeRows = rows.filter((row) => row.grade === grade);
    return {
      grade,
      expectedSubjects: gradeRows.length,
      seededCourses: gradeRows.filter((row) => row.hasCourseShell).length,
      materialCount: gradeRows.reduce((sum, row) => sum + row.materialCount, 0),
      usableMaterialCount: gradeRows.reduce((sum, row) => sum + row.usableMaterialCount, 0),
      lessonCount: gradeRows.reduce((sum, row) => sum + row.lessonCount, 0),
      detailedLessonCount: gradeRows.reduce((sum, row) => sum + (row.detailedLessonCount ?? 0), 0),
      teachingItemCount: gradeRows.reduce((sum, row) => sum + (row.teachingItemCount ?? 0), 0),
      readyForPublishReview: gradeRows.filter((row) => row.readyForPublishReview).length,
    };
  });

  return {
    rows,
    totalExpectedSubjects: rows.length,
    seededCourses: rows.filter((row) => row.hasCourseShell).length,
    materialCount: rows.reduce((sum, row) => sum + row.materialCount, 0),
    usableMaterialCount: rows.reduce((sum, row) => sum + row.usableMaterialCount, 0),
    lessonCount: rows.reduce((sum, row) => sum + row.lessonCount, 0),
    detailedLessonCount: rows.reduce((sum, row) => sum + (row.detailedLessonCount ?? 0), 0),
    teachingItemCount: rows.reduce((sum, row) => sum + (row.teachingItemCount ?? 0), 0),
    readyForPublishReview: rows.filter((row) => row.readyForPublishReview).length,
    gradeSummary,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Lessons (all DB-backed lessons across courses/institutions)
// ─────────────────────────────────────────────────────────────────────────────

export const listPlatformLessons = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: { search?: string; status?: string; limit?: number } = {}) => data)
  .handler(async ({ data, context }: any) => {
    await assertPlatformAdmin(context);
    if (!isSupabaseConfigured()) return demoEmpty;

    const admin = await getAdminClient();
    const limit = Math.min(Math.max(data.limit ?? 100, 1), 300);

    let query = admin
      .from("lessons")
      .select(
        "id, title, objective, status, duration_minutes, course_id, institution_id, created_at, courses(title)",
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (data.status) query = query.eq("status", data.status);
    if (data.search) query = query.ilike("title", `%${data.search}%`);

    const [lessonsRes, countRes] = await Promise.all([
      query,
      admin.from("lessons").select("id", { count: "exact", head: true }),
    ]);

    const lessons = safeRows<any>(lessonsRes);
    const instIds = Array.from(new Set(lessons.map((l) => l.institution_id).filter(Boolean)));

    const nameByInst = new Map<string, string>();
    if (instIds.length) {
      const instRes = await admin.from("institutions").select("id, name").in("id", instIds);
      for (const i of safeRows<any>(instRes)) nameByInst.set(i.id, i.name ?? "Institution");
    }

    return {
      rows: lessons.map((l) => ({
        id: l.id,
        title: l.title ?? "Untitled lesson",
        objective: l.objective ?? null,
        status: compactStatus(l.status),
        durationMinutes: l.duration_minutes ?? null,
        courseId: l.course_id ?? null,
        courseTitle: Array.isArray(l.courses) ? l.courses[0]?.title : l.courses?.title ?? null,
        institutionId: l.institution_id ?? null,
        institutionName: l.institution_id ? (nameByInst.get(l.institution_id) ?? null) : null,
        createdAt: l.created_at ?? null,
      })),
      total: countRes.count ?? 0,
    };
  });

// ─────────────────────────────────────────────────────────────────────────────
// Materials
// ─────────────────────────────────────────────────────────────────────────────

export const listPlatformMaterials = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: { limit?: number; status?: string } = {}) => data)
  .handler(async ({ data, context }: any) => {
    await assertPlatformAdmin(context);
    if (!isSupabaseConfigured()) return demoEmpty;

    const admin = await getAdminClient();
    const limit = Math.min(Math.max(data.limit ?? 100, 1), 300);

    let query = admin
      .from("course_materials")
      .select("id, title, type, processing_status, institution_id, course_id, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (data.status) query = query.eq("processing_status", data.status);

    const [matRes, countRes] = await Promise.all([
      query,
      admin.from("course_materials").select("id", { count: "exact", head: true }),
    ]);

    return {
      rows: safeRows<any>(matRes).map((m) => ({
        id: m.id,
        title: m.title ?? "Untitled",
        type: m.type ?? "file",
        processingStatus: compactStatus(m.processing_status),
        institutionId: m.institution_id ?? null,
        courseId: m.course_id ?? null,
        createdAt: m.created_at ?? null,
      })),
      total: countRes.count ?? 0,
    };
  });

// ─────────────────────────────────────────────────────────────────────────────
// Lesson Generation Jobs
// ─────────────────────────────────────────────────────────────────────────────

export const listPlatformLessonGenerationJobs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: { limit?: number; status?: string } = {}) => data)
  .handler(async ({ data, context }: any) => {
    await assertPlatformAdmin(context);
    if (!isSupabaseConfigured()) return demoEmpty;

    const admin = await getAdminClient();
    const limit = Math.min(Math.max(data.limit ?? 100, 1), 300);

    let query = admin
      .from("lesson_generation_jobs")
      .select(
        "id, status, course_id, institution_id, created_at, updated_at, total_lessons_generated, total_lessons_requested, error_message",
      )
      .order("created_at", { ascending: false })
      .limit(limit);
    if (data.status) query = query.eq("status", data.status);

    const [jobsRes, countRes] = await Promise.all([
      query,
      admin.from("lesson_generation_jobs").select("id", { count: "exact", head: true }),
    ]);

    return {
      rows: safeRows<any>(jobsRes).map((j) => ({
        id: j.id,
        status: compactStatus(j.status),
        rawStatus: j.status,
        courseId: j.course_id ?? null,
        institutionId: j.institution_id ?? null,
        generated: j.total_lessons_generated ?? 0,
        requested: j.total_lessons_requested ?? 0,
        error: j.error_message ?? null,
        createdAt: j.created_at ?? null,
        updatedAt: j.updated_at ?? null,
      })),
      total: countRes.count ?? 0,
    };
  });

// ─────────────────────────────────────────────────────────────────────────────
// Realtime presence
// ─────────────────────────────────────────────────────────────────────────────

export const getPlatformRealtime = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    await assertPlatformAdmin(context);
    if (!isSupabaseConfigured()) {
      return { onlineUsers: 0, liveSessions: [], onlineInstitutions: 0 };
    }
    const admin = await getAdminClient();
    const onlineCutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    const [onlineRes, liveRes] = await Promise.all([
      admin
        .from("learning_results")
        .select("student_id, institution_id, last_active_at")
        .gte("last_active_at", onlineCutoff)
        .limit(1000),
      admin
        .from("classroom_sessions")
        .select("id, institution_id, lesson_id, course_id, status, started_at, lessons(title)")
        .in("status", ["live", "active"])
        .order("started_at", { ascending: false })
        .limit(50),
    ]);

    const onlineRows = safeRows<any>(onlineRes);
    const liveSessions = safeRows<any>(liveRes);
    const onlineUsers = new Set(onlineRows.map((r) => r.student_id)).size;
    const onlineInstitutions = new Set(
      [...onlineRows.map((r) => r.institution_id), ...liveSessions.map((s) => s.institution_id)].filter(Boolean),
    ).size;

    return {
      onlineUsers,
      onlineInstitutions,
      liveSessions: liveSessions.map((s) => ({
        id: s.id,
        institutionId: s.institution_id,
        lessonId: s.lesson_id,
        courseId: s.course_id,
        status: s.status,
        startedAt: s.started_at,
        title: Array.isArray(s.lessons) ? s.lessons[0]?.title : s.lessons?.title ?? "Live lesson",
      })),
    };
  });

// ─────────────────────────────────────────────────────────────────────────────
// Usage overview
// ─────────────────────────────────────────────────────────────────────────────

export const getPlatformUsage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    await assertPlatformAdmin(context);
    if (!isSupabaseConfigured()) {
      return {
        sessions: 0,
        materials: 0,
        courses: 0,
        lessons: 0,
        jobs: 0,
        aiTokens: 0,
        byInstitution: [] as Array<{
          institutionId: string;
          name: string;
          sessions: number;
        }>,
      };
    }
    const admin = await getAdminClient();

    const [sessionsRes, materialsRes, coursesRes, lessonsRes, jobsRes] = await Promise.all([
      admin.from("classroom_sessions").select("id", { count: "exact", head: true }),
      admin.from("course_materials").select("id", { count: "exact", head: true }),
      admin.from("courses").select("id", { count: "exact", head: true }),
      admin.from("lessons").select("id", { count: "exact", head: true }),
      admin.from("lesson_generation_jobs").select("id", { count: "exact", head: true }),
    ]);

    // AI token usage — table name may vary; read defensively.
    let aiTokens = 0;
    try {
      const tokenRes = await (admin as any)
        .from("ai_usage_log")
        .select("tokens_used")
        .limit(5000);
      aiTokens = safeRows<any>(tokenRes).reduce((sum, r) => sum + (r.tokens_used ?? 0), 0);
    } catch {
      aiTokens = 0;
    }

    // Top institutions by session count.
    const sessionsByInstRes = await admin
      .from("classroom_sessions")
      .select("institution_id")
      .limit(5000);
    const byInstMap = new Map<string, number>();
    for (const row of safeRows<any>(sessionsByInstRes)) {
      if (!row.institution_id) continue;
      byInstMap.set(row.institution_id, (byInstMap.get(row.institution_id) ?? 0) + 1);
    }

    let byInstitution: Array<{ institutionId: string; name: string; sessions: number }> = [];
    if (byInstMap.size > 0) {
      const instIds = Array.from(byInstMap.keys()).slice(0, 20);
      const instRes = await admin
        .from("institutions")
        .select("id, name")
        .in("id", instIds);
      const nameById = new Map<string, string>();
      for (const i of safeRows<any>(instRes)) nameById.set(i.id, i.name ?? "Institution");
      byInstitution = instIds
        .map((id) => ({ institutionId: id, name: nameById.get(id) ?? "Institution", sessions: byInstMap.get(id) ?? 0 }))
        .sort((a, b) => b.sessions - a.sessions);
    }

    return {
      sessions: sessionsRes.count ?? 0,
      materials: materialsRes.count ?? 0,
      courses: coursesRes.count ?? 0,
      lessons: lessonsRes.count ?? 0,
      jobs: jobsRes.count ?? 0,
      aiTokens,
      byInstitution,
    };
  });

// ─────────────────────────────────────────────────────────────────────────────
// Activity feed
// ─────────────────────────────────────────────────────────────────────────────

export const listPlatformActivity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: { limit?: number } = {}) => data)
  .handler(async ({ data, context }: any) => {
    await assertPlatformAdmin(context);
    if (!isSupabaseConfigured()) return { rows: [] };
    const admin = await getAdminClient();
    const limit = Math.min(Math.max(data.limit ?? 50, 1), 200);

    const [eventsRes, instRes, jobsRes] = await Promise.all([
      admin
        .from("session_events")
        .select("id, event_type, actor_role, course_id, lesson_id, created_at")
        .order("created_at", { ascending: false })
        .limit(limit),
      admin
        .from("institutions")
        .select("id, name, created_at")
        .order("created_at", { ascending: false })
        .limit(limit),
      admin
        .from("lesson_generation_jobs")
        .select("id, status, created_at, total_lessons_generated, total_lessons_requested")
        .order("created_at", { ascending: false })
        .limit(limit),
    ]);

    const rows = [
      ...safeRows<any>(eventsRes).map((e) => ({
        id: `event-${e.id}`,
        type: "event",
        title: compactStatus(e.event_type),
        description: `${compactStatus(e.actor_role)} activity recorded`,
        timestamp: e.created_at,
      })),
      ...safeRows<any>(instRes).map((i) => ({
        id: `inst-${i.id}`,
        type: "institution",
        title: "Institution registered",
        description: i.name,
        timestamp: i.created_at,
      })),
      ...safeRows<any>(jobsRes).map((j) => ({
        id: `job-${j.id}`,
        type: "job",
        title: `Lesson generation ${compactStatus(j.status)}`,
        description: `${j.total_lessons_generated ?? 0}/${j.total_lessons_requested ?? 0} lessons`,
        timestamp: j.created_at,
      })),
    ]
      .sort((a, b) => (b.timestamp ?? "").localeCompare(a.timestamp ?? ""))
      .slice(0, limit);

    return { rows };
  });

// ─────────────────────────────────────────────────────────────────────────────
// Audit Logs
// ─────────────────────────────────────────────────────────────────────────────

export const listPlatformAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: { limit?: number; action?: string } = {}) => data)
  .handler(async ({ data, context }: any) => {
    await assertPlatformAdmin(context);
    if (!isSupabaseConfigured()) return { rows: [] };
    const admin = await getAdminClient();
    const limit = Math.min(Math.max(data.limit ?? 100, 1), 300);

    let query = admin
      .from("audit_logs")
      .select("id, action, resource_type, summary, actor_user_id, actor_role, institution_id, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (data.action) query = query.eq("action", data.action);

    const logsRes = await query;
    return {
      rows: safeRows<any>(logsRes).map((l) => ({
        id: l.id,
        action: l.action ?? "—",
        resourceType: l.resource_type ?? "—",
        summary: l.summary ?? "—",
        actorUserId: l.actor_user_id ?? null,
        actorRole: l.actor_role ?? null,
        institutionId: l.institution_id ?? null,
        createdAt: l.created_at ?? null,
      })),
    };
  });

// ─────────────────────────────────────────────────────────────────────────────
// System Health
// ─────────────────────────────────────────────────────────────────────────────

export const getPlatformSystemHealth = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    await assertPlatformAdmin(context);
    const supabaseConfigured = isSupabaseConfigured();
    if (!supabaseConfigured) {
      return {
        status: "degraded" as const,
        services: [
          { name: "Database", status: "offline", detail: "Supabase not configured" },
          { name: "Auth", status: "offline", detail: "Supabase not configured" },
          { name: "Realtime", status: "offline", detail: "Supabase not configured" },
          { name: "AI Providers", status: "unknown", detail: "No key configured" },
        ],
        metrics: { institutions: 0, users: 0, sessions: 0, jobs: 0 },
      };
    }

    const admin = await getAdminClient();
    let dbOk = true;
    let metrics = { institutions: 0, users: 0, sessions: 0, jobs: 0 };
    try {
      const [i, u, s, j] = await Promise.all([
        admin.from("institutions").select("id", { count: "exact", head: true }),
        admin.from("profiles").select("id", { count: "exact", head: true }),
        admin.from("classroom_sessions").select("id", { count: "exact", head: true }),
        admin.from("lesson_generation_jobs").select("id", { count: "exact", head: true }),
      ]);
      metrics = {
        institutions: i.count ?? 0,
        users: u.count ?? 0,
        sessions: s.count ?? 0,
        jobs: j.count ?? 0,
      };
    } catch {
      dbOk = false;
    }

    const hasOpenAi = Boolean(process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY);
    const services = [
      {
        name: "Database",
        status: dbOk ? "operational" : "outage",
        detail: dbOk ? "Healthy connection" : "Connection failed",
      },
      {
        name: "Auth",
        status: dbOk ? "operational" : "degraded",
        detail: dbOk ? "Supabase auth reachable" : "Depends on database",
      },
      {
        name: "Realtime",
        status: dbOk ? "operational" : "degraded",
        detail: dbOk ? "Live channels active" : "Degraded",
      },
      {
        name: "AI Providers",
        status: hasOpenAi ? "operational" : "unknown",
        detail: hasOpenAi ? "API key present" : "No provider key configured",
      },
      {
        name: "Storage",
        status: dbOk ? "operational" : "unknown",
        detail: dbOk ? "Object storage attached" : "Unknown",
      },
    ];

    const anyOutage = services.some((s) => s.status === "outage");
    const anyDegraded = services.some((s) => s.status === "degraded" || s.status === "unknown");
    const status: "operational" | "degraded" | "outage" = anyOutage
      ? "outage"
      : anyDegraded
        ? "degraded"
        : "operational";

    return { status, services, metrics };
  });

// ─────────────────────────────────────────────────────────────────────────────
// AI Settings (read-only runtime view)
// ─────────────────────────────────────────────────────────────────────────────

export const getPlatformAiSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    await assertPlatformAdmin(context);

    const providers = [
      {
        name: "DeepSeek",
        configured: Boolean(process.env.DEEPSEEK_API_KEY),
        baseUrl: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
        model: process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash",
      },
      {
        name: "OpenAI",
        configured: Boolean(process.env.OPENAI_API_KEY),
        baseUrl: "https://api.openai.com/v1",
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      },
      {
        name: "OpenAI Compatible",
        configured: Boolean(process.env.OPENAI_COMPATIBLE_API_KEY),
        baseUrl: process.env.OPENAI_COMPATIBLE_BASE_URL ?? "—",
        model: process.env.OPENAI_COMPATIBLE_MODEL ?? "—",
      },
    ];

    const teacherVoice = {
      enabled: process.env.TEACHER_VOICE_ENABLED === "true",
      provider: process.env.TEACHER_VOICE_PROVIDER ?? "openai",
      voice: process.env.TEACHER_VOICE_VOICE ?? "alloy",
    };

    return {
      providers,
      teacherVoice,
      defaultProvider: process.env.AI_DEFAULT_PROVIDER ?? "deepseek",
      maxTokens: Number(process.env.AI_MAX_TOKENS ?? 2048),
    };
  });

// ─────────────────────────────────────────────────────────────────────────────
// Plans
// ─────────────────────────────────────────────────────────────────────────────

export const listPlatformPlans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    await assertPlatformAdmin(context);
    if (!isSupabaseConfigured()) return { rows: [], subscriptions: 0 };

    const admin = await getAdminClient();

    const [plansRes, subsRes] = await Promise.all([
      admin
        .from("subscription_plans")
        .select("id, slug, name, description, amount_minor, currency, interval, status, highlight, features")
        .order("amount_minor", { ascending: true }),
      admin
        .from("institution_subscriptions")
        .select("id", { count: "exact", head: true })
        .in("status", ["active", "trialing"]),
    ]);

    return {
      rows: safeRows<any>(plansRes).map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description ?? null,
        amountMinor: toMinorUnits(p.amount_minor),
        currency: normalizeCurrency(p.currency),
        interval: p.interval ?? "month",
        status: p.status ?? "active",
        highlight: Boolean(p.highlight),
        features: Array.isArray(p.features) ? p.features.map(String) : [],
      })),
      subscriptions: subsRes.count ?? 0,
    };
  });

// ─────────────────────────────────────────────────────────────────────────────
// Support tickets (defensive — table may not exist)
// ─────────────────────────────────────────────────────────────────────────────

export const listPlatformSupportTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    await assertPlatformAdmin(context);
    if (!isSupabaseConfigured()) return { rows: [], total: 0 };

    const admin = await getAdminClient();
    try {
      const [ticketsRes, countRes] = await Promise.all([
        (admin as any)
          .from("support_tickets")
          .select("id, subject, status, priority, user_id, institution_id, created_at")
          .order("created_at", { ascending: false })
          .limit(100),
        (admin as any)
          .from("support_tickets")
          .select("id", { count: "exact", head: true }),
      ]);
      return {
        rows: safeRows<any>(ticketsRes).map((t) => ({
          id: t.id,
          subject: t.subject ?? "Untitled",
          status: compactStatus(t.status),
          priority: compactStatus(t.priority),
          userId: t.user_id ?? null,
          institutionId: t.institution_id ?? null,
          createdAt: t.created_at ?? null,
        })),
        total: countRes.count ?? 0,
      };
    } catch {
      return { rows: [], total: 0 };
    }
  });

// ─────────────────────────────────────────────────────────────────────────────
// Platform settings (read-only runtime configuration view)
// ─────────────────────────────────────────────────────────────────────────────

export const getPlatformSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    await assertPlatformAdmin(context);

    return {
      environment: process.env.NODE_ENV ?? "development",
      supabaseConfigured: isSupabaseConfigured(),
      appUrl: process.env.APP_URL ?? process.env.VITE_APP_URL ?? "—",
      region: process.env.APP_REGION ?? "—",
      maintenanceMode: process.env.MAINTENANCE_MODE === "true",
      allowDemoMode: process.env.ALLOW_DEMO_MODE === "true",
      billing: {
        paystackConfigured: Boolean(process.env.PAYSTACK_SECRET_KEY),
        currency: normalizeCurrency(process.env.PLATFORM_CURRENCY),
      },
    };
  });
