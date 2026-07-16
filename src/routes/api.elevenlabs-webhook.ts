import { createFileRoute } from "@tanstack/react-router";
import {
  processElevenLabsWebhookPayload,
  verifyElevenLabsWebhookSignature,
} from "@/lib/elevenlabs-webhook.server";

export const Route = createFileRoute("/api/elevenlabs-webhook")({
  server: {
    handlers: {
      GET: () =>
        new Response("Method Not Allowed", {
          status: 405,
          headers: { Allow: "POST" },
        }),
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const signature = request.headers.get("elevenlabs-signature");

        if (!verifyElevenLabsWebhookSignature(rawBody, signature)) {
          return new Response("Invalid signature", { status: 401 });
        }

        const result = await processElevenLabsWebhookPayload(rawBody);
        return Response.json(result, { status: 200 });
      },
    },
  },
});
