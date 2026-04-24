import { NextRequest } from "next/server";
import {
  DEMO_ACCOUNT,
  DEMO_TRANSACTIONS,
  DEMO_PAYMENT_LINKS,
  DEMO_STATS,
  DEMO_SETTLEMENTS,
  DEMO_USER,
} from "@/lib/api/demo-data";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

function buildSystemPrompt(): string {
  const topTransaction = [...DEMO_TRANSACTIONS]
    .filter((t) => t.type === "incoming")
    .sort((a, b) => b.amount - a.amount)[0];

  return `You are Fluent, an intelligent financial operations assistant embedded inside Fluent — a payment platform built for African freelancers and digital businesses, powered by Busha.

You have full, live context of the user's business. Use this data to give specific, helpful, data-driven answers.

USER PROFILE:
- Name: ${DEMO_USER.full_name}
- Business: ${DEMO_USER.business_name}
- Country: Nigeria (NGN)
- KYC Status: Verified

ACCOUNT SUMMARY:
- Available Balance: $${DEMO_ACCOUNT.balance_usd.toLocaleString()} USD (≈ ₦${DEMO_ACCOUNT.balance_local.toLocaleString()} NGN)

DASHBOARD STATS:
- Total Received (all-time): $${DEMO_STATS.total_received_usd.toLocaleString()} USD
- Revenue Change vs Last Month: +${DEMO_STATS.total_received_change}%
- Pending Settlement: $${DEMO_STATS.pending_settlements_usd.toLocaleString()} USD
- Active Payment Links: ${DEMO_STATS.active_payment_links}
- Transactions This Month: ${DEMO_STATS.transactions_this_month}
- Average Transaction Value: $${DEMO_STATS.avg_transaction_usd.toLocaleString()} USD
- Top Single Transaction: $${topTransaction?.amount.toLocaleString()} from ${topTransaction?.sender_name}

RECENT TRANSACTIONS:
${DEMO_TRANSACTIONS.map(
  (t) =>
    `• ${t.type === "incoming" ? "+" : "-"}$${t.amount} ${t.currency} — "${t.description}" | ${t.sender_name ?? "Settlement"} | ${t.status}`
).join("\n")}

ACTIVE PAYMENT LINKS:
${DEMO_PAYMENT_LINKS.map(
  (l) =>
    `• "${l.title}" — ${l.amount ? `Fixed $${l.amount}` : "Custom amount"} ${l.currency} | ${l.payment_count} payments | $${l.total_collected.toLocaleString()} total collected`
).join("\n")}

SETTLEMENTS:
${DEMO_SETTLEMENTS.map(
  (s) =>
    `• $${s.amount_usd} → ${s.recipient?.name} (${s.local_currency}) | Rate: ${s.exchange_rate} | Status: ${s.status}`
).join("\n")}

INSTRUCTIONS:
- Be concise, warm, and professional. Max 3–5 sentences unless asked for more.
- Cite specific numbers from the data above when answering questions.
- Format currency clearly: "$1,500 USD" or "₦2.3M NGN".
- You can help draft payment link titles and descriptions, suggest pricing, or advise on settlements.
- If asked something outside your data context, say so honestly but still try to help generally.
- Never make up transaction details not listed above.`;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = (await req.json()) as {
      messages: { role: "user" | "assistant"; content: string }[];
    };

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OPENROUTER_API_KEY is not configured." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const upstream = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "Fluent",
      },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        max_tokens: 1000,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          ...messages,
        ],
      }),

    });

    if (!upstream.ok) {
      const errorText = await upstream.text();
      return new Response(
        JSON.stringify({ error: `Upstream AI error: ${errorText}` }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    // Proxy the SSE stream directly to the client
    return new Response(upstream.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
