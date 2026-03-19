import { NextResponse } from "next/server";
import { listWebhookDeliveries } from "@/lib/api/webhook-store";

export async function GET() {
  const deliveries = await listWebhookDeliveries();

  return NextResponse.json({
    data: {
      endpoint_url: process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/busha`
        : "/api/webhooks/busha",
      signing_secret_configured: Boolean(process.env.BUSHA_WEBHOOK_SIGNING_SECRET),
      deliveries,
    },
  });
}

