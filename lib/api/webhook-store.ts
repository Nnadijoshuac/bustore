import { createAdminClient } from "@/lib/supabase/admin";
import type { WebhookDelivery } from "@/types";

const WEBHOOK_BUCKET = "app-data";
const WEBHOOK_PATH = "webhook-deliveries.json";

async function ensureBucket() {
  const supabase = createAdminClient();
  const { data: buckets, error } = await supabase.storage.listBuckets();

  if (error) {
    throw new Error(error.message);
  }

  if (!buckets.some((bucket) => bucket.name === WEBHOOK_BUCKET)) {
    const { error: createError } = await supabase.storage.createBucket(WEBHOOK_BUCKET, {
      public: false,
      fileSizeLimit: 1024 * 1024,
    });

    if (createError) {
      throw new Error(createError.message);
    }
  }

  return supabase;
}

async function readDeliveries(): Promise<WebhookDelivery[]> {
  const supabase = await ensureBucket();
  const { data, error } = await supabase.storage.from(WEBHOOK_BUCKET).download(WEBHOOK_PATH);

  if (error) {
    if (error.message.toLowerCase().includes("not found")) {
      return [];
    }

    throw new Error(error.message);
  }

  return JSON.parse(await data.text()) as WebhookDelivery[];
}

async function writeDeliveries(deliveries: WebhookDelivery[]) {
  const supabase = await ensureBucket();
  const { error } = await supabase.storage.from(WEBHOOK_BUCKET).upload(WEBHOOK_PATH, JSON.stringify(deliveries, null, 2), {
    upsert: true,
    contentType: "application/json",
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function listWebhookDeliveries(): Promise<WebhookDelivery[]> {
  return readDeliveries();
}

export async function addWebhookDelivery(delivery: WebhookDelivery) {
  const current = await readDeliveries();
  const next = [delivery, ...current].slice(0, 50);
  await writeDeliveries(next);
  return delivery;
}

