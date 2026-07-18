import { getServerConfig } from "@/lib/config.server";

export type EmailTemplateKey =
  | "institution_member_invite"
  | "institution_invite_accepted"
  | "institution_owner_verify_email"
  | "institution_owner_welcome"
  | "admission_status_update"
  | "admission_enrollment_invite"
  | "session_reminder"
  | "certificate_issued"
  | "password_reset"
  | "magic_link";

type EmailJobPayload = Record<string, unknown>;

type RenderEmailTemplateInput = {
  templateKey: EmailTemplateKey;
  subject: string;
  recipientName?: string | null;
  payload?: EmailJobPayload;
};

type RenderedEmailTemplate = {
  html: string;
  text: string;
  fromEmail: string;
  fromName: string;
  replyTo: string;
};

// NOTE: env is read lazily inside getContactDetails() (called per-request),
// never at module scope — on Workers-style runtimes env binds per-request,
// so a module-scope `process.env` read would freeze at "unset" forever.
const BRAND = {
  companyName: "Klassruum",
  supportEmail: "support@klassruum.co.ke",
  replyTo: "support@klassruum.co.ke",
  siteUrl: "https://klassruum.co.ke",
  logoUrl: "/images/auth-side.png",
  primary: "#10233f",
  secondary: "#7D2233",
  accent: "#7D2233",
  ink: "#10233f",
  muted: "#5b6b82",
  border: "#dbe6f3",
  panel: "#ffffff",
  canvas: "#f4f8fc",
  soft: "#e9f4f7",
};

