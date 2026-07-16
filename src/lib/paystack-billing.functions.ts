import { createServerFn } from "@tanstack/react-start";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireInstitutionAdminAccess } from "@/lib/institution-admin.foundation";
import { createAuditLog } from "@/lib/institution-admin.foundation";
import type { Json } from "@/integrations/supabase/types";

const BILLING_AMOUNT_MINOR_FALLBACK = 0;
const FALLBACK_CURRENCY = "NGN";
type JsonObject = { [key: string]: Json | undefined };

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

function toMinorUnits(amount: unknown): number {
  if (amount === null || amount === undefined) return BILLING_AMOUNT_MINOR_FALLBACK;
  const parsed = typeof amount === "string" ? Number(amount) : amount;
  if (typeof parsed !== "number") return BILLING_AMOUNT_MINOR_FALLBACK;
  if (!Number.isFinite(parsed)) return BILLING_AMOUNT_MINOR_FALLBACK;
  return Math.round(parsed);
}

function normalizeCurrency(input?: string | null): string {
  return (input || FALLBACK_CURRENCY).toUpperCase();
}

function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function extractPaystackEvent(body: Record<string, unknown>) {
  const event = typeof body?.event === "string" ? body.event : "";
  const data = (body?.data ?? {}) as Record<string, unknown>;
  return { event, data };
}

function normalizeStatus(status: unknown): "success" | "pending" | "failed" | "abandoned" {
  if (typeof status !== "string") return "pending";
  const lower = status.toLowerCase();
  if (lower === "success") return "success";
  if (lower === "failed") return "failed";
  if (lower === "abandoned") return "abandoned";
  return "pending";
}

function readCustomerEmail(customer: unknown): string | null {
  if (!customer || typeof customer !== "object") return null;
  const email = (customer as { email?: unknown }).email;
  return typeof email === "string" ? email : null;
}

function asJsonObject(value: Record<string, unknown>): JsonObject {
  return value as JsonObject;
}

function normalizeSubscriptionStatus(
  status: unknown,
): "active" | "past_due" | "canceled" | "expired" {
  if (typeof status !== "string") return "active";
  const lower = status.toLowerCase();
  if (lower === "canceled" || lower === "cancelled") return "canceled";
  if (lower === "expired") return "expired";
  if (lower === "past_due" || lower === "past-due" || lower === "pastdue") return "past_due";
  return "active";
}

export type PaystackPlan = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  amountMinor: number;
  currency: string;
  interval: string;
  highlight: boolean;
  features: string[];
  status: string;
};

function mapPlan(row: Record<string, unknown>): PaystackPlan {
  const rawFeatures = row.features;
  const features = Array.isArray(rawFeatures) ? (rawFeatures as unknown[]).map(String) : [];
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? ""),
    name: String(row.name ?? ""),
    description: (row.description as string) ?? null,
    amountMinor: toMinorUnits(row.amount_minor),
    currency: normalizeCurrency(row.currency as string),
    interval: String(row.interval ?? "month"),
    highlight: Boolean(row.highlight),
    features,
    status: String(row.status ?? "active"),
  };
}

export type BillingOverview = {
  institutionId: string;
  planSlug: string | null;
  preferredCurrency: string;
  providerCustomerCode: string | null;
  lastReference: string | null;
  subscription: {
    id: string;
    planSlug: string;
    status: string;
    billingSource: string;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    providerReference: string | null;
    reference: string | null;
  } | null;
  recentTransactions: Array<{
    id: string;
    reference: string;
    status: string;
    amountMinor: number;
    currency: string;
    channel: string | null;
    paidAt: string | null;
  }>;
  activePlan: PaystackPlan | null;
};

export type PaystackCheckoutResult = {
  reference: string;
  authorizationUrl: string;
  accessCode: string;
  amountMinor: number;
  currency: string;
  planSlug: string;
};

