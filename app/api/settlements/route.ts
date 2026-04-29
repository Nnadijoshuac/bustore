import { NextResponse } from "next/server";
import { createBushaClient } from "@/lib/api/busha-client";
import { normalizeQuote, normalizeRecipient, normalizeSettlement } from "@/lib/api/busha-normalizers";
import { DEMO_SETTLEMENTS } from "@/lib/api/demo-data";
import { listStoredSettlements, rememberSettlement } from "@/lib/api/settlement-store";
import type { Recipient } from "@/types";

function dedupeSettlements<T extends { id: string }>(items: T[]) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

function sortByCreatedAt<T extends { created_at: string }>(items: T[]) {
  return [...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function GET() {
  const storedSettlements = listStoredSettlements();

  try {
    const busha = createBushaClient();
    const [transfersResult, recipientsResult] = await Promise.all([
      busha.get<{ data?: Record<string, unknown>[] }>("/v1/transfers"),
      busha.get<{ data?: Record<string, unknown>[] }>("/v1/recipients"),
    ]);

    const recipients = new Map<string, Recipient>(
      (recipientsResult.data || []).map((item) => {
        const normalized = normalizeRecipient(item);
        return [normalized.id, normalized];
      })
    );

    const settlements = (transfersResult.data || []).map((item) => {
      const recipientId =
        typeof item.pay_out === "object" && item.pay_out !== null
          ? String((item.pay_out as Record<string, unknown>).recipient_id || "")
          : "";
      return normalizeSettlement(item, recipients.get(recipientId));
    });

    return NextResponse.json({ data: sortByCreatedAt(dedupeSettlements([...settlements, ...storedSettlements])) });
  } catch {
    const fallback = storedSettlements.length ? storedSettlements : DEMO_SETTLEMENTS;
    return NextResponse.json({ data: sortByCreatedAt(fallback), meta: { mode: "demo" } });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      recipient_id?: string;
      amount_usd?: number;
      note?: string;
    };

    if (!body.recipient_id || !body.amount_usd) {
      return NextResponse.json({ error: "Recipient and amount are required." }, { status: 400 });
    }

    const busha = createBushaClient();
    const recipientsResult = await busha.get<{ data?: Record<string, unknown>[] }>("/v1/recipients");
    const recipient = (recipientsResult.data || [])
      .map((item) => normalizeRecipient(item))
      .find((item) => item.id === body.recipient_id);

    if (!recipient) {
      return NextResponse.json({ error: "Recipient not found." }, { status: 404 });
    }

    const quoteResult = await busha.post<{ data?: Record<string, unknown> }>("/v1/quotes", {
      source_currency: "USD",
      target_currency: recipient.currency,
      source_amount: Number(body.amount_usd).toFixed(2),
      pay_out: {
        type: recipient.category === "mobile_money" ? "mobile_money" : "bank_transfer",
        recipient_id: recipient.id,
      },
    });

    if (!quoteResult.data) {
      return NextResponse.json({ error: "Busha did not return a quote." }, { status: 502 });
    }

    const quote = normalizeQuote(quoteResult.data);
    const transferResult = await busha.post<{ data?: Record<string, unknown> }>("/v1/transfers", {
      quote_id: quote.id,
    });

    if (!transferResult.data) {
      return NextResponse.json({ error: "Busha did not return a transfer." }, { status: 502 });
    }

    const settlement = rememberSettlement(normalizeSettlement(transferResult.data, recipient));
    return NextResponse.json({ data: settlement, meta: { quote_id: quote.id } }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create settlement.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
