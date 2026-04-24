import { NextResponse } from "next/server";
import type { PaymentRequest } from "@/types";

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
          address: payIn.address ? String(payIn.address) : undefined,
          network: payIn.network ? String(payIn.network) : undefined,
          memo: payIn.memo ? String(payIn.memo) : undefined,
          account_name: recipientDetails?.account_name ? String(recipientDetails.account_name) : undefined,
          bank_name: recipientDetails?.bank_name ? String(recipientDetails.bank_name) : undefined,
          account_number: recipientDetails?.account_number ? String(recipientDetails.account_number) : undefined,
          provider: recipientDetails?.provider ? String(recipientDetails.provider) : undefined,
          phone_number: recipientDetails?.phone_number ? String(recipientDetails.phone_number) : undefined,
          expires_at: payIn.expires_at ? String(payIn.expires_at) : undefined,
        }
      : undefined,
    timeline:
      typeof data.timeline === "object" && data.timeline !== null
        ? {
            total_steps: Number((data.timeline as Record<string, unknown>).total_steps ?? 0),
            current_step: Number((data.timeline as Record<string, unknown>).current_step ?? 0),
            transfer_status: String((data.timeline as Record<string, unknown>).transfer_status ?? ""),
            events: Array.isArray((data.timeline as Record<string, unknown>).events)
              ? ((data.timeline as Record<string, unknown>).events as Record<string, unknown>[]).map((event) => ({
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

function getDefaultNetwork(targetCurrency: string) {
  switch (targetCurrency.toUpperCase()) {
    case "USDT":
      return "TRX";
    case "BTC":
      return "BTC";
    case "ETH":
      return "ETH";
    default:
      return targetCurrency.toUpperCase();
  }
}

function getPayInConfig(targetCurrency: string) {
  switch (targetCurrency.toUpperCase()) {
    case "USDT":
    case "BTC":
      return {
        type: "address",
        network: getDefaultNetwork(targetCurrency),
      };
    case "NGN":
    case "USD":
    case "KES":
      return {
        type: "temporary_bank_account",
      };
    default:
      return {
        type: "address",
        network: getDefaultNetwork(targetCurrency),
      };
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      payment_link_id: string;
      payment_link_slug: string;
      amount: string;
      quote_currency: string;
      target_currency: string;
      email: string;
      name: string;
    };

    const publicKey = process.env.NEXT_PUBLIC_BUSHA_PUBLIC_API_KEY;
    const baseUrl = process.env.BUSHA_API_BASE_URL || "https://api.sandbox.busha.so";

    if (!publicKey) {
      return NextResponse.json({ error: "NEXT_PUBLIC_BUSHA_PUBLIC_API_KEY is not configured." }, { status: 500 });
    }

    const response = await fetch(`${baseUrl}/v1/payments/requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-BU-PUBLIC-KEY": publicKey,
      },
      body: JSON.stringify({
        additional_info: {
          email: body.email,
          name: body.name,
          source: "web",
        },
        quote_amount: body.amount,
        quote_currency: body.quote_currency,
        source_currency: body.target_currency,
        target_currency: body.target_currency,
        pay_in: getPayInConfig(body.target_currency),
        reference: `${body.payment_link_slug}-${Date.now()}`,
      }),
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
          : result.error?.message || result.message || "Unable to create payment request.";
      const normalizedMessage =
        message.includes("minimum 5 USDT")
          ? "This amount is too small for USDT payments. Use NGN bank transfer for 2400 NGN, or increase the amount to at least the Busha crypto minimum."
          : message;
      return NextResponse.json({ error: normalizedMessage }, { status: response.status || 500 });
    }

    return NextResponse.json({ data: normalizePaymentRequest(result.data) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create payment request.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