export type PaystackVerificationResult = {
  reference: string;
  status: string;
  paidAt: string | null;
  amountMinor: number;
  currency: string;
  channel: string | null;
  providerReference: string | null;
  subscriptionStatus: string;
};

export type WebhookResult = {
  ok: boolean;
  event: string;
  handled: boolean;
};

export type UpsertPaystackCustomerInput = {
  institutionId: string;
  planSlug: string;
  currency?: string;
  email?: string;
};

const CustomerSchema = z.object({
  institutionId: z.string().uuid(),
  planSlug: z.string().min(1).max(100),
  currency: z.string().min(1).max(10).optional(),
  email: z.string().email().optional(),
});

export async function upsertPaystackCustomerRecord(
  supabaseAdmin: Awaited<ReturnType<typeof getAdminClient>>,
  input: UpsertPaystackCustomerInput,
) {
  return supabaseAdmin
    .from("billing_customers")
    .upsert(
      {
        institution_id: input.institutionId,
        email: input.email ?? null,
        plan_slug: input.planSlug,
        preferred_currency: normalizeCurrency(input.currency),
        provider: "paystack",
        metadata_json: { updated_at: new Date().toISOString() },
      },
      { onConflict: "institution_id" },
    )
    .select("institution_id, plan_slug, preferred_currency, provider_customer_code, last_reference")
    .single();
}

export async function upsertPaymentTransaction(
  supabaseAdmin: Awaited<ReturnType<typeof getAdminClient>>,
  input: {
    institutionId: string;
    reference: string;
    status: "initialized" | "pending" | "success" | "failed" | "abandoned";
    amountMinor: number;
    currency: string;
    subscriptionId?: string | null;
    providerReference?: string | null;
    channel?: string | null;
    customerEmail?: string | null;
    paidAt?: string | null;
    rawResponse?: Json;
  },
) {
  return supabaseAdmin
    .from("payment_transactions")
    .upsert(
      {
        institution_id: input.institutionId,
        subscription_id: input.subscriptionId ?? null,
        reference: input.reference,
        provider_reference: input.providerReference ?? null,
        channel: input.channel ?? null,
        amount_minor: toMinorUnits(input.amountMinor),
        currency: normalizeCurrency(input.currency),
        status: input.status,
        customer_email: input.customerEmail ?? null,
        paid_at: input.paidAt ?? null,
        raw_response: input.rawResponse ?? {},
        metadata_json: { updated_at: new Date().toISOString() },
      },
      { onConflict: "reference" },
    )
    .select("id, reference, status")
    .single();
}

export async function activateInstitutionSubscription(
  supabaseAdmin: Awaited<ReturnType<typeof getAdminClient>>,
  input: {
    institutionId: string;
    planSlug: string;
    reference?: string | null;
    providerReference?: string | null;
    billingSource?: "paystack" | "invoice" | "manual";
    currentPeriodStart?: string | null;
    currentPeriodEnd?: string | null;
    status?: "active" | "past_due" | "canceled" | "expired";
  },
) {
  const planResult = await supabaseAdmin
    .from("subscription_plans")
    .select("id, slug")
    .eq("slug", input.planSlug)
    .eq("status", "active")
    .maybeSingle();

  if (planResult.error) throw new Error(planResult.error.message);
  if (!planResult.data) throw new Error(`Plan ${input.planSlug} is not available.`);

  const now = new Date().toISOString();
  const insertResult = await supabaseAdmin
    .from("institution_subscriptions")
    .insert({
      institution_id: input.institutionId,
      plan_id: planResult.data.id,
      status: input.status ?? "active",
      billing_source: input.billingSource ?? "paystack",
      current_period_start: input.currentPeriodStart ?? now,
      current_period_end: input.currentPeriodEnd ?? null,
      reference: input.reference ?? null,
      provider_reference: input.providerReference ?? null,
      metadata_json: { updated_at: now },
    })
    .select("id, plan_id, status")
    .single();

  if (insertResult.error) throw new Error(insertResult.error.message);
  return insertResult.data;
}

