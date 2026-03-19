import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { addWebhookDelivery } from "@/lib/api/webhook-store";

function verifySignature(body: string, signature: string | null, secret: string) {
  if (!signature) {
    return false;
  }

  const expected = createHash("sha256").update(`${secret}${body}`).digest("hex");
  const actual = signature.trim();

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-busha-signature");
  const secret = process.env.BUSHA_WEBHOOK_SIGNING_SECRET;

  if (secret && !verifySignature(body, signature, secret)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  const payload = body ? (JSON.parse(body) as Record<string, unknown>) : {};
  const event =
    typeof payload.event === "string"
      ? payload.event
      : typeof payload.type === "string"
        ? payload.type
        : "unknown";

  await addWebhookDelivery({
    id: `whd-${Date.now()}`,
    event,
    received_at: new Date().toISOString(),
    payload,
    signature: signature || undefined,
  });

  return NextResponse.json({ received: true });
}