function getContactDetails() {
  const contact = getServerConfig().brand;
  return {
    supportPhone: contact.supportPhone,
    address: contact.address,
    social: {
      twitter: contact.twitterUrl,
      linkedin: contact.linkedinUrl,
      instagram: contact.instagramUrl,
      facebook: contact.facebookUrl,
    },
  };
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toAbsoluteUrl(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  const appUrl = (getServerConfig().appUrl || BRAND.siteUrl).replace(/\/$/, "");
  return `${appUrl}${url.startsWith("/") ? url : `/${url}`}`;
}

function formatDate(value: unknown) {
  if (typeof value !== "string" || !value) return "Soon";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}

function getRecipientLabel(name?: string | null) {
  const cleaned = name?.trim();
  return cleaned ? escapeHtml(cleaned) : "there";
}

function renderShell(params: {
  preheader: string;
  title: string;
  eyebrow: string;
  intro: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
}) {
  const logoUrl = toAbsoluteUrl(BRAND.logoUrl);
  const contact = getContactDetails();

  const socialIcons: Array<{ href: string | null; label: string }> = [
    { href: contact.social.twitter, label: "X (Twitter)" },
    { href: contact.social.linkedin, label: "LinkedIn" },
    { href: contact.social.instagram, label: "Instagram" },
    { href: contact.social.facebook, label: "Facebook" },
  ].filter((icon): icon is { href: string; label: string } => Boolean(icon.href));

  const socialHtml = socialIcons.length
    ? `<div style="margin-top:12px;">
        ${socialIcons
          .map(
            (icon) =>
              `<a href="${escapeHtml(icon.href)}" style="display:inline-block;margin-right:14px;font-size:12px;font-weight:700;color:${BRAND.accent};text-decoration:none;">${escapeHtml(icon.label)}</a>`,
          )
          .join("")}
      </div>`
    : "";

  const contactLinesHtml = [
    contact.supportPhone
      ? `<p style="margin:0 0 6px 0;font-size:14px;line-height:1.7;color:${BRAND.muted};"><strong style="color:${BRAND.ink};">Phone:</strong> <a href="tel:${escapeHtml(contact.supportPhone.replace(/[^+\d]/g, ""))}" style="color:${BRAND.accent};text-decoration:none;font-weight:700;">${escapeHtml(contact.supportPhone)}</a></p>`
      : "",
    contact.address
      ? `<p style="margin:0 0 6px 0;font-size:14px;line-height:1.7;color:${BRAND.muted};"><strong style="color:${BRAND.ink};">Address:</strong> ${escapeHtml(contact.address)}</p>`
      : "",
  ]
    .filter(Boolean)
    .join("");

  const ctaHtml =
    params.ctaLabel && params.ctaUrl
      ? `<tr>
          <td style="padding:0 40px 28px 40px;">
            <a href="${escapeHtml(params.ctaUrl)}" style="display:inline-block;padding:14px 24px;border-radius:999px;background:linear-gradient(135deg, ${BRAND.secondary}, ${BRAND.accent});color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;box-shadow:0 12px 30px rgba(31,124,128,0.22);">${escapeHtml(params.ctaLabel)}</a>
          </td>
        </tr>`
      : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(params.title)}</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.canvas};font-family:Inter,Segoe UI,Arial,sans-serif;color:${BRAND.ink};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(params.preheader)}</div>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:${BRAND.canvas};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:680px;background:${BRAND.panel};border:1px solid ${BRAND.border};border-radius:28px;overflow:hidden;box-shadow:0 20px 60px rgba(16,35,63,0.10);">
            <tr>
              <td style="padding:0;background:linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%);">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding:28px 32px 12px 32px;">
                      <img src="${escapeHtml(logoUrl)}" alt="Klassruum" width="140" style="display:block;max-width:140px;height:auto;border:0;border-radius:18px;" />
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 32px 32px 32px;">
                      <div style="display:inline-block;padding:7px 12px;border-radius:999px;background:rgba(255,255,255,0.14);color:#dff7fb;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${escapeHtml(params.eyebrow)}</div>
                      <h1 style="margin:18px 0 10px 0;font-size:32px;line-height:1.14;color:#ffffff;letter-spacing:-0.02em;">${escapeHtml(params.title)}</h1>
                      <p style="margin:0;max-width:520px;font-size:16px;line-height:1.7;color:rgba(255,255,255,0.88);">${escapeHtml(params.intro)}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:34px 40px 10px 40px;font-size:16px;line-height:1.75;color:${BRAND.ink};">
                ${params.bodyHtml}
              </td>
            </tr>
            ${ctaHtml}
            <tr>
              <td style="padding:0 40px 36px 40px;">
                <div style="padding:18px 20px;border-radius:20px;background:${BRAND.soft};border:1px solid #d7ebf0;color:${BRAND.ink};">
                  <p style="margin:0 0 8px 0;font-size:13px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND.secondary};">Contact Klassruum</p>
                  <p style="margin:0 0 6px 0;font-size:14px;line-height:1.7;color:${BRAND.muted};">
                    Need help? Reply to this email or contact us at
                    <a href="mailto:${BRAND.supportEmail}" style="color:${BRAND.accent};text-decoration:none;font-weight:700;">${BRAND.supportEmail}</a>.
                    Visit
                    <a href="${BRAND.siteUrl}" style="color:${BRAND.accent};text-decoration:none;font-weight:700;">klassruum.co.ke</a>
                    for product and institution support.
                  </p>
                  ${contactLinesHtml}
                  ${socialHtml}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 36px 40px;">
                <p style="margin:0;font-size:12px;line-height:1.7;color:#7d8aa0;">
                  ${escapeHtml(params.footerNote || "This message was sent by Klassruum using your institution or account activity preferences.")}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderInviteTemplate(subject: string, recipientName?: string | null, payload?: EmailJobPayload) {
  const institutionName = escapeHtml(payload?.institution_name ?? "your institution");
  const role = escapeHtml(payload?.role ?? "member");
  const inviteUrl = typeof payload?.invite_url === "string" ? payload.invite_url : BRAND.siteUrl;
  const expiresAt = formatDate(payload?.expires_at);
  const personalMessage = typeof payload?.message === "string" ? payload.message.trim() : "";

  const bodyHtml = `
    <p style="margin:0 0 16px 0;">Hello ${getRecipientLabel(recipientName)},</p>
    <p style="margin:0 0 18px 0;">You have been invited to join <strong>${institutionName}</strong> on Klassruum as a <strong style="text-transform:capitalize;">${role}</strong>.</p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 20px 0;border-collapse:separate;border-spacing:0;">
      <tr>
        <td style="padding:18px 20px;border:1px solid ${BRAND.border};border-radius:20px;background:#fbfdff;">
          <p style="margin:0 0 8px 0;font-size:13px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND.secondary};">Invitation details</p>
          <p style="margin:0 0 6px 0;"><strong>Institution:</strong> ${institutionName}</p>
          <p style="margin:0 0 6px 0;"><strong>Role:</strong> <span style="text-transform:capitalize;">${role}</span></p>
          <p style="margin:0;"><strong>Expires:</strong> ${escapeHtml(expiresAt)}</p>
        </td>
      </tr>
    </table>
    ${personalMessage ? `<div style="margin:0 0 20px 0;padding:18px 20px;border-left:4px solid ${BRAND.secondary};border-radius:14px;background:#f8fbfd;color:${BRAND.muted};"><strong style="color:${BRAND.ink};">Personal note</strong><p style="margin:8px 0 0 0;white-space:pre-wrap;">${escapeHtml(personalMessage)}</p></div>` : ""}
    <p style="margin:0 0 16px 0;">Use the button below to sign in with Google or email and complete your access securely.</p>
  `;

  const text = [
    `Hello ${recipientName?.trim() || "there"},`,
    "",
    `You have been invited to join ${String(payload?.institution_name ?? "your institution")} on Klassruum as a ${String(payload?.role ?? "member")}.`,
    `Expires: ${expiresAt}`,
    personalMessage ? `Message: ${personalMessage}` : "",
    "",
    `Accept invite: ${inviteUrl}`,
    `Support: ${BRAND.supportEmail}`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    html: renderShell({
      preheader: `Invitation to join ${String(payload?.institution_name ?? "Klassruum")}`,
      title: `You're invited to ${institutionName}`,
      eyebrow: "Institution access",
      intro: "Securely join your Klassruum institution, complete your setup, and start learning or teaching with the right permissions.",
      bodyHtml,
      ctaLabel: "Accept invitation",
      ctaUrl: inviteUrl,
      footerNote: "This invitation was generated from Klassruum on behalf of an institution administrator.",
    }),
    text,
    fromEmail: BRAND.supportEmail,
    fromName: "Klassruum Support",
    replyTo: BRAND.replyTo,
  } satisfies RenderedEmailTemplate;
}

