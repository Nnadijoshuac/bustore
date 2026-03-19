import type { Customer } from "@/types";
import { createAdminClient } from "@/lib/supabase/admin";

const CUSTOMERS_BUCKET = "app-data";
const CUSTOMERS_PATH = "customers.json";

async function ensureBucket() {
  const supabase = createAdminClient();
  const { data: buckets, error } = await supabase.storage.listBuckets();

  if (error) {
    throw new Error(error.message);
  }

  if (!buckets.some((bucket) => bucket.name === CUSTOMERS_BUCKET)) {
    const { error: createError } = await supabase.storage.createBucket(CUSTOMERS_BUCKET, {
      public: false,
      fileSizeLimit: 1024 * 1024,
    });

    if (createError) {
      throw new Error(createError.message);
    }
  }

  return supabase;
}

async function readStoredCustomers(): Promise<Customer[]> {
  const supabase = await ensureBucket();
  const { data, error } = await supabase.storage.from(CUSTOMERS_BUCKET).download(CUSTOMERS_PATH);

  if (error) {
    if (error.message.toLowerCase().includes("not found")) {
      return [];
    }

    throw new Error(error.message);
  }

  return JSON.parse(await data.text()) as Customer[];
}

async function writeStoredCustomers(customers: Customer[]) {
  const supabase = await ensureBucket();
  const { error } = await supabase.storage
    .from(CUSTOMERS_BUCKET)
    .upload(CUSTOMERS_PATH, JSON.stringify(customers, null, 2), {
      upsert: true,
      contentType: "application/json",
    });

  if (error) {
    throw new Error(error.message);
  }
}

export async function listCustomers(): Promise<Customer[]> {
  return readStoredCustomers();
}

export async function upsertCustomer(customer: Customer): Promise<Customer> {
  const current = await readStoredCustomers();
  const next = [customer, ...current.filter((item) => item.id !== customer.id)];
  await writeStoredCustomers(next);
  return customer;
}

export async function findCustomerById(id: string): Promise<Customer | undefined> {
  const customers = await readStoredCustomers();
  return customers.find((customer) => customer.id === id);
}
