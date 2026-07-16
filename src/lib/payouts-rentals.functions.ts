/**
 * payouts-rentals.functions.ts
 *
 * Server functions for:
 *  - Teacher payouts (institution compensating teachers for sessions taught)
 *  - Classroom rentals (institutions renting virtual classrooms, with
 *    Paystack-style payment references)
 *
 * Tables touched:
 *  - teacher_payouts
 *  - classroom_rentals
 *  - classroom_sessions (for payout aggregation)
 *  - virtual_classrooms (for rental availability)
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function fmtMoney(cents: number, currency = "KES"): string {
  const units = cents / 100;
  return `${currency} ${units.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

// ===========================================================================
// TEACHER PAYOUTS
// ===========================================================================

/**
 * computeSessionPayout — computes the amount owed to a teacher for a single
 * completed session. Formula: base_rate_per_session + per_learner_bonus.
 */
export const computeSessionPayout = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: { session_id: string }) => data)
  .handler(async ({ data, context }: any) => {
    const { supabase } = context;
    if (!supabase) return { amount_cents: 0, currency: "KES", formula: "demo" };

    const db = supabase as any;

    // Load session + participant count.
    const [{ data: session }, { count: learnerCount }] = await Promise.all([
      db
        .from("classroom_sessions")
        .select("id, institution_id, host_user_id, mode, started_at, ended_at")
        .eq("id", data.session_id)
        .maybeSingle(),
      db
        .from("session_participants")
        .select("id", { count: "exact", head: true })
        .eq("session_id", data.session_id)
        .not("joined_at", "is", null),
    ]);

    if (!session) throw new Error("Session not found.");

    // Base rate: AI/Hybrid sessions pay less than human-led.
    const BASE_RATES: Record<string, number> = {
      human_teacher: 1500, // KES 15.00 per session base
      hybrid: 1000,
      ai_teacher: 500,
    };
    const base = BASE_RATES[session.mode] ?? 750;
    const perLearner = 50; // KES 0.50 per learner who attended
    const amount = base + (learnerCount ?? 0) * perLearner;

    return {
      amount_cents: amount,
      currency: "KES",
      formula: fmtMoney(amount) + ` (base ${base} + ${learnerCount ?? 0} learners)`,
      session_id: session.id,
      institution_id: session.institution_id,
      teacher_id: session.host_user_id,
    };
  });

/**
 * createPayoutForSession — institution admin records a payout for a completed
 * session. Idempotent: if a payout already exists for the session, returns it.
 */
