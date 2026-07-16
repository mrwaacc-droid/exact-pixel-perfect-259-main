import { createHmac, timingSafeEqual } from "node:crypto";

// ElevenLabs signs webhook payloads as:
//   ElevenLabs-Signature: t=<unix_seconds>,v0=<hex_hmac_sha256>[,v0=<hex_hmac_sha256>...]
// where the signed message is `${timestamp}.${rawBody}`. Multiple v0 values may be
// present during secret rotation — a match against any one of them is valid.
const SIGNATURE_TOLERANCE_SECONDS = 30 * 60;

function parseSignatureHeader(header: string): { timestamp: string | null; signatures: string[] } {
  let timestamp: string | null = null;
  const signatures: string[] = [];

  for (const part of header.split(",")) {
    const [key, value] = part.split("=", 2).map((segment) => segment.trim());
    if (key === "t" && value) timestamp = value;
    if (key === "v0" && value) signatures.push(value);
  }

  return { timestamp, signatures };
}

export function verifyElevenLabsWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
): boolean {
  if (!signatureHeader) return false;

  const secret = process.env.ELEVENLABS_WEBHOOK_SECRET;
  if (!secret) return false;

  const { timestamp, signatures } = parseSignatureHeader(signatureHeader);
  if (!timestamp || signatures.length === 0) return false;

  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds)) return false;
  const ageSeconds = Math.abs(Date.now() / 1000 - timestampSeconds);
  if (ageSeconds > SIGNATURE_TOLERANCE_SECONDS) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  return signatures.some((signature) => {
    const signatureBuffer = Buffer.from(signature, "hex");
    return (
      expectedBuffer.length === signatureBuffer.length &&
      timingSafeEqual(expectedBuffer, signatureBuffer)
    );
  });
}

function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/**
 * Verifies and parses an ElevenLabs webhook payload. The app doesn't yet use
 * any ElevenLabs feature that emits these events (voice cloning, speech-to-text) —
 * this only logs the event so delivery can be confirmed from the ElevenLabs
 * dashboard. Add real handling here once a feature depends on one of these events.
 */
export async function processElevenLabsWebhookPayload(rawBody: string): Promise<{
  ok: boolean;
  event: string;
  handled: boolean;
}> {
  const parsed = safeJsonParse<Record<string, unknown>>(rawBody, {});
  const event = typeof parsed?.type === "string" ? parsed.type : "";

  if (!event) {
    return { ok: true, event, handled: false };
  }

  console.info(`[elevenlabs-webhook] Received event "${event}" (no handler wired up yet).`);

  return { ok: true, event, handled: false };
}