function renderAcceptedTemplate(subject: string, recipientName?: string | null, payload?: EmailJobPayload) {
  const acceptedAt = formatDate(payload?.accepted_at);
  const role = escapeHtml(payload?.role ?? "member");
  const dashboardUrl = toAbsoluteUrl("/auth");

  const bodyHtml = `
    <p style="margin:0 0 16px 0;">Hello ${getRecipientLabel(recipientName)},</p>
    <p style="margin:0 0 18px 0;">Your institution invitation has been accepted successfully. Your Klassruum access is now active.</p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 20px 0;border-collapse:separate;border-spacing:0;">
      <tr>
        <td style="padding:18px 20px;border:1px solid ${BRAND.border};border-radius:20px;background:#fbfdff;">
          <p style="margin:0 0 8px 0;font-size:13px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND.secondary};">Access confirmed</p>
          <p style="margin:0 0 6px 0;"><strong>Role:</strong> <span style="text-transform:capitalize;">${role}</span></p>
          <p style="margin:0;"><strong>Activated:</strong> ${escapeHtml(acceptedAt)}</p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 16px 0;">You can now continue to your Klassruum workspace and start using your institution dashboard.</p>
  `;

  const text = [
    `Hello ${recipientName?.trim() || "there"},`,
    "",
    "Your institution invitation has been accepted successfully.",
    `Role: ${String(payload?.role ?? "member")}`,
    `Activated: ${acceptedAt}`,
    "",
    `Open Klassruum: ${dashboardUrl}`,
    `Support: ${BRAND.supportEmail}`,
  ].join("\n");

  return {
    html: renderShell({
      preheader: "Your institution access is now active.",
      title: "Access confirmed",
      eyebrow: "Account ready",
      intro: "Your Klassruum institution invitation is complete and your account is ready to use.",
      bodyHtml,
      ctaLabel: "Open Klassruum",
      ctaUrl: dashboardUrl,
      footerNote: "This confirmation was sent automatically after your Klassruum institution access was activated.",
    }),
    text,
    fromEmail: BRAND.supportEmail,
    fromName: "Klassruum Support",
    replyTo: BRAND.replyTo,
  } satisfies RenderedEmailTemplate;
}

