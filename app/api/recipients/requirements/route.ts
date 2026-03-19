import { NextResponse } from "next/server";
import { createBushaClient } from "@/lib/api/busha-client";
import { normalizeRecipientRequirement } from "@/lib/api/busha-normalizers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get("country_id");
    const currencyId = searchParams.get("currency_id");

    if (!countryId || !currencyId) {
      return NextResponse.json({ error: "country_id and currency_id are required." }, { status: 400 });
    }

    const busha = createBushaClient();
    const result = await busha.get<{ data?: unknown[] }>(
      `/v1/recipient-requirements?country_id=${encodeURIComponent(countryId)}&currency_id=${encodeURIComponent(currencyId)}`
    );

    return NextResponse.json({
      data: (result.data || []).map((item) => normalizeRecipientRequirement(item)),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load recipient requirements.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