async function getAdminClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function randomReference(prefix = "klassruum"): string {
  return `${prefix}_${Date.now()}_${randomUUID()}`;
}

export const getBillingPlans = createServerFn({ method: "GET" }).handler(async () => {
  const supabaseAdmin = await getAdminClient();
  const result = await supabaseAdmin
    .from("subscription_plans")
    .select("*")
    .eq("status", "active")
    .order("amount_minor", { ascending: true });

  if (result.error) throw new Error(result.error.message);
  return { plans: (result.data ?? []).map(mapPlan) };
});

export const getBillingOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: { institutionId: string }) =>
    z.object({ institutionId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }: any) => {
    const supabaseAdmin = await getAdminClient();
    await requireInstitutionAdminAccess(supabaseAdmin, data.institutionId, context.userId);

    const [customerResult, subscriptionResult, transactionResult] = await Promise.all([
      supabaseAdmin
        .from("billing_customers")
        .select(
          "institution_id, plan_slug, preferred_currency, provider_customer_code, last_reference",
        )
        .eq("institution_id", data.institutionId)
        .maybeSingle(),
      supabaseAdmin
        .from("institution_subscriptions")
        .select(
          "id, institution_id, plan_id, status, billing_source, current_period_start, current_period_end, provider_reference, reference, plan:subscription_plans(slug)",
        )
        .eq("institution_id", data.institutionId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabaseAdmin
        .from("payment_transactions")
        .select("id, reference, status, amount_minor, currency, channel, paid_at")
        .eq("institution_id", data.institutionId)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    if (customerResult.error) throw new Error(customerResult.error.message);
    if (subscriptionResult.error) throw new Error(subscriptionResult.error.message);
    if (transactionResult.error) throw new Error(transactionResult.error.message);

    const customer = customerResult.data ?? null;
    const subscription = subscriptionResult.data ?? null;
    const recentTransactions = (transactionResult.data ?? []).map((transaction) => ({
      id: String(transaction.id ?? ""),
      reference: String(transaction.reference ?? ""),
      status: String(transaction.status ?? "pending"),
      amountMinor: toMinorUnits(transaction.amount_minor),
      currency: normalizeCurrency(transaction.currency as string),
      channel: (transaction.channel as string) ?? null,
      paidAt: (transaction.paid_at as string) ?? null,
    }));

    const activePlanSlug =
      subscription?.status === "active" || subscription?.status === "past_due"
        ? (((subscription.plan as Record<string, unknown> | null)?.slug as string) ?? null)
        : null;

    let activePlan: PaystackPlan | null = null;
    if (activePlanSlug) {
      const planResult = await supabaseAdmin
        .from("subscription_plans")
        .select("*")
        .eq("slug", activePlanSlug)
        .maybeSingle();
      if (planResult.data) {
        activePlan = mapPlan(planResult.data);
      }
    }

    return {
      institutionId: data.institutionId,
      planSlug: customer?.plan_slug ?? null,
      preferredCurrency: normalizeCurrency(customer?.preferred_currency),
      providerCustomerCode: customer?.provider_customer_code ?? null,
      lastReference: customer?.last_reference ?? null,
      subscription: subscription
        ? {
            id: String(subscription.id ?? ""),
            planSlug:
              ((subscription.plan as Record<string, unknown> | null)?.slug as string) ?? "starter",
            status: String(subscription.status ?? "trialing"),
            billingSource: String(subscription.billing_source ?? "manual"),
            currentPeriodStart: (subscription.current_period_start as string) ?? null,
            currentPeriodEnd: (subscription.current_period_end as string) ?? null,
            providerReference: (subscription.provider_reference as string) ?? null,
            reference: (subscription.reference as string) ?? null,
          }
        : null,
      recentTransactions,
      activePlan,
    } satisfies BillingOverview;
  });

export const initializePaystackCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        institutionId: z.string().uuid(),
        planSlug: z.string().min(1).max(100),
        currency: z.string().min(1).max(10).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }: any) => {
    const supabaseAdmin = await getAdminClient();
    const membership = await requireInstitutionAdminAccess(
      supabaseAdmin,
      data.institutionId,
      context.userId,
    );

    const institutionResult = await supabaseAdmin
      .from("institutions")
      .select("id, name, contact_email")
      .eq("id", data.institutionId)
      .single();
    if (institutionResult.error) throw new Error(institutionResult.error.message);

    const planResult = await supabaseAdmin
      .from("subscription_plans")
      .select("*")
      .eq("slug", data.planSlug)
      .eq("status", "active")
      .maybeSingle();
    if (planResult.error) throw new Error(planResult.error.message);
    if (!planResult.data) throw new Error("Selected plan is not available.");

    const plan = mapPlan(planResult.data);
    const reference = randomReference("paystack");
    const amountMinor = plan.amountMinor;
    const currency = normalizeCurrency(data.currency ?? plan.currency);

    const customerEmail =
      (institutionResult.data.contact_email as string) ||
      (membership.email as string) ||
      (context.claims?.email as string) ||
      context.userId;

    await upsertPaystackCustomerRecord(supabaseAdmin, {
      institutionId: data.institutionId,
      planSlug: plan.slug,
      currency,
      email: customerEmail,
    });

    await supabaseAdmin
      .from("billing_customers")
      .update({ last_reference: reference })
      .eq("institution_id", data.institutionId);

    await upsertPaymentTransaction(supabaseAdmin, {
      institutionId: data.institutionId,
      reference,
      status: "initialized",
      amountMinor,
      currency,
      customerEmail,
    });

    const secretKey = requireEnv("PAYSTACK_SECRET_KEY");
    const appUrl =
      process.env.APP_URL ||
      process.env.VITE_APP_URL ||
      process.env.PUBLIC_APP_URL ||
      "https://klassruum.co.ke";
    const callbackUrl = `${appUrl}/institution/billing?reference=${encodeURIComponent(reference)}`;

    const payload = {
      email: customerEmail,
      amount: amountMinor,
      currency,
      reference,
      callback_url: callbackUrl,
      metadata: {
        institution_id: data.institutionId,
        plan_slug: plan.slug,
        membership_role: membership.role,
        source: "klassruum_billing",
      },
    };

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseBody = safeJsonParse<Record<string, unknown>>(await response.text(), {});
    if (!response.ok) {
      const gatewayMessage =
        (responseBody.message as string) || "Unable to start Paystack checkout.";
      throw new Error(gatewayMessage);
    }

    const dataNode = (responseBody.data ?? {}) as Record<string, unknown>;
    const authorizationUrl = dataNode.authorization_url as string | undefined;
    const accessCode = dataNode.access_code as string | undefined;
    if (!authorizationUrl || !accessCode) {
      throw new Error("Paystack did not return an authorization URL.");
    }

    await createAuditLog(supabaseAdmin, {
      institutionId: data.institutionId,
      actorUserId: context.userId,
      actorRole: membership.role,
      action: "billing.paystack_checkout_initialized",
      entityType: "institution_subscription",
      entityId: data.institutionId,
      summary: `Started Paystack checkout for ${plan.name}`,
      details: { reference, planSlug: plan.slug, amountMinor, currency },
    });

    return {
      reference,
      authorizationUrl,
      accessCode,
      amountMinor,
      currency,
      planSlug: plan.slug,
    } satisfies PaystackCheckoutResult;
  });