function renderOwnerVerifyTemplate(
  subject: string,
  recipientName?: string | null,
  payload?: EmailJobPayload,
) {
  const institutionName = escapeHtml(payload?.institution_name ?? "your institution");
  const verificationUrl =
    typeof payload?.verification_url === "string"
      ? payload.verification_url
      : toAbsoluteUrl("/auth/verify-email");

  const bodyHtml = `
    <p style="margin:0 0 16px 0;">Hello ${getRecipientLabel(recipientName)},</p>
    <p style="margin:0 0 18px 0;">Your Klassruum institution workspace for <strong>${institutionName}</strong> has been created. Verify your email before opening the institution dashboard.</p>
    <p style="margin:0 0 16px 0;">This protects your workspace and prevents automated signups from activating owner accounts.</p>
  `;

  const text = [
    `Hello ${recipientName?.trim() || "there"},`,
    "",
    `Your Klassruum institution workspace for ${String(payload?.institution_name ?? "your institution")} has been created.`,
    "Verify your email before opening the institution dashboard.",
    "",
    `Verify email: ${verificationUrl}`,
    `Support: ${BRAND.supportEmail}`,
  ].join("\n");

  return {
    html: renderShell({
      preheader: "Verify your Klassruum institution owner account.",
      title: "Verify your institution account",
      eyebrow: "Email verification",
      intro: "Confirm this email address to activate your owner access and continue setup securely.",
      bodyHtml,
      ctaLabel: "Verify email",
      ctaUrl: verificationUrl,
      footerNote: "This verification email was generated after a Klassruum institution registration.",
    }),
    text,
    fromEmail: BRAND.supportEmail,
    fromName: "Klassruum Support",
    replyTo: BRAND.replyTo,
  } satisfies RenderedEmailTemplate;
}

function renderOwnerWelcomeTemplate(
  subject: string,
  recipientName?: string | null,
  payload?: EmailJobPayload,
) {
  const institutionName = escapeHtml(payload?.institution_name ?? "your institution");
  const dashboardUrl = toAbsoluteUrl("/institution/dashboard");
  const nextSteps = Array.isArray(payload?.next_steps) ? payload.next_steps.map(String) : [];
  const stepsHtml = nextSteps.length
    ? `<ul style="margin:0 0 18px 20px;padding:0;">${nextSteps
        .map((step) => `<li style="margin:0 0 8px 0;">${escapeHtml(step)}</li>`)
        .join("")}</ul>`
    : "";

  const bodyHtml = `
    <p style="margin:0 0 16px 0;">Hello ${getRecipientLabel(recipientName)},</p>
    <p style="margin:0 0 18px 0;">Welcome to Klassruum. Your workspace for <strong>${institutionName}</strong> is ready for setup once your email is verified.</p>
    ${stepsHtml}
  `;

  const text = [
    `Hello ${recipientName?.trim() || "there"},`,
    "",
    `Welcome to Klassruum. Your workspace for ${String(payload?.institution_name ?? "your institution")} is ready for setup once your email is verified.`,
    ...nextSteps.map((step) => `- ${step}`),
    "",
    `Dashboard: ${dashboardUrl}`,
    `Support: ${BRAND.supportEmail}`,
  ].join("\n");

  return {
    html: renderShell({
      preheader: `Welcome to Klassruum for ${String(payload?.institution_name ?? "your institution")}.`,
      title: "Your institution workspace is ready",
      eyebrow: "Welcome",
      intro: "Set up courses, invite your team, and prepare governed AI classrooms after verification.",
      bodyHtml,
      ctaLabel: "Open dashboard",
      ctaUrl: dashboardUrl,
      footerNote: "You received this message because an institution workspace was registered on Klassruum.",
    }),
    text,
    fromEmail: BRAND.supportEmail,
    fromName: "Klassruum Support",
    replyTo: BRAND.replyTo,
  } satisfies RenderedEmailTemplate;
}

