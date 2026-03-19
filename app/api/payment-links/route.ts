import { NextResponse } from "next/server";
import type { CreatePaymentLinkInput } from "@/types";
import { addPaymentLink, listPaymentLinks, upsertPaymentLinks } from "@/lib/api/payment-link-store";
import { createBushaClient } from "@/lib/api/busha-client";
import { normalizePaymentLink } from "@/lib/api/busha-normalizers";

export async function GET() {
  try {
    const busha = createBushaClient();
    const result = await busha.get<{ data?: Record<string, unknown>[] }>("/v1/payments/links");

    if (!result.data) {
      return NextResponse.json({ data: await listPaymentLinks() });
    }

    const remoteLinks = result.data.map((item) => normalizePaymentLink(item));
    const links = await upsertPaymentLinks(remoteLinks);
    return NextResponse.json({ data: links });
  } catch {
    return NextResponse.json({ data: await listPaymentLinks() });
  }
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as CreatePaymentLinkInput;
    const busha = createBushaClient();

    const payload = {
      fixed: !input.allow_customer_amount && typeof input.amount === "number",
      one_time: input.one_time ?? false,
      name: input.title,
      title: input.title,
      description: input.description,
      quote_amount: !input.allow_customer_amount && typeof input.amount === "number" ? String(input.amount) : undefined,
      quote_currency: input.currency,
      target_currency: input.target_currency || "USDT",
      require_extra_info: [
        {
          field_name: "email",
          required: true,
        },
      ],
      allow_customer_amount: input.allow_customer_amount || undefined,
      amount_limit: input.allow_customer_amount && input.min_amount && input.max_amount
        ? {
            min_amount: String(input.min_amount),
            max_amount: String(input.max_amount),
          }
        : undefined,
      meta: {
        redirect_url: input.redirect_url || undefined,
        expires_at: input.expires_at || undefined,
      },
      dry_run: false,
    };

    const result = await busha.post<{
      message?: string;
      data?: Record<string, unknown>;
    }>("/v1/payments/links", payload);

    if (!result.data) {
      return NextResponse.json({ error: "Busha did not return a payment link." }, { status: 502 });
    }

    const link = await addPaymentLink(
      normalizePaymentLink(result.data, {
        title: input.title,
        description: input.description,
        amount: input.amount,
        currency: input.currency,
        redirect_url: input.redirect_url,
        expires_at: input.expires_at,
      })
    );
    return NextResponse.json({ data: link }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create payment link.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
