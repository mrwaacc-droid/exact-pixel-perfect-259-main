import { createServerFn } from "@tanstack/react-start";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ── Helpers ────────────────────────────────────────────────────────────────
async function getAdminClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function randomReference(prefix = "klassruum_course"): string {
  return `${prefix}_${Date.now()}_${randomUUID()}`;
}

function normalizeStatus(status: unknown): "success" | "pending" | "failed" | "abandoned" {
  if (typeof status !== "string") return "pending";
  const lower = status.toLowerCase();
  if (lower === "success") return "success";
  if (lower === "failed") return "failed";
  if (lower === "abandoned") return "abandoned";
  return "pending";
}

export const COURSE_PURCHASE_SOURCE = "klassruum_course_purchase";

export type PurchasableCourse = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  subject: string | null;
  level: string | null;
  sourceType: string | null;
  priceUsd: number;
  pricingLabel: string | null;
  compareAtPriceUsd: number | null;
  institutionName: string | null;
  coverImageUrl: string | null;
};

function mapCourse(row: any): PurchasableCourse {
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? ""),
    title: String(row.title ?? "Untitled course"),
    description: (row.description as string) ?? null,
    subject: (row.subject as string) ?? null,
    level: (row.level as string) ?? null,
    sourceType: (row.source_type as string) ?? null,
    priceUsd: Number(row.price_usd ?? 0),
    pricingLabel: (row.pricing_label as string) ?? null,
    compareAtPriceUsd: row.compare_at_price_usd != null ? Number(row.compare_at_price_usd) : null,
    institutionName: (row.institutions?.name as string) ?? null,
    coverImageUrl: (row.cover_image_url as string) ?? null,
  };
}

// ── Public catalog reads (no auth) ─────────────────────────────────────────

/** Public list of published courses that carry a price (marketplace catalog). */
export const getPurchasableCourses = createServerFn({ method: "GET" }).handler(async () => {
  const supabaseAdmin = await getAdminClient();
  const { data, error } = await supabaseAdmin
    .from("courses")
    .select(
      "id, slug, title, description, subject, level, source_type, price_usd, pricing_label, compare_at_price_usd, cover_image_url, institutions(name)",
    )
    .eq("status", "published")
    .order("source_type", { ascending: false })
    .order("title", { ascending: true })
    .limit(60);

  if (error) throw new Error(error.message);
  return { courses: (data ?? []).map(mapCourse) };
});

/** Public course lookup by slug (for course detail / checkout landing). */
export const getCourseForPurchase = createServerFn({ method: "GET" })
  .validator((data: { slug: string }) => z.object({ slug: z.string().min(1).max(200) }).parse(data))
  .handler(async ({ data }) => {
    const supabaseAdmin = await getAdminClient();
    const { data: row, error } = await supabaseAdmin
      .from("courses")
      .select(
        "id, slug, title, description, subject, level, source_type, price_usd, pricing_label, compare_at_price_usd, cover_image_url, institution_id, institutions(name)",
      )
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!row) return { course: null };
    return { course: mapCourse(row) };
  });

/** Whether the current student already owns (is enrolled in) a course. */
export const getMyCourseOwnership = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: { courseIds: string[] }) =>
    z.object({ courseIds: z.array(z.string().uuid()).max(200) }).parse(data),
  )
  .handler(async ({ data, context }: any) => {
    if (!context.supabase) return { ownedCourseIds: [] as string[] };
    if (data.courseIds.length === 0) return { ownedCourseIds: [] as string[] };
    const { data: rows, error } = await context.supabase
      .from("course_enrollments")
      .select("course_id")
      .eq("student_id", context.userId)
      .in("course_id", data.courseIds)
      .in("status", ["active", "completed"]);
    if (error) throw new Error(error.message);
    return { ownedCourseIds: (rows ?? []).map((r: any) => r.course_id) };
  });

// ── Checkout & fulfillment ──────────────────────────────────────────────────

export type CourseCheckoutResult = {
  free: boolean;
  reference: string | null;
  authorizationUrl: string | null;
  amountUsd: number;
  courseId: string;
};

/**
 * Shared fulfillment: mark a course_purchases row successful and grant the
 * enrollment idempotently. Used by both the interactive verify flow and the
 * webhook so a payment is never double-fulfilled.
 */