function renderAdmissionStatusTemplate(
  subject: string,
  recipientName?: string | null,
  payload?: EmailJobPayload,
) {
  const status = escapeHtml(payload?.status ?? "updated");
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  const signInUrl = toAbsoluteUrl("/auth");

  const bodyHtml = `
    <p style="margin:0 0 16px 0;">Hello ${getRecipientLabel(recipientName)},</p>
    <p style="margin:0 0 18px 0;">Your admission application status has changed to <strong style="text-transform:capitalize;">${status}</strong>.</p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 20px 0;border-collapse:separate;border-spacing:0;">
      <tr>
        <td style="padding:18px 20px;border:1px solid ${BRAND.border};border-radius:20px;background:#fbfdff;">
          <p style="margin:0 0 8px 0;font-size:13px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND.secondary};">Application status</p>
          <p style="margin:0;"><strong>Status:</strong> <span style="text-transform:capitalize;">${status}</span></p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 16px 0;">Sign in to your Klassruum account for the full details and any next steps.</p>
  `;

  const text = [
    `Hello ${recipientName?.trim() || "there"},`,
    "",
    `Your admission application status has changed to ${String(payload?.status ?? "updated")}.`,
    "",
    `Sign in: ${signInUrl}`,
    `Support: ${BRAND.supportEmail}`,
  ].join("\n");

  return {
    html: renderShell({
      preheader: `Your admission application is now ${status}.`,
      title: `Application ${statusLabel}`,
      eyebrow: "Admissions",
      intro: "Here's the latest update on your Klassruum admission application.",
      bodyHtml,
      ctaLabel: "Sign in to Klassruum",
      ctaUrl: signInUrl,
      footerNote: "This update was sent automatically after your admission application status changed.",
    }),
    text,
    fromEmail: BRAND.supportEmail,
    fromName: "Klassruum Support",
    replyTo: BRAND.replyTo,
  } satisfies RenderedEmailTemplate;
}

