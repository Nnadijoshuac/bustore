import { NextResponse } from "next/server";
import { createBushaClient } from "@/lib/api/busha-client";
import { normalizeAccountSummary } from "@/lib/api/busha-normalizers";
import { EMPTY_ACCOUNT } from "@/lib/api/empty-data";

export async function GET() {
  try {
    const busha = createBushaClient();
    const result = await busha.get<{ data?: Record<string, unknown>[] }>("/v1/balances");

    if (!Array.isArray(result.data) || !result.data.length) {
      return NextResponse.json({ data: EMPTY_ACCOUNT, meta: { mode: "empty" } });
    }

    return NextResponse.json({ data: normalizeAccountSummary(result.data) });
  } catch (error) {
    return NextResponse.json({
      data: EMPTY_ACCOUNT,
      meta: {
        mode: "empty",
        fallback_reason: error instanceof Error ? error.message : "Unable to load Busha balances.",
      },
    });
  }
}
