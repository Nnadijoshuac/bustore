import type { PaymentLink } from "@/types";
import { createAdminClient } from "@/lib/supabase/admin";

const PAYMENT_LINKS_BUCKET = "app-data";
const PAYMENT_LINKS_PATH = "payment-links.json";

async function ensureBucket() {
  const supabase = createAdminClient();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    throw new Error(listError.message);
  }

  if (!buckets.some((bucket) => bucket.name === PAYMENT_LINKS_BUCKET)) {
    const { error: createError } = await supabase.storage.createBucket(PAYMENT_LINKS_BUCKET, {
      public: false,
      fileSizeLimit: 1024 * 1024,
    });

    if (createError) {
      throw new Error(createError.message);
    }
  }

  return supabase;
}

async function readStoredPaymentLinks(): Promise<PaymentLink[]> {
  const supabase = await ensureBucket();
  const { data, error } = await supabase.storage
    .from(PAYMENT_LINKS_BUCKET)
    .download(PAYMENT_LINKS_PATH);

  if (error) {
    if (error.message.toLowerCase().includes("not found")) {
      return [];
    }

    throw new Error(error.message);
  }

  const content = await data.text();
  return JSON.parse(content) as PaymentLink[];
}

async function writeStoredPaymentLinks(paymentLinks: PaymentLink[]) {
  const supabase = await ensureBucket();
  const payload = JSON.stringify(paymentLinks, null, 2);
  const { error } = await supabase.storage
    .from(PAYMENT_LINKS_BUCKET)
    .upload(PAYMENT_LINKS_PATH, payload, {
      upsert: true,
      contentType: "application/json",
    });

  if (error) {
    throw new Error(error.message);
  }
}

export async function listPaymentLinks(): Promise<PaymentLink[]> {
  return readStoredPaymentLinks();
}

export async function addPaymentLink(link: PaymentLink): Promise<PaymentLink> {
  const currentLinks = await readStoredPaymentLinks();
  const nextLinks = [link, ...currentLinks.filter((item) => item.id !== link.id)];
  await writeStoredPaymentLinks(nextLinks);
  return link;
}

export async function upsertPaymentLinks(links: PaymentLink[]): Promise<PaymentLink[]> {
  const currentLinks = await readStoredPaymentLinks();
  const merged = [...currentLinks];

  for (const link of links) {
    const index = merged.findIndex((item) => item.id === link.id || item.slug === link.slug);

    if (index >= 0) {
      merged[index] = {
        ...merged[index],
        ...link,
      };
      continue;
    }

    merged.unshift(link);
  }

  await writeStoredPaymentLinks(merged);
  return merged;
}

export async function findPaymentLinkBySlug(slug: string): Promise<PaymentLink | undefined> {
  const links = await listPaymentLinks();
  return links.find((link) => link.slug === slug);
}
