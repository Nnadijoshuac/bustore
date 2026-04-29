import { DEMO_ACCOUNT } from "./demo-data";
import { getBushaCheckoutUrl } from "./busha-client";
import type { Account, Customer, PaymentLink, PaymentTargetCurrency, Quote, Recipient, RecipientField, RecipientRequirement, Settlement, Transaction } from "@/types";

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function booleanValue(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function numberValue(value: unknown, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function amountValue(value: unknown, fallback = 0) {
  const record = asRecord(value);

  if (Object.keys(record).length) {
    return numberValue(record.amount, fallback);
  }

  return numberValue(value, fallback);
}

function amountCurrency(value: unknown, fallback = "USD") {
  const record = asRecord(value);
  return stringValue(record.currency, fallback);
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return "";
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

function normalizeCurrency(value: unknown, fallback: Transaction["currency"] = "USD"): Transaction["currency"] {
  const normalized = stringValue(value, fallback).toUpperCase();
  if (normalized === "USD" || normalized === "EUR" || normalized === "GBP" || normalized === "NGN" || normalized === "GHS" || normalized === "KES" || normalized === "ZAR") {
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
    one_time: typeof data.one_time === "boolean" ? data.one_time : fallback?.one_time || false,
    allow_customer_amount: typeof data.allow_customer_amount === "boolean" ? data.allow_customer_amount : fallback?.allow_customer_amount || false,
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

export function normalizeTransaction(data: Record<string, unknown>): Transaction {
  const source = asRecord(data.source);
  const destination = asRecord(data.destination);
  const meta = asRecord(data.meta);
  const typeName = stringValue(data.type || data.transaction_type || data.kind, "transaction").toLowerCase();
  const statusName = stringValue(data.status, "completed").toLowerCase();
  const isCredit = typeof data.is_credit === "boolean" ? data.is_credit : undefined;
  const fiatCurrency = stringValue(data.fiat_currency || meta.fiat_currency || data.currency, "USD");
  const fiatValue = data.fiat_value ?? meta.fiat_value ?? data.amount;
  const amount = numberValue(fiatValue, numberValue(data.amount));
  const currency = normalizeCurrency(fiatCurrency);
  const isSettlement = typeName.includes("withdraw");
  const isOutgoing = typeName.includes("fee") || typeName.includes("withdraw") || isCredit === false;
  const type: Transaction["type"] = isSettlement ? "settlement" : isOutgoing ? "outgoing" : "incoming";
  const description = firstString(
    data.description,
    data.title,
    data.narration,
    typeName
      .split(/[_\s-]+/)
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() + part.slice(1))
      .join(" ")
  ) || "Transaction";
  const counterparty = firstString(
    source.account_name,
    source.name,
    destination.account_name,
    destination.name,
    source.account_number,
    destination.account_number
  ) || undefined;

  return {
    id: stringValue(data.id, `txn-${Date.now()}`),
    account_id: DEMO_ACCOUNT.id,
    type,
    amount,
    currency,
    status:
      statusName === "pending" || statusName === "processing" || statusName === "failed" || statusName === "refunded"
        ? statusName
        : "completed",
    description,
    reference: stringValue(data.reference, stringValue(data.id, "")),
    sender_name: counterparty,
    sender_email: firstString(source.email, destination.email) || undefined,
    created_at: stringValue(data.created_at, new Date().toISOString()),
    settled_at: firstString(data.completed_at, data.updated_at) || undefined,
    metadata: data,
  };
}

export function normalizeQuote(data: Record<string, unknown>): Quote {
  const rate = asRecord(data.rate);
  const fees = Array.isArray(data.fees) ? data.fees.map(asRecord) : [];

  return {
    id: stringValue(data.id),
    source_currency: stringValue(data.source_currency),
    target_currency: stringValue(data.target_currency),
    source_amount: stringValue(data.source_amount),
    target_amount: stringValue(data.target_amount),
    quote_currency: stringValue(data.quote_currency) || undefined,
    quote_amount: stringValue(data.quote_amount) || undefined,
    reference: stringValue(data.reference, stringValue(data.id)),
    status: stringValue(data.status, "pending"),
    expires_at: stringValue(data.expires_at),
    created_at: stringValue(data.created_at) || undefined,
    updated_at: stringValue(data.updated_at) || undefined,
    rate: Object.keys(rate).length
      ? {
          product: stringValue(rate.product) || undefined,
          pair: stringValue(rate.pair) || undefined,
          rate: stringValue(rate.rate),
          side: stringValue(rate.side) || undefined,
          type: stringValue(rate.type) || undefined,
          source_currency: stringValue(rate.source_currency) || undefined,
          target_currency: stringValue(rate.target_currency) || undefined,
        }
      : undefined,
    fees: fees.map((fee) => ({
      name: stringValue(fee.name) || undefined,
      amount: stringValue(fee.amount),
      currency: stringValue(fee.currency) || undefined,
    })),
  };
}

export function normalizeAccountSummary(items: Record<string, unknown>[]): Account {
  const preferredLocalCurrencies = ["NGN", "KES", "GHS", "ZAR", "USD", "EUR", "GBP"];
  let usdBalance = 0;
  const fiatBalances = new Map<string, number>();

  for (const item of items) {
    const available = asRecord(item.available);
    const availableAmount = amountValue(available.amount, amountValue(available));
    const availableFiat = asRecord(available.fiat);
    const currency = stringValue(item.currency).toUpperCase();
    const type = stringValue(item.type).toLowerCase();
    const fiatAmount = amountValue(availableFiat.amount, availableAmount);
    const fiatCurrency = stringValue(availableFiat.currency, currency).toUpperCase();

    if (currency === "USD" && type === "fiat") {
      usdBalance += availableAmount;
    } else if (fiatCurrency === "USD") {
      usdBalance += fiatAmount;
    }

    if (type === "fiat" && currency) {
      fiatBalances.set(currency, (fiatBalances.get(currency) || 0) + availableAmount);
    }
  }

  const localCurrency =
    preferredLocalCurrencies.find((currency) => fiatBalances.has(currency)) ||
    [...fiatBalances.keys()][0] ||
    DEMO_ACCOUNT.local_currency;
  const localBalance = fiatBalances.get(localCurrency) || usdBalance || DEMO_ACCOUNT.balance_local;
  const primaryProfile =
    items.find((item) => typeof item.profile_id === "string") || items.find((item) => typeof item.user_id === "string");

  return {
    id: stringValue(primaryProfile?.profile_id, DEMO_ACCOUNT.id),
    user_id: stringValue(primaryProfile?.user_id, DEMO_ACCOUNT.user_id),
    balance_usd: usdBalance || (localCurrency === "USD" ? localBalance : DEMO_ACCOUNT.balance_usd),
    balance_local: localBalance,
    local_currency: normalizeCurrency(localCurrency, DEMO_ACCOUNT.local_currency) as Account["local_currency"],
    is_demo: false,
  };
}

function normalizeSettlementStatus(status: string): Settlement["status"] {
  switch (status.toLowerCase()) {
    case "pending":
      return "pending";
    case "processing":
    case "funds_received":
    case "outgoing_payment_sent":
      return "processing";
    case "completed":
    case "funds_delivered":
    case "funds_converted":
      return "settled";
    default:
      return "failed";
  }
}

export function normalizeSettlement(data: Record<string, unknown>, recipient?: Recipient): Settlement {
  const payOut = asRecord(data.pay_out);
  const rate = asRecord(data.rate);
  const fees = Array.isArray(data.fees) ? data.fees.map(asRecord) : [];
  const sourceCurrency = stringValue(data.source_currency, "USD").toUpperCase();
  const targetCurrency = stringValue(data.target_currency, recipient?.currency || "NGN").toUpperCase();
  const sourceAmount = numberValue(data.source_amount);
  const targetAmount = numberValue(data.target_amount);
  const feeUsd = fees.reduce((sum, fee) => {
    const feeAmount = amountValue(fee.amount, amountValue(fee));
    const feeCurrency = amountCurrency(fee.amount, stringValue(fee.currency, "USD")).toUpperCase();
    return feeCurrency === "USD" ? sum + feeAmount : sum;
  }, 0);
  const exchangeRate =
    numberValue(rate.rate) || (sourceAmount > 0 ? Number((targetAmount / sourceAmount).toFixed(6)) : 0);

  return {
    id: stringValue(data.id, `set-${Date.now()}`),
    account_id: DEMO_ACCOUNT.id,
    recipient_id: recipient?.id || stringValue(payOut.recipient_id, "unknown-recipient"),
    recipient,
    amount_usd: sourceCurrency === "USD" ? sourceAmount : 0,
    amount_local: targetAmount,
    local_currency: normalizeCurrency(targetCurrency, recipient?.currency || "NGN") as Settlement["local_currency"],
    exchange_rate: exchangeRate,
    fee_usd: feeUsd,
    status: normalizeSettlementStatus(stringValue(data.status, "processing")),
    reference: stringValue(data.reference, stringValue(data.id)),
    note: stringValue(data.description) || undefined,
    created_at: stringValue(data.created_at, new Date().toISOString()),
    completed_at: firstString(data.completed_at, data.updated_at) || undefined,
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
    category: stringValue(data.category),
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
