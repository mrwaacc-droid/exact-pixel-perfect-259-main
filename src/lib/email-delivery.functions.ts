import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createAuditLog, requireInstitutionAdminAccess } from "@/lib/institution-admin.foundation";
import {
  renderEmailTemplate,
  sendTransactionalEmail,
  type EmailTemplateKey,
} from "@/lib/email-service.server";

const ProcessOutboundEmailJobSchema = z.object({
  job_id: z.string().uuid(),
});

const SUPPORTED_EMAIL_TEMPLATE_KEYS = [
  "institution_member_invite",
  "institution_invite_accepted",
  "institution_owner_verify_email",
  "institution_owner_welcome",
  "admission_status_update",
  "admission_enrollment_invite",
  "session_reminder",
  "certificate_issued",
] as const;

const PreviewEmailTemplateSchema = z.object({
  templateKey: z.enum(SUPPORTED_EMAIL_TEMPLATE_KEYS),
  subject: z.string().min(1).max(300),
  recipientName: z.string().max(200).optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export const previewEmailTemplate = createServerFn({ method: "POST" })
  .validator((data: unknown) => PreviewEmailTemplateSchema.parse(data))
  .handler(async ({ data }) => {
    const rendered = renderEmailTemplate({
      templateKey: data.templateKey,
      subject: data.subject,
      recipientName: data.recipientName,
      payload: data.payload,
    });

    return rendered;
  });

export const processOutboundEmailJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => ProcessOutboundEmailJobSchema.parse(data))
  .handler(async ({ data, context }: any) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: job, error: jobError } = await supabaseAdmin
      .from("outbound_email_jobs")
      .select("*")
      .eq("id", data.job_id)
      .single();

    if (jobError || !job) {
      throw new Error(jobError?.message || "Email job not found.");
    }

    if (!job.institution_id) {
      throw new Error("Email job is missing institution context.");
    }

    const access = await requireInstitutionAdminAccess(
      supabaseAdmin,
      job.institution_id,
      context.userId,
    );

    if (!["pending", "failed"].includes(job.status)) {
      throw new Error(`Email job cannot be processed from status: ${job.status}`);
    }

    const { error: markProcessingError } = await supabaseAdmin
      .from("outbound_email_jobs")
      .update({
        status: "processing",
        last_error: null,
        attempt_count: (job.attempt_count ?? 0) + 1,
      })
      .eq("id", job.id);

    if (markProcessingError) {
      throw new Error(markProcessingError.message);
    }

    try {
      if (!job.template_key) {
        throw new Error("Email job has no template_key.");
      }

      if (!(SUPPORTED_EMAIL_TEMPLATE_KEYS as readonly string[]).includes(job.template_key)) {
        throw new Error(`Unsupported email template: ${job.template_key}`);
      }
      const templateKey = job.template_key as EmailTemplateKey;

      const rendered = renderEmailTemplate({
        templateKey,
        subject: job.subject,
        recipientName: job.to_name,
        payload:
          job.payload_json && typeof job.payload_json === "object" && !Array.isArray(job.payload_json)
            ? (job.payload_json as Record<string, unknown>)
            : {},
      });

      const delivery = await sendTransactionalEmail({
        toEmail: job.to_email,
        toName: job.to_name,
        subject: job.subject,
        html: rendered.html,
        text: rendered.text,
        replyTo: rendered.replyTo,
      });

      const sentAt = new Date().toISOString();
      const { data: updatedJob, error: sentError } = await supabaseAdmin
        .from("outbound_email_jobs")
        .update({
          status: "sent",
          sent_at: sentAt,
          provider: delivery.provider,
          last_error: null,
          payload_json: {
            ...(job.payload_json && typeof job.payload_json === "object" && !Array.isArray(job.payload_json)
              ? job.payload_json
              : {}),
            provider_message_id: delivery.providerMessageId,
          },
        })
        .eq("id", job.id)
        .select("*")
        .single();

      if (sentError) {
        throw new Error(sentError.message);
      }

      await createAuditLog(supabaseAdmin, {
        institutionId: job.institution_id,
        actorUserId: context.userId,
        actorRole: access.role,
        action: "email_job.sent",
        entityType: "outbound_email_job",
        entityId: job.id,
        summary: `Sent email job ${job.id} to ${job.to_email}`,
        details: { provider: delivery.provider, provider_message_id: delivery.providerMessageId },
      });

      return { job: updatedJob };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown email delivery error.";

      await supabaseAdmin
        .from("outbound_email_jobs")
        .update({
          status: "failed",
          last_error: message.slice(0, 4000),
        })
        .eq("id", job.id);

      await createAuditLog(supabaseAdmin, {
        institutionId: job.institution_id,
        actorUserId: context.userId,
        actorRole: access.role,
        action: "email_job.failed",
        entityType: "outbound_email_job",
        entityId: job.id,
        summary: `Email job ${job.id} failed`,
        details: { error: message.slice(0, 1000) },
      });

      throw error;
    }
  });
