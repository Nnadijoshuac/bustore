import { NextResponse } from "next/server";
import { normalizeTransaction } from "@/lib/api/busha-normalizers";
import { createBushaClient } from "@/lib/api/busha-client";
import { DEMO_TRANSACTIONS } from "@/lib/api/demo-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");

  try {
    const busha = createBushaClient();
    const result = await busha.get<{ data?: Record<string, unknown>[] }>("/v1/transactions");
    const normalized = (result.data || []).map((item) => normalizeTransaction(item));
    const filtered = normalized.filter((transaction) => {
      if (status && transaction.status !== status) {
        return false;
      }
      if (type && transaction.type !== type) {
        return false;
      }
      return true;
    });

    return NextResponse.json({
      data: filtered,
      meta: { total: filtered.length, page: 1, per_page: filtered.length || 20 },
    });
  } catch (error) {
    const fallback = DEMO_TRANSACTIONS.filter((transaction) => {
      if (status && transaction.status !== status) {
        return false;
      }
      if (type && transaction.type !== type) {
        return false;
      }
      return true;
    });

    return NextResponse.json({
      data: fallback,
      meta: {
        total: fallback.length,
        page: 1,
        per_page: fallback.length || 20,
        mode: "demo",
        fallback_reason: error instanceof Error ? error.message : "Unable to load Busha transactions.",
      },
    });
  }
}