function renderAdmissionEnrollmentInviteTemplate(
  subject: string,
  recipientName?: string | null,
  payload?: EmailJobPayload,
) {
  const courseTitle = escapeHtml(payload?.course_title ?? "your course");
  const inviteUrl = typeof payload?.invite_url === "string" ? payload.invite_url : BRAND.siteUrl;

  const bodyHtml = `
    <p style="margin:0 0 16px 0;">Hello ${getRecipientLabel(recipientName)},</p>
    <p style="margin:0 0 18px 0;">Your admission application has been accepted. Complete your enrollment for <strong>${courseTitle}</strong> to get started.</p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 20px 0;border-collapse:separate;border-spacing:0;">
      <tr>
        <td style="padding:18px 20px;border:1px solid ${BRAND.border};border-radius:20px;background:#fbfdff;">
          <p style="margin:0 0 8px 0;font-size:13px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND.secondary};">Enrollment details</p>
          <p style="margin:0;"><strong>Course:</strong> ${courseTitle}</p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 16px 0;">Use the button below to set up your account and complete enrollment securely.</p>
  `;

  const text = [
    `Hello ${recipientName?.trim() || "there"},`,
    "",
    `Your admission application has been accepted. Complete your enrollment for ${String(payload?.course_title ?? "your course")}.`,
    "",
    `Complete enrollment: ${inviteUrl}`,
    `Support: ${BRAND.supportEmail}`,
  ].join("\n");

  return {
    html: renderShell({
      preheader: `Complete your enrollment for ${String(payload?.course_title ?? "your course")}.`,
      title: `Complete your enrollment`,
      eyebrow: "Admissions",
      intro: "You're one step away from starting your course on Klassruum.",
      bodyHtml,
      ctaLabel: "Complete enrollment",
      ctaUrl: inviteUrl,
      footerNote: "This invitation was generated after your admission application was accepted.",
    }),
    text,
    fromEmail: BRAND.supportEmail,
    fromName: "Klassruum Support",
    replyTo: BRAND.replyTo,
  } satisfies RenderedEmailTemplate;
}

function renderSessionReminderTemplate(
  subject: string,
  recipientName?: string | null,
  payload?: EmailJobPayload,
) {
  const title = escapeHtml(payload?.title ?? "your session");
  const startsAt = formatDate(payload?.starts_at);
  const sessionId = typeof payload?.session_id === "string" ? payload.session_id : "";
  const joinUrl = toAbsoluteUrl(sessionId ? `/classroom/session/${sessionId}` : "/student/dashboard");

  const bodyHtml = `
    <p style="margin:0 0 16px 0;">Hello ${getRecipientLabel(recipientName)},</p>
    <p style="margin:0 0 18px 0;">This is a reminder that <strong>${title}</strong> is coming up.</p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 20px 0;border-collapse:separate;border-spacing:0;">
      <tr>
        <td style="padding:18px 20px;border:1px solid ${BRAND.border};border-radius:20px;background:#fbfdff;">
          <p style="margin:0 0 8px 0;font-size:13px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND.secondary};">Session details</p>
          <p style="margin:0 0 6px 0;"><strong>Session:</strong> ${title}</p>
          <p style="margin:0;"><strong>Starts:</strong> ${escapeHtml(startsAt)}</p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 16px 0;">Join a few minutes early to make sure your camera and microphone are ready.</p>
  `;

  const text = [
    `Hello ${recipientName?.trim() || "there"},`,
    "",
    `Reminder: ${String(payload?.title ?? "your session")} is coming up.`,
    `Starts: ${startsAt}`,
    "",
    `Join session: ${joinUrl}`,
    `Support: ${BRAND.supportEmail}`,
  ].join("\n");

  return {
    html: renderShell({
      preheader: `Reminder: ${String(payload?.title ?? "your session")} is coming up.`,
      title: "Upcoming session reminder",
      eyebrow: "Classroom",
      intro: "Your Klassruum session is coming up soon.",
      bodyHtml,
      ctaLabel: "Join session",
      ctaUrl: joinUrl,
      footerNote: "This reminder was sent automatically ahead of your scheduled Klassruum session.",
    }),
    text,
    fromEmail: BRAND.supportEmail,
    fromName: "Klassruum Support",
    replyTo: BRAND.replyTo,
  } satisfies RenderedEmailTemplate;
}

