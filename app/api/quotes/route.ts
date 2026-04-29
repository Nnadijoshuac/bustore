import { NextResponse } from "next/server";
import { createBushaClient } from "@/lib/api/busha-client";
import { normalizeQuote } from "@/lib/api/busha-normalizers";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const busha = createBushaClient();
    const result = await busha.post<{ data?: Record<string, unknown>; message?: string }>("/v1/quotes", payload);

    if (!result.data) {
      return NextResponse.json({ error: "Busha did not return a quote." }, { status: 502 });
    }

    return NextResponse.json({ data: normalizeQuote(result.data), message: result.message }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create quote.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
