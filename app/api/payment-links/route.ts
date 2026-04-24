import { NextResponse } from "next/server";
import type { CreatePaymentLinkInput } from "@/types";
import { addPaymentLink, listPaymentLinks, upsertPaymentLinks } from "@/lib/api/payment-link-store";
import { createBushaClient } from "@/lib/api/busha-client";
import { normalizePaymentLink } from "@/lib/api/busha-normalizers";

async function safeListPaymentLinks() {
  try {
    return await listPaymentLinks();
  } catch (error) {
    console.error("[Payment Link Store Read Error]:", error);
    return [];
  }
}

export async function GET() {
  try {
    const busha = createBushaClient();
    const result = await busha.get<{ data?: Record<string, unknown>[] }>("/v1/payments/links");

    if (!result.data) {
      return NextResponse.json({ data: await safeListPaymentLinks() });
    }

    const remoteLinks = result.data.map((item) => normalizePaymentLink(item));
    try {
      const links = await upsertPaymentLinks(remoteLinks);
      return NextResponse.json({ data: links });
    } catch (error) {
      console.error("[Payment Link Store Write Error]:", error);
      return NextResponse.json({ data: remoteLinks });
    }
  } catch (error) {
    console.error("[GET Payment Links Error]:", error);
    return NextResponse.json({ data: await safeListPaymentLinks() });
  }
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as CreatePaymentLinkInput;
    const busha = createBushaClient();

    const isFixed = !input.allow_customer_amount && typeof input.amount === "number";

    const payload: Record<string, unknown> = {
      fixed: isFixed,
      one_time: !!input.one_time,
      name: input.title,
      title: input.title,
      description: input.description || undefined,
      quote_currency: input.currency,
      target_currency: input.target_currency || "USDT",
      require_extra_info: [
        {
          field_name: "email",
          required: true,
        },
      ],
      allow_customer_amount: !!input.allow_customer_amount,
      dry_run: false,
    };

    if (isFixed) {
      payload.quote_amount = String(input.amount);
    }

    if (input.allow_customer_amount && input.min_amount && input.max_amount) {
      payload.amount_limit = {
        min_amount: String(input.min_amount),
        max_amount: String(input.max_amount),
      };
    }

    if (input.redirect_url || input.expires_at) {
      payload.meta = {
        redirect_url: input.redirect_url || undefined,
        expires_at: input.expires_at || undefined,
      };
    }

    const result = await busha.post<{
      message?: string;
      data?: Record<string, unknown>;
    }>("/v1/payments/links", payload);

    if (!result.data) {
      console.error("[Busha API Response Missing Data]:", result);
      return NextResponse.json({ error: "Busha did not return a payment link data object." }, { status: 502 });
    }

    const normalizedLink = normalizePaymentLink(result.data, {
      title: input.title,
      description: input.description,
      amount: input.amount,
      currency: input.currency,
      redirect_url: input.redirect_url,
      expires_at: input.expires_at,
      one_time: !!input.one_time,
      allow_customer_amount: !!input.allow_customer_amount,
    });

    let link = normalizedLink;

    try {
      link = await addPaymentLink(normalizedLink);
    } catch (error) {
      console.error("[Payment Link Store Write Error]:", error);
    }

    return NextResponse.json({ data: link }, { status: 201 });
  } catch (error) {
    console.error("[POST Create Payment Link Error]:", error);
    const message = error instanceof Error ? error.message : "Unable to create payment link.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