function renderCertificateIssuedTemplate(
  subject: string,
  recipientName?: string | null,
  payload?: EmailJobPayload,
) {
  const certificateNumber = escapeHtml(payload?.certificate_number ?? "");
  const verificationCode = escapeHtml(payload?.verification_code ?? "");
  const dashboardUrl = toAbsoluteUrl("/student/dashboard");

  const bodyHtml = `
    <p style="margin:0 0 16px 0;">Hello ${getRecipientLabel(recipientName)},</p>
    <p style="margin:0 0 18px 0;">Congratulations! Your Klassruum certificate is ready.</p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 20px 0;border-collapse:separate;border-spacing:0;">
      <tr>
        <td style="padding:18px 20px;border:1px solid ${BRAND.border};border-radius:20px;background:#fbfdff;">
          <p style="margin:0 0 8px 0;font-size:13px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND.secondary};">Certificate details</p>
          <p style="margin:0 0 6px 0;"><strong>Certificate number:</strong> ${certificateNumber}</p>
          <p style="margin:0;"><strong>Verification code:</strong> ${verificationCode}</p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 16px 0;">Sign in to your dashboard to view and download your certificate.</p>
  `;

  const text = [
    `Hello ${recipientName?.trim() || "there"},`,
    "",
    "Congratulations! Your Klassruum certificate is ready.",
    `Certificate number: ${String(payload?.certificate_number ?? "")}`,
    `Verification code: ${String(payload?.verification_code ?? "")}`,
    "",
    `Open dashboard: ${dashboardUrl}`,
    `Support: ${BRAND.supportEmail}`,
  ].join("\n");

  return {
    html: renderShell({
      preheader: "Your Klassruum certificate is ready.",
      title: "Your certificate is ready",
      eyebrow: "Certification",
      intro: "You've completed your course. Your certificate is ready to view and download.",
      bodyHtml,
      ctaLabel: "Open dashboard",
      ctaUrl: dashboardUrl,
      footerNote: "This message was sent automatically after a Klassruum certificate was issued.",
    }),
    text,
    fromEmail: BRAND.supportEmail,
    fromName: "Klassruum Support",
    replyTo: BRAND.replyTo,
  } satisfies RenderedEmailTemplate;
}

function renderPasswordResetTemplate(
  subject: string,
  recipientName?: string | null,
  payload?: EmailJobPayload,
) {
  const resetUrl =
    typeof payload?.reset_url === "string" ? payload.reset_url : toAbsoluteUrl("/auth/reset-password");

  const bodyHtml = `
    <p style="margin:0 0 16px 0;">Hello ${getRecipientLabel(recipientName)},</p>
    <p style="margin:0 0 18px 0;">We received a request to reset your Klassruum account password. Use the button below to choose a new one.</p>
    <div style="margin:0 0 20px 0;padding:18px 20px;border-left:4px solid ${BRAND.secondary};border-radius:14px;background:#f8fbfd;color:${BRAND.muted};">
      <p style="margin:0;font-size:14px;">This link expires shortly and can only be used once. If you didn't request a password reset, you can safely ignore this email — your password will not be changed.</p>
    </div>
  `;

  const text = [
    `Hello ${recipientName?.trim() || "there"},`,
    "",
    "We received a request to reset your Klassruum account password.",
    "If you didn't request this, you can safely ignore this email.",
    "",
    `Reset your password: ${resetUrl}`,
    `Support: ${BRAND.supportEmail}`,
  ].join("\n");

  return {
    html: renderShell({
      preheader: "Reset your Klassruum password.",
      title: "Reset your password",
      eyebrow: "Account security",
      intro: "Choose a new password to regain secure access to your Klassruum account.",
      bodyHtml,
      ctaLabel: "Reset password",
      ctaUrl: resetUrl,
      footerNote: "This message was sent because a password reset was requested for this account.",
    }),
    text,
    fromEmail: BRAND.supportEmail,
    fromName: "Klassruum Support",
    replyTo: BRAND.replyTo,
  } satisfies RenderedEmailTemplate;
}