export async function fulfillCoursePurchase(
  supabaseAdmin: Awaited<ReturnType<typeof getAdminClient>>,
  input: {
    reference: string;
    status: "success" | "pending" | "failed" | "abandoned";
    paidAt?: string | null;
    providerReference?: string | null;
  },
): Promise<{ fulfilled: boolean; courseId: string | null; userId: string | null }> {
  const { data: purchase, error } = await supabaseAdmin
    .from("course_purchases")
    .select("id, user_id, course_id, institution_id, status, enrolled_at")
    .eq("paystack_reference", input.reference)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!purchase) return { fulfilled: false, courseId: null, userId: null };

  // Always reflect the latest payment status.
  if (purchase.status !== input.status) {
    await supabaseAdmin
      .from("course_purchases")
      .update({
        status: input.status,
        paid_at: input.paidAt ?? null,
        provider_reference: input.providerReference ?? null,
      })
      .eq("id", purchase.id);
  }

  if (input.status !== "success" || purchase.enrolled_at) {
    return { fulfilled: false, courseId: purchase.course_id, userId: purchase.user_id };
  }

  // Grant enrollment idempotently.
  const { error: enrollErr } = await supabaseAdmin.from("course_enrollments").upsert(
    {
      institution_id: purchase.institution_id,
      course_id: purchase.course_id,
      student_id: purchase.user_id,
      status: "active",
      enrolled_by: purchase.user_id,
      enrollment_source: "self_registered",
      enrolled_at: new Date().toISOString(),
    },
    { onConflict: "course_id,student_id" },
  );
  if (enrollErr) throw new Error(enrollErr.message);

  const nowIso = new Date().toISOString();
  await supabaseAdmin
    .from("course_purchases")
    .update({ enrolled_at: nowIso })
    .eq("id", purchase.id);

  return { fulfilled: true, courseId: purchase.course_id, userId: purchase.user_id };
}

/** Webhook entrypoint: update purchase status + fulfill on success. */
export async function handleCoursePurchaseWebhookEvent(
  supabaseAdmin: Awaited<ReturnType<typeof getAdminClient>>,
  input: {
    reference: string;
    status: string;
    paidAt?: string | null;
    providerReference?: string | null;
  },
) {
  return fulfillCoursePurchase(supabaseAdmin, {
    reference: input.reference,
    status: normalizeStatus(input.status),
    paidAt: input.paidAt,
    providerReference: input.providerReference,
  });
}

export const initializeCourseCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ courseId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }: any) => {
    const supabaseAdmin = await getAdminClient();

    const { data: course, error: courseErr } = await supabaseAdmin
      .from("courses")
      .select("id, slug, title, price_usd, currency, institution_id, status")
      .eq("id", data.courseId)
      .maybeSingle();
    if (courseErr) throw new Error(courseErr.message);
    if (!course) throw new Error("Course not found.");
    if (course.status !== "published")
      throw new Error("This course is not available for purchase.");

    const amountUsd = Number(course.price_usd ?? 0);

    // Free course → grant enrollment immediately, no gateway needed.
    if (amountUsd <= 0) {
      await supabaseAdmin.from("course_enrollments").upsert(
        {
          institution_id: course.institution_id,
          course_id: course.id,
          student_id: context.userId,
          status: "active",
          enrolled_by: context.userId,
          enrollment_source: "self_registered",
          enrolled_at: new Date().toISOString(),
        },
        { onConflict: "course_id,student_id" },
      );
      return {
        free: true,
        reference: null,
        authorizationUrl: null,
        amountUsd: 0,
        courseId: course.id,
      } satisfies CourseCheckoutResult;
    }

    // Already enrolled? Short-circuit.
    const { data: owned } = await supabaseAdmin
      .from("course_enrollments")
      .select("id")
      .eq("course_id", course.id)
      .eq("student_id", context.userId)
      .in("status", ["active", "completed"])
      .maybeSingle();
    if (owned) {
      return {
        free: true,
        reference: null,
        authorizationUrl: null,
        amountUsd,
        courseId: course.id,
      } satisfies CourseCheckoutResult;
    }

    // Covered by the student's institution plan? A course belongs to the
    // institution that authored it. If the student is a member of that same
    // institution and it holds an active platform subscription, they've
    // already paid for access via the institution — don't charge them again.
    if (course.institution_id) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("institution_id")
        .eq("id", context.userId)
        .maybeSingle();
      let studentInstitutionId = (profile?.institution_id as string | null) ?? null;
      if (!studentInstitutionId) {
        const { data: membership } = await supabaseAdmin
          .from("institution_members")
          .select("institution_id")
          .eq("user_id", context.userId)
          .eq("status", "active")
          .limit(1)
          .maybeSingle();
        studentInstitutionId = (membership?.institution_id as string | null) ?? null;
      }

      if (studentInstitutionId === course.institution_id) {
        const { data: subscription } = await supabaseAdmin
          .from("institution_subscriptions")
          .select("status, current_period_end")
          .eq("institution_id", course.institution_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        const isActive =
          subscription?.status === "active" &&
          (!subscription.current_period_end ||
            new Date(subscription.current_period_end as string) > new Date());
        if (isActive) {
          await supabaseAdmin.from("course_enrollments").upsert(
            {
              institution_id: course.institution_id,
              course_id: course.id,
              student_id: context.userId,
              status: "active",
              enrolled_by: context.userId,
              enrollment_source: "institution_plan",
              enrolled_at: new Date().toISOString(),
            },
            { onConflict: "course_id,student_id" },
          );
          return {
            free: true,
            reference: null,
            authorizationUrl: null,
            amountUsd,
            courseId: course.id,
          } satisfies CourseCheckoutResult;
        }
      }
    }

    const reference = randomReference();
    const amountMinor = Math.round(amountUsd * 100);
    const customerEmail =
      (context.claims?.email as string | undefined) ??
      ((await supabaseAdmin.from("profiles").select("email").eq("id", context.userId).maybeSingle())
        .data?.email as string | undefined);
    if (!customerEmail)
      throw new Error("We couldn't find an email on your account for the receipt.");

    const { error: purchaseErr } = await supabaseAdmin.from("course_purchases").insert({
      user_id: context.userId,
      course_id: course.id,
      institution_id: course.institution_id,
      amount_usd: amountUsd,
      amount_minor: amountMinor,
      currency: "USD",
      status: "initialized",
      paystack_reference: reference,
    });
    if (purchaseErr) throw new Error(purchaseErr.message);

    const secretKey = requireEnv("PAYSTACK_SECRET_KEY");
    const appUrl =
      process.env.APP_URL ||
      process.env.VITE_APP_URL ||
      process.env.PUBLIC_APP_URL ||
      "https://klassruum.co.ke";
    const callbackUrl = `${appUrl}/courses/${course.slug}/checkout?reference=${encodeURIComponent(reference)}`;

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: customerEmail,
        amount: amountMinor,
        currency: "USD",
        reference,
        callback_url: callbackUrl,
        metadata: {
          source: COURSE_PURCHASE_SOURCE,
          course_id: course.id,
          user_id: context.userId,
          institution_id: course.institution_id,
        },
      }),
    });

    const responseBody = safeJsonParse<Record<string, unknown>>(await response.text(), {});
    if (!response.ok) {
      const message = (responseBody.message as string) || "Unable to start Paystack checkout.";
      await supabaseAdmin
        .from("course_purchases")
        .update({ status: "failed" })
        .eq("paystack_reference", reference);
      throw new Error(message);
    }

    const dataNode = (responseBody.data ?? {}) as Record<string, unknown>;
    const authorizationUrl = dataNode.authorization_url as string | undefined;
    if (!authorizationUrl) throw new Error("Paystack did not return an authorization URL.");

    return {
      free: false,
      reference,
      authorizationUrl,
      amountUsd,
      courseId: course.id,
    } satisfies CourseCheckoutResult;
  });