export const verifyPaystackPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        institutionId: z.string().uuid(),
        reference: z.string().min(1).max(200),
      })
      .parse(data),
  )
  .handler(async ({ data, context }: any) => {
    const supabaseAdmin = await getAdminClient();
    const membership = await requireInstitutionAdminAccess(
      supabaseAdmin,
      data.institutionId,
      context.userId,
    );

    const secretKey = requireEnv("PAYSTACK_SECRET_KEY");
    const { data: localTransaction, error: localTransactionError } = await supabaseAdmin
      .from("payment_transactions")
      .select("id, institution_id, amount_minor, currency, status")
      .eq("reference", data.reference)
      .maybeSingle();
    if (localTransactionError) throw new Error(localTransactionError.message);
    if (!localTransaction || localTransaction.institution_id !== data.institutionId) {
      throw new Error("This payment reference does not belong to the selected institution.");
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(data.reference)}`,
      {
        headers: { Authorization: `Bearer ${secretKey}` },
      },
    );

    const responseBody = safeJsonParse<Record<string, unknown>>(await response.text(), {});
    if (!response.ok) {
      const gatewayMessage =
        (responseBody.message as string) || "Unable to verify Paystack payment.";
      throw new Error(gatewayMessage);
    }

    const transaction = (responseBody.data ?? {}) as Record<string, unknown>;
    const normalizedStatus = normalizeStatus(transaction.status);
    const paidAt = typeof transaction.paid_at === "string" ? transaction.paid_at : null;
    const channel = typeof transaction.channel === "string" ? transaction.channel : null;
    const amountMinor = toMinorUnits(transaction.amount);
    const currency = normalizeCurrency(transaction.currency as string);
    const providerReference =
      typeof transaction.id === "number" || typeof transaction.id === "string"
        ? String(transaction.id)
        : null;

    const metadata = (transaction.metadata ?? {}) as Record<string, unknown>;
    const metadataInstitutionId =
      typeof metadata.institution_id === "string" ? metadata.institution_id : null;
    const planSlug = typeof metadata.plan_slug === "string" ? metadata.plan_slug : null;
    if (metadataInstitutionId !== data.institutionId || !planSlug) {
      throw new Error("Paystack metadata does not match this institution checkout.");
    }
    if (
      toMinorUnits(localTransaction.amount_minor) !== amountMinor ||
      normalizeCurrency(localTransaction.currency as string) !== currency
    ) {
      throw new Error("Paystack amount or currency does not match the initialized checkout.");
    }

    await upsertPaymentTransaction(supabaseAdmin, {
      institutionId: data.institutionId,
      reference: data.reference,
      status: normalizedStatus,
      amountMinor,
      currency,
      providerReference,
      channel,
      customerEmail: readCustomerEmail(transaction.customer),
      paidAt,
      rawResponse: asJsonObject(transaction),
    });

    let subscriptionStatus = "trialing";
    if (normalizedStatus === "success") {
      const subscriptionRecord = await activateInstitutionSubscription(supabaseAdmin, {
        institutionId: data.institutionId,
        planSlug,
        reference: data.reference,
        providerReference,
        billingSource: "paystack",
        currentPeriodStart: paidAt,
        currentPeriodEnd: null,
        status: "active",
      });

      await supabaseAdmin
        .from("payment_transactions")
        .update({ subscription_id: subscriptionRecord.id })
        .eq("reference", data.reference);

      subscriptionStatus = "active";
    } else if (normalizedStatus === "failed" || normalizedStatus === "abandoned") {
      subscriptionStatus = normalizedStatus;
    } else {
      subscriptionStatus = "pending";
    }

    await createAuditLog(supabaseAdmin, {
      institutionId: data.institutionId,
      actorUserId: context.userId,
      actorRole: membership.role,
      action: "billing.paystack_verified",
      entityType: "institution_subscription",
      entityId: data.institutionId,
      summary: `Verified Paystack reference ${data.reference} as ${normalizedStatus}`,
      details: { planSlug, providerReference, normalizedStatus, currency, amountMinor },
    });

    return {
      reference: data.reference,
      status: normalizedStatus,
      paidAt,
      amountMinor,
      currency,
      channel,
      providerReference,
      subscriptionStatus,
    } satisfies PaystackVerificationResult;
  });