function renderMagicLinkTemplate(
  subject: string,
  recipientName?: string | null,
  payload?: EmailJobPayload,
) {
  const magicUrl =
    typeof payload?.magic_url === "string" ? payload.magic_url : toAbsoluteUrl("/auth");

  const bodyHtml = `
    <p style="margin:0 0 16px 0;">Hello ${getRecipientLabel(recipientName)},</p>
    <p style="margin:0 0 18px 0;">Use the button below to sign in to Klassruum instantly — no password needed.</p>
    <div style="margin:0 0 20px 0;padding:18px 20px;border-left:4px solid ${BRAND.secondary};border-radius:14px;background:#f8fbfd;color:${BRAND.muted};">
      <p style="margin:0;font-size:14px;">This link expires shortly and can only be used once. If you didn't request it, you can safely ignore this email.</p>
    </div>
  `;

  const text = [
    `Hello ${recipientName?.trim() || "there"},`,
    "",
    "Use the link below to sign in to Klassruum instantly.",
    "If you didn't request this, you can safely ignore this email.",
    "",
    `Sign in: ${magicUrl}`,
    `Support: ${BRAND.supportEmail}`,
  ].join("\n");

  return {
    html: renderShell({
      preheader: "Your Klassruum sign-in link.",
      title: "Your sign-in link",
      eyebrow: "Secure sign-in",
      intro: "One click and you're in — no password required.",
      bodyHtml,
      ctaLabel: "Sign in to Klassruum",
      ctaUrl: magicUrl,
      footerNote: "This message was sent because a passwordless sign-in link was requested for this account.",
    }),
    text,
    fromEmail: BRAND.supportEmail,
    fromName: "Klassruum Support",
    replyTo: BRAND.replyTo,
  } satisfies RenderedEmailTemplate;
}

export function renderEmailTemplate(input: RenderEmailTemplateInput): RenderedEmailTemplate {
  switch (input.templateKey) {
    case "institution_member_invite":
      return renderInviteTemplate(input.subject, input.recipientName, input.payload);
    case "institution_invite_accepted":
      return renderAcceptedTemplate(input.subject, input.recipientName, input.payload);
    case "institution_owner_verify_email":
      return renderOwnerVerifyTemplate(input.subject, input.recipientName, input.payload);
    case "institution_owner_welcome":
      return renderOwnerWelcomeTemplate(input.subject, input.recipientName, input.payload);
    case "admission_status_update":
      return renderAdmissionStatusTemplate(input.subject, input.recipientName, input.payload);
    case "admission_enrollment_invite":
      return renderAdmissionEnrollmentInviteTemplate(input.subject, input.recipientName, input.payload);
    case "session_reminder":
      return renderSessionReminderTemplate(input.subject, input.recipientName, input.payload);
    case "certificate_issued":
      return renderCertificateIssuedTemplate(input.subject, input.recipientName, input.payload);
    case "password_reset":
      return renderPasswordResetTemplate(input.subject, input.recipientName, input.payload);
    case "magic_link":
      return renderMagicLinkTemplate(input.subject, input.recipientName, input.payload);
    default:
      throw new Error(`Unsupported email template: ${input.templateKey satisfies never}`);
  }
}

export type SendTransactionalEmailInput = {
  toEmail: string;
  toName?: string | null;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export async function sendTransactionalEmail(input: SendTransactionalEmailInput) {
  const senderFunctionUrl = process.env.SUPABASE_EMAIL_FUNCTION_URL?.trim();
  const senderFunctionBearer = process.env.SUPABASE_EMAIL_FUNCTION_BEARER?.trim();

  if (!senderFunctionUrl) {
    throw new Error("SUPABASE_EMAIL_FUNCTION_URL is not configured.");
  }

  const response = await fetch(senderFunctionUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(senderFunctionBearer ? { authorization: `Bearer ${senderFunctionBearer}` } : {}),
    },
    body: JSON.stringify({
      from: `${BRAND.companyName} <${BRAND.supportEmail}>`,
      replyTo: input.replyTo || BRAND.replyTo,
      to: [{ email: input.toEmail, name: input.toName || undefined }],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Email delivery failed with status ${response.status}: ${body.slice(0, 400)}`);
  }

  const result = (await response.json().catch(() => ({}))) as { id?: string; provider?: string };
  return {
    provider: result.provider || "resend",
    providerMessageId: result.id ?? null,
  };
}
