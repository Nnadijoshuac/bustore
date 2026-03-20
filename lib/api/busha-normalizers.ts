import { DEMO_ACCOUNT } from "./demo-data";
import { getBushaCheckoutUrl } from "./busha-client";
import type { Customer, PaymentLink, PaymentTargetCurrency, Recipient, RecipientField, RecipientRequirement } from "@/types";

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function booleanValue(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeSlug(value: string) {
  try {
    const url = new URL(value);
    const segments = url.pathname.split("/").filter(Boolean);
    return segments.at(-1) || value;
  } catch {
    return value;
  }
}

function normalizeTargetCurrency(value: unknown, fallback: PaymentTargetCurrency = "USDT"): PaymentTargetCurrency {
  const normalized = stringValue(value, fallback).toUpperCase();

  if (normalized === "USDT" || normalized === "BTC" || normalized === "NGN" || normalized === "USD" || normalized === "KES") {
    return normalized;
  }

  return fallback;
}

export function normalizePaymentLink(data: Record<string, unknown>, fallback?: Partial<PaymentLink>): PaymentLink {
  const rawTitle = stringValue(data.title || data.name, fallback?.title || "Payment Link");
  const amountValue = data.quote_amount ?? fallback?.amount;
  const parsedAmount =
    amountValue === undefined || amountValue === null || amountValue === "" ? undefined : Number(amountValue);
  const rawSlug = stringValue(data.link || data.slug, fallback?.slug || `${slugify(rawTitle)}-${Date.now().toString().slice(-6)}`);

  return {
    id: stringValue(data.id, fallback?.id || `pl-${Date.now()}`),
    account_id: fallback?.account_id || DEMO_ACCOUNT.id,
    title: rawTitle,
    description: stringValue(data.description, fallback?.description || ""),
    amount: Number.isFinite(parsedAmount) ? parsedAmount : undefined,
    currency: stringValue(data.quote_currency, fallback?.currency || "USD") as PaymentLink["currency"],
    target_currency: normalizeTargetCurrency(data.target_currency, fallback?.target_currency || "USDT"),
    status: stringValue(data.status, fallback?.status || "active") as PaymentLink["status"],
    slug: normalizeSlug(rawSlug),
    hosted_url: getBushaCheckoutUrl(stringValue(data.link, fallback?.hosted_url || "")),
    redirect_url: fallback?.redirect_url,
    total_collected: fallback?.total_collected || 0,
    payment_count: fallback?.payment_count || 0,
    created_at: stringValue(data.created_at, fallback?.created_at || new Date().toISOString()),
    expires_at: fallback?.expires_at,
  };
}

export function normalizeCustomer(data: Record<string, unknown>, fallback?: Partial<Customer>): Customer {
  const address = asRecord(data.address);

  return {
    id: stringValue(data.id, fallback?.id),
    business_id: stringValue(data.business_id, fallback?.business_id),
    email: stringValue(data.email, fallback?.email),
    first_name: stringValue(data.first_name, fallback?.first_name),
    middle_name: stringValue(data.middle_name, fallback?.middle_name),
    last_name: stringValue(data.last_name, fallback?.last_name),
    phone: stringValue(data.phone, fallback?.phone),
    type: stringValue(data.type, fallback?.type || "individual") as Customer["type"],
    country_id: stringValue(data.country_id, fallback?.country_id),
    birth_date: stringValue(data.birth_date, fallback?.birth_date),
    address: {
      city: stringValue(address.city, fallback?.address?.city || ""),
      state: stringValue(address.state, fallback?.address?.state || ""),
      county: stringValue(address.county, fallback?.address?.county),
      country_id: stringValue(address.country_id, fallback?.address?.country_id || ""),
      address_line_1: stringValue(address.address_line_1, fallback?.address?.address_line_1 || ""),
      address_line_2: stringValue(address.address_line_2, fallback?.address?.address_line_2),
      province: stringValue(address.province, fallback?.address?.province),
      postal_code: stringValue(address.postal_code, fallback?.address?.postal_code || ""),
    },
    status: stringValue(data.status, fallback?.status || "inactive") as Customer["status"],
    level: stringValue(data.level, fallback?.level),
    display_currency: stringValue(data.display_currency, fallback?.display_currency),
    deposit: typeof data.deposit === "boolean" ? data.deposit : fallback?.deposit,
    payout: typeof data.payout === "boolean" ? data.payout : fallback?.payout,
    has_accepted_terms_of_service:
      typeof data.has_accepted_terms_of_service === "boolean"
        ? data.has_accepted_terms_of_service
        : fallback?.has_accepted_terms_of_service,
    created_at: stringValue(data.created_at, fallback?.created_at || new Date().toISOString()),
    updated_at: stringValue(data.updated_at, fallback?.updated_at),
    identifying_information: Array.isArray(data.identifying_information)
      ? (data.identifying_information as Customer["identifying_information"])
      : fallback?.identifying_information,
  };
}

export function normalizeRecipientField(value: unknown): RecipientField {
  const field = asRecord(value);
  return {
    name: stringValue(field.name),
    value: stringValue(field.value),
    display_name: stringValue(field.display_name),
    required: booleanValue(field.required),
    is_copyable: booleanValue(field.is_copyable),
    is_visible: typeof field.is_visible === "boolean" ? field.is_visible : true,
  };
}

export function normalizeRecipient(data: Record<string, unknown>): Recipient {
  const fields = Array.isArray(data.fields) ? data.fields.map(normalizeRecipientField) : [];

  return {
    id: stringValue(data.id),
    account_id: DEMO_ACCOUNT.id,
    name:
      fields.find((field) => field.name === "account_name")?.value ||
      fields.find((field) => field.name === "bank_account_name")?.value ||
      stringValue(data.name, "Recipient"),
    email: stringValue(data.email),
    bank_name:
      fields.find((field) => field.name === "bank_name")?.value ||
      fields.find((field) => field.name === "bank_code")?.value ||
      "",
    bank_account_number:
      fields.find((field) => field.name === "account_number")?.value ||
      fields.find((field) => field.name === "bank_account_number")?.value ||
      "",
    bank_account_name:
      fields.find((field) => field.name === "account_name")?.value ||
      fields.find((field) => field.name === "bank_account_name")?.value ||
      "",
    country: stringValue(data.country_id),
    currency: stringValue(data.currency_id, "NGN") as Recipient["currency"],
    is_verified: booleanValue(data.active, true),
    created_at: stringValue(data.created_at, new Date().toISOString()),
    type: stringValue(data.type),
    legal_entity_type: stringValue(data.legal_entity_type),
    active: typeof data.active === "boolean" ? data.active : true,
    owned_by_customer: typeof data.owned_by_customer === "boolean" ? data.owned_by_customer : undefined,
    fields,
  };
}

export function normalizeRecipientRequirement(value: unknown): RecipientRequirement {
  const item = asRecord(value);
  return {
    name: stringValue(item.name),
    display_name: stringValue(item.display_name || item.name),
    type: stringValue(item.type || item.input_type, "text"),
    required: booleanValue(item.required, true),
    description: stringValue(item.description),
    options: Array.isArray(item.options)
      ? item.options.map((option) => {
          const record = asRecord(option);
          return {
            label: stringValue(record.label || record.name || record.value),
            value: stringValue(record.value || record.name || record.label),
          };
        })
      : [],
  };
}
