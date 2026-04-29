import { NextResponse } from "next/server";
import type { PaymentRequest } from "@/types";
import { getDemoPaymentRequest } from "@/lib/api/demo-payment-request-store";

function getStringField(...values: unknown[]) {
  const match = values.find((value) => typeof value === "string" && value.trim().length > 0);
  return typeof match === "string" ? match : undefined;
}

function normalizePaymentRequest(data: Record<string, unknown>): PaymentRequest {
  const additionalInfo =
    typeof data.additional_info === "object" && data.additional_info !== null
      ? (data.additional_info as Record<string, unknown>)
      : {};
  const payIn =
    typeof data.pay_in === "object" && data.pay_in !== null
      ? (data.pay_in as Record<string, unknown>)
      : undefined;
  const recipientDetails =
    payIn && typeof payIn.recipient_details === "object" && payIn.recipient_details !== null
      ? (payIn.recipient_details as Record<string, unknown>)
      : undefined;
  const providerDetails =
    payIn && typeof payIn.provider_details === "object" && payIn.provider_details !== null
      ? (payIn.provider_details as Record<string, unknown>)
      : undefined;
  const timeline =
    typeof data.timeline === "object" && data.timeline !== null
      ? (data.timeline as Record<string, unknown>)
      : undefined;

  return {
    id: String(data.id),
    status: String(data.status),
    source_amount: String(data.source_amount),
    source_currency: String(data.source_currency),
    target_amount: String(data.target_amount),
    target_currency: String(data.target_currency),
    reference: String(data.reference ?? ""),
    expires_at: String(data.expires_at ?? ""),
    additional_info: {
      email: String(additionalInfo.email ?? ""),
      name: additionalInfo.name ? String(additionalInfo.name) : undefined,
      phone_number: additionalInfo.phone_number ? String(additionalInfo.phone_number) : undefined,
      source: additionalInfo.source ? String(additionalInfo.source) : undefined,
    },
    pay_in: payIn
      ? {
          type: String(payIn.type ?? ""),
          address: getStringField(payIn.address),
          network: getStringField(payIn.network),
          memo: getStringField(payIn.memo),
          account_name: getStringField(
            recipientDetails?.account_name,
            providerDetails?.account_name,
            payIn.account_name
          ),
          bank_name: getStringField(
            recipientDetails?.bank_name,
            providerDetails?.bank_name,
            payIn.bank_name
          ),
          account_number: getStringField(
            recipientDetails?.account_number,
            recipientDetails?.bank_account_number,
            providerDetails?.account_number,
            providerDetails?.bank_account_number,
            payIn.account_number,
            payIn.bank_account_number
          ),
          provider: getStringField(
            recipientDetails?.provider,
            providerDetails?.provider,
            payIn.provider
          ),
          phone_number: getStringField(
            recipientDetails?.phone_number,
            providerDetails?.phone_number,
            payIn.phone_number
          ),
          expires_at: getStringField(payIn.expires_at),
        }
      : undefined,
    timeline: timeline
      ? {
          total_steps: Number(timeline.total_steps ?? 0),
          current_step: Number(timeline.current_step ?? 0),
          transfer_status: String(timeline.transfer_status ?? ""),
          events: Array.isArray(timeline.events)
            ? (timeline.events as Record<string, unknown>[]).map((event) => ({
                step: Number(event.step ?? 0),
                done: Boolean(event.done),
                status: String(event.status ?? ""),
                title: String(event.title ?? ""),
                description: String(event.description ?? ""),
                timestamp: event.timestamp ? String(event.timestamp) : undefined,
              }))
            : [],
        }
      : undefined,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const publicKey = process.env.BUSHA_PUBLIC_API_KEY || process.env.NEXT_PUBLIC_BUSHA_PUBLIC_API_KEY;
    const baseUrl = process.env.BUSHA_API_BASE_URL || "https://api.sandbox.busha.so";

    if (!publicKey) {
      const demoRequest = getDemoPaymentRequest(id);
      return demoRequest
        ? NextResponse.json({ data: demoRequest, meta: { mode: "demo" } })
        : NextResponse.json({ error: "Payment request not found." }, { status: 404 });
    }

    const response = await fetch(`${baseUrl}/v1/payments/requests/${id}`, {
      headers: {
        "X-BU-PUBLIC-KEY": publicKey,
      },
      cache: "no-store",
    });

    const result = (await response.json()) as {
      data?: Record<string, unknown>;
      error?: { message?: string } | string;
      message?: string;
    };

    if (!response.ok || !result.data) {
      const message =
        typeof result.error === "string"
          ? result.error
          : result.error?.message || result.message || "Unable to load payment request.";

      if (response.status >= 500) {
        const demoRequest = getDemoPaymentRequest(id);

        if (demoRequest) {
          return NextResponse.json({
            data: demoRequest,
            meta: { mode: "demo", fallback_reason: message },
          });
        }
      }

      return NextResponse.json({ error: message }, { status: response.status || 500 });
    }

    return NextResponse.json({ data: normalizePaymentRequest(result.data) });
  } catch (error) {
    const demoRequest = getDemoPaymentRequest(id);

    if (demoRequest) {
      return NextResponse.json({
        data: demoRequest,
        meta: {
          mode: "demo",
          fallback_reason: error instanceof Error ? error.message : "Unable to load payment request.",
        },
      });
    }

    const message = error instanceof Error ? error.message : "Unable to load payment request.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