export const verifyCoursePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ reference: z.string().min(1).max(200) }).parse(data))
  .handler(async ({ data, context }: any) => {
    const supabaseAdmin = await getAdminClient();

    // Make sure this reference belongs to the caller.
    const { data: purchase } = await supabaseAdmin
      .from("course_purchases")
      .select("id, user_id, course_id, status")
      .eq("paystack_reference", data.reference)
      .maybeSingle();
    if (!purchase || purchase.user_id !== context.userId) {
      throw new Error("We couldn't verify this payment.");
    }
    if (purchase.status === "success") {
      return { status: "success" as const, courseId: purchase.course_id, alreadyVerified: true };
    }

    const secretKey = requireEnv("PAYSTACK_SECRET_KEY");
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(data.reference)}`,
      {
        headers: { Authorization: `Bearer ${secretKey}` },
      },
    );
    const responseBody = safeJsonParse<Record<string, unknown>>(await response.text(), {});
    if (!response.ok) {
      const message = (responseBody.message as string) || "Unable to verify Paystack payment.";
      throw new Error(message);
    }

    const txn = (responseBody.data ?? {}) as Record<string, unknown>;
    const status = normalizeStatus(txn.status);
    const paidAt = typeof txn.paid_at === "string" ? txn.paid_at : null;
    const providerReference =
      typeof txn.id === "number" || typeof txn.id === "string" ? String(txn.id) : null;

    await fulfillCoursePurchase(supabaseAdmin, {
      reference: data.reference,
      status,
      paidAt,
      providerReference,
    });

    return { status, courseId: purchase.course_id, alreadyVerified: false };
  });

export type CoursePurchaseRow = {
  id: string;
  courseId: string;
  courseTitle: string;
  amountUsd: number;
  currency: string;
  status: string;
  paidAt: string | null;
  createdAt: string | null;
};

export const getMyPurchases = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    if (!context.supabase) return { purchases: [] as CoursePurchaseRow[] };
    const { data, error } = await context.supabase
      .from("course_purchases")
      .select("id, course_id, amount_usd, currency, status, paid_at, created_at, courses(title)")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    const purchases: CoursePurchaseRow[] = (data ?? []).map((p: any) => ({
      id: p.id,
      courseId: p.course_id,
      courseTitle: p.courses?.title ?? "Course",
      amountUsd: Number(p.amount_usd ?? 0),
      currency: p.currency ?? "USD",
      status: p.status ?? "pending",
      paidAt: p.paid_at ?? null,
      createdAt: p.created_at ?? null,
    }));
    return { purchases };
  });
