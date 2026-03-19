import { NextResponse } from "next/server";
import { findPaymentLinkBySlug, upsertPaymentLinks } from "@/lib/api/payment-link-store";
import { createBushaClient } from "@/lib/api/busha-client";
import { normalizePaymentLink } from "@/lib/api/busha-normalizers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const existingLink = await findPaymentLinkBySlug(slug);

  if (existingLink?.hosted_url) {
    return NextResponse.json({ data: existingLink });
  }

  try {
    const busha = createBushaClient();
    const result = await busha.get<{ data?: Record<string, unknown>[] }>("/v1/payments/links");
    const remoteLinks = (result.data || []).map((item) =>
      normalizePaymentLink(item, existingLink)
    );

    if (remoteLinks.length > 0) {
      await upsertPaymentLinks(remoteLinks);
    }

    const link = remoteLinks.find((item) => item.slug === slug) || existingLink;

    if (!link) {
      return NextResponse.json({ error: "Payment link not found." }, { status: 404 });
    }

    return NextResponse.json({ data: link });
  } catch {
    const link = existingLink;

    if (!link) {
      return NextResponse.json({ error: "Payment link not found." }, { status: 404 });
    }

    return NextResponse.json({ data: link });
  }
}
