import { redirect } from "next/navigation";

export default async function PaymentLinkShortcutPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  redirect(`/pay/${slug}`);
}