export const createPayoutForSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (data: unknown) =>
      z
        .object({
          session_id: z.string().regex(UUID_RE),
          amount_cents: z.number().int().min(0).optional(),
        })
        .parse(data),
  )
  .handler(async ({ data, context }: any) => {
    const { supabase, userId } = context;
    if (!supabase) {
      return { payout: null, demo: true };
    }

    const db = supabase as any;

    // Idempotency: existing payout for this session?
    const { data: existing } = await db
      .from("teacher_payouts")
      .select("*")
      .eq("session_id", data.session_id)
      .maybeSingle();
    if (existing) return { payout: existing };

    // Compute (or accept override) + resolve teacher/institution.
    let amount = data.amount_cents;
    const { data: session } = await db
      .from("classroom_sessions")
      .select("id, institution_id, host_user_id")
      .eq("id", data.session_id)
      .maybeSingle();

    if (!session) throw new Error("Session not found.");
    const teacherId = session.host_user_id;
    const institutionId = session.institution_id;

    if (typeof amount !== "number") {
      // Use compute logic inline (server fn → server fn is fine).
      const computeFn = await import("./session-lifecycle.functions").then(
        () => null,
      );
      // Fallback computation to avoid circular import issues.
      const { count: learnerCount } = await db
        .from("session_participants")
        .select("id", { count: "exact", head: true })
        .eq("session_id", data.session_id);

      amount = 750 + (learnerCount ?? 0) * 50; // default formula
    }

    const { data: payout, error } = await db
      .from("teacher_payouts")
      .insert({
        teacher_id: teacherId,
        institution_id: institutionId,
        session_id: data.session_id,
        amount_cents: amount,
        currency: "KES",
        status: "pending",
        session_count: 1,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return { payout };
  });

/**
 * listTeacherPayouts — returns payouts for a teacher (self) or all teachers
 * in an institution (admin view).
 */
export const listTeacherPayouts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator(
    (data: {
      teacher_id?: string;
      institution_id?: string;
      status?: string;
      limit?: number;
    }) => data,
  )
  .handler(async ({ data, context }: any) => {
    const { supabase, userId } = context;
    if (!supabase) return { payouts: [] };

    const db = supabase as any;
    let query = db
      .from("teacher_payouts")
      .select(
        "id, teacher_id, institution_id, session_id, amount_cents, currency, status, session_count, learner_hours, period_start, period_end, paid_at, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 50);

    // Self-scoping: if no teacher_id/institution_id given, show own payouts.
    if (data.teacher_id) {
      query = query.eq("teacher_id", data.teacher_id);
    } else if (data.institution_id) {
      query = query.eq("institution_id", data.institution_id);
    } else {
      query = query.eq("teacher_id", userId);
    }
    if (data.status) query = query.eq("status", data.status);

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return { payouts: rows ?? [] };
  });

/**
 * markPayoutPaid — institution admin marks a payout as paid.
 */
export const markPayoutPaid = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (data: unknown) =>
      z
        .object({
          payout_id: z.string().regex(UUID_RE),
          paystack_reference: z.string().optional(),
        })
        .parse(data),
  )
  .handler(async ({ data, context }: any) => {
    const { supabase } = context;
    if (!supabase) return { ok: true, demo: true };

    const db = supabase as any;
    const { data: payout, error } = await db
      .from("teacher_payouts")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        metadata: { paystack_reference: data.paystack_reference },
      })
      .eq("id", data.payout_id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return { ok: true, payout };
  });

// ===========================================================================
// CLASSROOM RENTALS
// ===========================================================================

type RentalType = "per_session" | "hourly" | "daily" | "monthly";

const RENTAL_RATES: Record<RentalType, number> = {
  per_session: 2000, // KES 20.00 per session
  hourly: 3500, // KES 35.00/hour
  daily: 18000, // KES 180.00/day
  monthly: 350000, // KES 3,500.00/month
};

/**
 * checkClassroomAvailability — returns whether a virtual classroom is
 * available for a given time window, and the computed rental price.
 */
export const checkClassroomAvailability = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator(
    (data: {
      virtual_classroom_id: string;
      start_at: string;
      end_at: string;
      rental_type?: "per_session" | "hourly" | "daily" | "monthly";
    }) => data,
  )
  .handler(async ({ data, context }: any) => {
    const { supabase } = context;
    if (!supabase) {
      return { available: true, price_cents: RENTAL_RATES.per_session, conflicts: [] };
    }

    const db = supabase as any;

    // Check for overlapping confirmed/active rentals.
    const { data: conflicts } = await db
      .from("classroom_rentals")
      .select("id, start_at, end_at")
      .eq("virtual_classroom_id", data.virtual_classroom_id)
      .in("status", ["confirmed", "active"])
      .or(`and(start_at.lt.${data.end_at},end_at.gt.${data.start_at})`);

    const available = (conflicts ?? []).length === 0;

    // Compute price.
    const rentalType: RentalType = (data.rental_type as RentalType) ?? "per_session";
    const start = new Date(data.start_at);
    const end = new Date(data.end_at);
    const hours = Math.max(1, (end.getTime() - start.getTime()) / 3_600_000);
    const days = Math.max(1, hours / 24);

    let price = RENTAL_RATES[rentalType];
    if (rentalType === "hourly") price = Math.round(RENTAL_RATES.hourly * hours);
    if (rentalType === "daily") price = Math.round(RENTAL_RATES.daily * days);

    return {
      available,
      price_cents: price,
      currency: "KES",
      conflicts: conflicts ?? [],
    };
  });

/**
 * createClassroomRental — institution admin rents a classroom. Creates a
 * pending rental record. The frontend will initiate Paystack payment and
 * call confirmClassroomRental on callback.
 */
export const createClassroomRental = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (data: unknown) =>
      z
        .object({
          virtual_classroom_id: z.string().regex(UUID_RE),
          institution_id: z.string().regex(UUID_RE),
          session_id: z.string().regex(UUID_RE).optional(),
          rental_type: z.enum(["per_session", "hourly", "daily", "monthly"]).default("per_session"),
          start_at: z.string().datetime(),
          end_at: z.string().datetime(),
          amount_cents: z.number().int().min(0).optional(),
        })
        .parse(data),
  )
  .handler(async ({ data, context }: any) => {
    const { supabase, userId } = context;
    if (!supabase) return { rental: null, demo: true };

    const db = supabase as any;

    // 1. Verify availability.
    const { data: conflicts } = await db
      .from("classroom_rentals")
      .select("id")
      .eq("virtual_classroom_id", data.virtual_classroom_id)
      .in("status", ["confirmed", "active"])
      .or(`and(start_at.lt.${data.end_at},end_at.gt.${data.start_at})`);

    if ((conflicts ?? []).length > 0) {
      throw new Error("This classroom is already booked for the selected time.");
    }

    // 2. Compute price if not provided.
    let amount = data.amount_cents;
    if (typeof amount !== "number") {
      const start = new Date(data.start_at);
      const end = new Date(data.end_at);
      const hours = Math.max(1, (end.getTime() - start.getTime()) / 3_600_000);
      const days = Math.max(1, hours / 24);
      amount = RENTAL_RATES[data.rental_type as RentalType];
      if (data.rental_type === "hourly") amount = Math.round(RENTAL_RATES.hourly * hours);
      if (data.rental_type === "daily") amount = Math.round(RENTAL_RATES.daily * days);
    }

    // 3. Insert pending rental.
    const { data: rental, error } = await db
      .from("classroom_rentals")
      .insert({
        institution_id: data.institution_id,
        virtual_classroom_id: data.virtual_classroom_id,
        session_id: data.session_id ?? null,
        renter_id: userId,
        rental_type: data.rental_type,
        start_at: data.start_at,
        end_at: data.end_at,
        amount_cents: amount,
        currency: "KES",
        status: "pending",
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return { rental };
  });

/**
 * confirmClassroomRental — called after successful Paystack payment. Sets
 * status to confirmed and links the payment reference.
 */
export const confirmClassroomRental = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (data: unknown) =>
      z
        .object({
          rental_id: z.string().regex(UUID_RE),
          paystack_reference: z.string().min(1),
          paystack_status: z.string().default("success"),
        })
        .parse(data),
  )
  .handler(async ({ data, context }: any) => {
    const { supabase } = context;
    if (!supabase) return { ok: true, demo: true };

    const db = supabase as any;
    const { data: rental, error } = await db
      .from("classroom_rentals")
      .update({
        status: "confirmed",
        paystack_reference: data.paystack_reference,
        paystack_status: data.paystack_status,
      })
      .eq("id", data.rental_id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return { ok: true, rental };
  });

/**
 * listClassroomRentals — institution admins view their rentals.
 */
export const listClassroomRentals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator(
    (data: { institution_id?: string; status?: string; limit?: number }) => data,
  )
  .handler(async ({ data, context }: any) => {
    const { supabase } = context;
    if (!supabase) return { rentals: [] };

    const db = supabase as any;
    let query = db
      .from("classroom_rentals")
      .select(
        "id, institution_id, virtual_classroom_id, session_id, rental_type, start_at, end_at, amount_cents, currency, status, paystack_reference, created_at, virtual_classrooms(name, capacity, mode)",
      )
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 50);

    if (data.institution_id) query = query.eq("institution_id", data.institution_id);
    if (data.status) query = query.eq("status", data.status);

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return { rentals: rows ?? [] };
  });

// ===========================================================================
// RENTAL PAYMENTS (Paystack)
// ===========================================================================

function randomRentalReference(): string {
  const raw = (
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}${Math.random().toString(36).slice(2)}`
  ).replace(/-/g, "");
  return `rental_${raw.slice(0, 24)}`;
}

/**
 * initializeRentalCheckout — starts a Paystack checkout for a pending rental.
 * Returns the authorization URL the browser should redirect to. The Paystack
 * callback returns to the rentals page with ?reference=&rental_id= which the
 * UI verifies via verifyRentalPayment.
 */
export const initializeRentalCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        rental_id: z.string().regex(UUID_RE),
        return_path: z.enum(["/institution/rentals", "/teacher/rentals"]).default("/institution/rentals"),
      })
      .parse(data),
  )
  .handler(async ({ data, context }: any) => {
    const { supabase, userId, claims } = context;
    if (!supabase) throw new Error("Payments are unavailable in demo mode.");

    const db = supabase as any;
    const { data: rental, error } = await db
      .from("classroom_rentals")
      .select("id, institution_id, amount_cents, currency, status")
      .eq("id", data.rental_id)
      .single();
    if (error) throw new Error(error.message);
    if (!rental) throw new Error("Rental not found.");
    if (rental.status !== "pending") throw new Error("Only pending rentals can be paid for.");

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) throw new Error("Payments are not configured yet. Set PAYSTACK_SECRET_KEY.");

    const appUrl =
      process.env.APP_URL ||
      process.env.VITE_APP_URL ||
      process.env.PUBLIC_APP_URL ||
      "https://klassruum.co.ke";
    const reference = randomRentalReference();
    const callbackUrl = `${appUrl}${data.return_path}?reference=${encodeURIComponent(
      reference,
    )}&rental_id=${encodeURIComponent(rental.id)}`;

    const email = (claims?.email as string) || `${userId}@klassruum.local`;

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: rental.amount_cents,
        currency: rental.currency ?? "KES",
        reference,
        callback_url: callbackUrl,
        metadata: {
          rental_id: rental.id,
          institution_id: rental.institution_id,
          source: "klassruum_rental",
        },
      }),
    });

    let body: any = {};
    try {
      body = await response.json();
    } catch {
      body = {};
    }
    if (!response.ok) {
      throw new Error(body?.message || "Unable to start Paystack checkout.");
    }
    const authorizationUrl = body?.data?.authorization_url as string | undefined;
    if (!authorizationUrl) throw new Error("Paystack did not return an authorization URL.");

    await db
      .from("classroom_rentals")
      .update({ paystack_reference: reference, paystack_status: "initialized" })
      .eq("id", rental.id);

    return { reference, authorizationUrl };
  });

/**
 * verifyRentalPayment — verifies a Paystack transaction for a rental after
 * the gateway redirects back, then marks the rental confirmed.
 */
export const verifyRentalPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        rental_id: z.string().regex(UUID_RE),
        reference: z.string().min(1).max(200),
      })
      .parse(data),
  )
  .handler(async ({ data, context }: any) => {
    const { supabase } = context;
    if (!supabase) throw new Error("Payments are unavailable in demo mode.");
    const db = supabase as any;

    const { data: rental, error } = await db
      .from("classroom_rentals")
      .select("id, amount_cents, currency, status, paystack_reference")
      .eq("id", data.rental_id)
      .single();
    if (error) throw new Error(error.message);
    if (!rental) throw new Error("Rental not found.");
    if (rental.status === "confirmed" || rental.status === "active") {
      return { ok: true, status: rental.status, rental };
    }
    if (rental.paystack_reference !== data.reference) {
      throw new Error("Payment reference does not match this rental.");
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) throw new Error("Payments are not configured yet. Set PAYSTACK_SECRET_KEY.");

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(data.reference)}`,
      { headers: { Authorization: `Bearer ${secretKey}` } },
    );
    let body: any = {};
    try {
      body = await response.json();
    } catch {
      body = {};
    }
    if (!response.ok) {
      throw new Error(body?.message || "Unable to verify Paystack payment.");
    }

    const tx = body?.data ?? {};
    const gatewayStatus = String(tx.status ?? "").toLowerCase();
    const paidAmount = Number(tx.amount ?? 0);

    if (gatewayStatus !== "success") {
      await db
        .from("classroom_rentals")
        .update({ paystack_status: gatewayStatus || "failed" })
        .eq("id", rental.id);
      return { ok: false, status: gatewayStatus || "failed", rental };
    }
    if (paidAmount !== rental.amount_cents) {
      throw new Error("Paid amount does not match the rental price.");
    }

    const { data: updated, error: updateError } = await db
      .from("classroom_rentals")
      .update({ status: "confirmed", paystack_status: "success" })
      .eq("id", rental.id)
      .select("*")
      .single();
    if (updateError) throw new Error(updateError.message);
    return { ok: true, status: "confirmed", rental: updated };
  });

export { fmtMoney, RENTAL_RATES };