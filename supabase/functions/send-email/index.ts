// Supabase Edge Function: send-email
//
// Thin relay between the app's outbound email queue and Resend. The app never
// holds the Resend API key directly — it authenticates to this function with
// a shared bearer secret, and this function holds the Resend key as its own
// Supabase secret.
//
// Deploy:   supabase functions deploy send-email
// Secrets:  supabase secrets set RESEND_API_KEY=... EMAIL_FUNCTION_BEARER=...

const RESEND_API_URL = "https://api.resend.com/emails";

type SendEmailRequest = {
  from: string;
  replyTo?: string;
  to: Array<{ email: string; name?: string }>;
  subject: string;
  html: string;
  text: string;
};

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function isValidRecipient(value: unknown): value is { email: string; name?: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { email?: unknown }).email === "string" &&
    (value as { email: string }).email.length > 0
  );
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const expectedBearer = Deno.env.get("EMAIL_FUNCTION_BEARER")?.trim();
  if (expectedBearer) {
    const authHeader = req.headers.get("authorization") ?? "";
    const providedBearer = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (providedBearer !== expectedBearer) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY")?.trim();
  if (!resendApiKey) {
    return jsonResponse({ error: "RESEND_API_KEY is not configured on the function." }, 500);
  }

  let body: SendEmailRequest;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  if (typeof body.from !== "string" || !body.from) {
    return jsonResponse({ error: "`from` is required." }, 400);
  }
  if (!Array.isArray(body.to) || body.to.length === 0 || !body.to.every(isValidRecipient)) {
    return jsonResponse({ error: "`to` must be a non-empty array of { email, name? }." }, 400);
  }
  if (typeof body.subject !== "string" || !body.subject) {
    return jsonResponse({ error: "`subject` is required." }, 400);
  }
  if (typeof body.html !== "string" || !body.html) {
    return jsonResponse({ error: "`html` is required." }, 400);
  }

  const resendPayload = {
    from: body.from,
    to: body.to.map((recipient) =>
      recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email,
    ),
    subject: body.subject,
    html: body.html,
    text: body.text,
    ...(body.replyTo ? { reply_to: body.replyTo } : {}),
  };

  const resendResponse = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${resendApiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(resendPayload),
  });

  const resendBody = await resendResponse.json().catch(() => ({}));

  if (!resendResponse.ok) {
    return jsonResponse(
      { error: "Resend delivery failed.", provider: "resend", details: resendBody },
      resendResponse.status,
    );
  }

  return jsonResponse({ id: resendBody.id ?? null, provider: "resend" }, 200);
});
