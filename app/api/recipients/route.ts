import { NextResponse } from "next/server";
import type { CreateRecipientInput, Recipient } from "@/types";
import { createBushaClient } from "@/lib/api/busha-client";
import { normalizeRecipient } from "@/lib/api/busha-normalizers";

export async function GET() {
  try {
    const busha = createBushaClient();
    const result = await busha.get<{ data?: Record<string, unknown>[] }>("/v1/recipients");
    const recipients = (result.data || []).map((item) => normalizeRecipient(item));
    return NextResponse.json({ data: recipients });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load recipients.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as CreateRecipientInput;
    const busha = createBushaClient();
    const result = await busha.post<{ data?: Record<string, unknown>; message?: string }>("/v1/recipients", input);

    if (!result.data) {
      return NextResponse.json({ error: "Busha did not return a recipient." }, { status: 502 });
    }

    const recipient: Recipient = normalizeRecipient(result.data);
    return NextResponse.json({ data: recipient, message: result.message }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create recipient.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

