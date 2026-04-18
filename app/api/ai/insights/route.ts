import { NextRequest } from "next/server";
import {
  DEMO_ACCOUNT,
  DEMO_TRANSACTIONS,
  DEMO_PAYMENT_LINKS,
  DEMO_STATS,
  DEMO_SETTLEMENTS,
} from "@/lib/api/demo-data";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

export async function POST(_req: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "OPENROUTER_API_KEY is not configured." }, { status: 500 });
    }

    const topLink = [...DEMO_PAYMENT_LINKS].sort(
      (a, b) => b.total_collected - a.total_collected
    )[0];
    const topTxn = [...DEMO_TRANSACTIONS]
      .filter((t) => t.type === "incoming")
      .sort((a, b) => b.amount - a.amount)[0];
    const pendingSettlement = DEMO_SETTLEMENTS.find(
      (s) => s.status === "processing"
    );

    const prompt = `You are a financial analyst for Fluent, a payments platform.

Analyze this business snapshot and return EXACTLY 3 short, specific insight bullets. Each bullet must be one sentence, data-driven, and actionable. No markdown, no headers, just 3 lines — one bullet per line, starting with a bullet "•".

BUSINESS DATA:
- Balance: $${DEMO_ACCOUNT.balance_usd.toLocaleString()} USD
- Total Received: $${DEMO_STATS.total_received_usd.toLocaleString()} (+${DEMO_STATS.total_received_change}% MoM)
- Avg Transaction: $${DEMO_STATS.avg_transaction_usd.toLocaleString()}
- Pending Settlement: $${DEMO_STATS.pending_settlements_usd.toLocaleString()}
- Top payment link: "${topLink.title}" — $${topLink.total_collected.toLocaleString()} from ${topLink.payment_count} payments
- Highest transaction: $${topTxn.amount.toLocaleString()} from ${topTxn.sender_name}
- Active payment links: ${DEMO_STATS.active_payment_links}
- Transactions this month: ${DEMO_STATS.transactions_this_month}
${pendingSettlement ? `- Settlement pending: $${pendingSettlement.amount_usd} to ${pendingSettlement.recipient?.name}` : ""}

Return exactly 3 insight bullets, each starting with •. No extra text.`;

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "Fluent",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return Response.json({ error: `AI error: ${text}` }, { status: 502 });
    }

    const data = (await response.json()) as {
      choices: { message: { content: string } }[];
    };

    const raw = data.choices?.[0]?.message?.content ?? "";
    const bullets = raw
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("•"))
      .map((line) => line.replace(/^•\s*/, "").trim())
      .slice(0, 3);

    return Response.json({ bullets });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
