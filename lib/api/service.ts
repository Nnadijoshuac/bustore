import {
  Transaction,
  PaymentLink,
  PaymentRequest,
  Recipient,
  RecipientRequirement,
  Settlement,
  DashboardStats,
  ChartDataPoint,
  Webhook,
  WebhookDelivery,
  Customer,
  CreateCustomerInput,
  CreateRecipientInput,
  CreatePaymentLinkInput,
  CreateSettlementInput,
  ApiResponse,
} from "@/types";
import {
  DEMO_TRANSACTIONS,
  DEMO_RECIPIENTS,
  DEMO_SETTLEMENTS,
  DEMO_STATS,
  DEMO_CHART_DATA,
  DEMO_ACCOUNT,
} from "./demo-data";

// Helper: simulate async latency in demo mode
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// ─── Dashboard ───────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  // Try to get real count of payment links if possible, else fallback to demo
  try {
    const links = await getPaymentLinks();
    const activeLinksCount = links.filter(l => l.status === "active").length;
    return {
      ...DEMO_STATS,
      active_payment_links: activeLinksCount,
    };
  } catch (error) {
    return DEMO_STATS;
  }
}

export async function getChartData(): Promise<ChartDataPoint[]> {
  // TODO: GET /api/v1/accounts/{id}/chart?period=30d
  await delay();
  return DEMO_CHART_DATA;
}

// ─── Transactions ────────────────────────────────────────────

export async function getTransactions(params?: {
  page?: number;
  status?: string;
  type?: string;
}): Promise<ApiResponse<Transaction[]>> {
  // TODO: GET /api/v1/accounts/{id}/transactions
  await delay();
  let data = [...DEMO_TRANSACTIONS];
  if (params?.status) data = data.filter((t) => t.status === params.status);
  if (params?.type) data = data.filter((t) => t.type === params.type);
  return { data, meta: { total: data.length, page: 1, per_page: 20 } };
}

// ─── Payment Links ───────────────────────────────────────────

export async function getPaymentLinks(): Promise<PaymentLink[]> {
  const response = await fetch("/api/payment-links", { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Unable to load payment links.");
  }

  const result = (await response.json()) as { data: PaymentLink[] };
  return result.data;
}

export async function createPaymentLink(
  input: CreatePaymentLinkInput
): Promise<PaymentLink> {
  const response = await fetch("/api/payment-links", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const result = (await response.json()) as { data?: PaymentLink; error?: string };

  if (!response.ok || !result.data) {
    throw new Error(result.error || "Unable to create payment link.");
  }

  return result.data;
}

export async function createPaymentRequest(input: {
  payment_link_id: string;
  payment_link_slug: string;
  amount: string;
  quote_currency: string;
  target_currency: string;
  email: string;
  name: string;
}): Promise<PaymentRequest> {
  const response = await fetch("/api/payment-requests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const result = (await response.json()) as { data?: PaymentRequest; error?: string };

  if (!response.ok || !result.data) {
    throw new Error(result.error || "Unable to create payment request.");
  }

  return result.data;
}

export async function getPaymentRequest(id: string): Promise<PaymentRequest> {
  const response = await fetch(`/api/payment-requests/${id}`, {
    cache: "no-store",
  });

  const result = (await response.json()) as { data?: PaymentRequest; error?: string };

  if (!response.ok || !result.data) {
    throw new Error(result.error || "Unable to load payment request.");
  }

  return result.data;
}

export async function togglePaymentLink(
  _id: string,
  _status: "active" | "inactive"
): Promise<void> {
  void _id;
  void _status;
  // TODO: PATCH /api/v1/payment-links/{id}
  await delay(400);
}

export async function getCustomers(): Promise<Customer[]> {
  const response = await fetch("/api/customers", { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Unable to load customers.");
  }

  const result = (await response.json()) as { data: Customer[] };
  return result.data;
}

export async function createCustomer(input: CreateCustomerInput): Promise<Customer> {
  const response = await fetch("/api/customers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const result = (await response.json()) as { data?: Customer; error?: string };

  if (!response.ok || !result.data) {
    throw new Error(result.error || "Unable to create customer.");
  }

  return result.data;
}

export async function verifyCustomer(id: string): Promise<Customer> {
  const response = await fetch(`/api/customers/${id}/verify`, {
    method: "POST",
  });

  const result = (await response.json()) as { data?: Customer; error?: string };

  if (!response.ok || !result.data) {
    throw new Error(result.error || "Unable to verify customer.");
  }

  return result.data;
}

// ─── Recipients ──────────────────────────────────────────────

export async function getRecipients(): Promise<Recipient[]> {
  const response = await fetch("/api/recipients", { cache: "no-store" });
  const result = (await response.json()) as { data?: Recipient[]; error?: string };

  if (!response.ok || !result.data) {
    throw new Error(result.error || "Unable to load recipients.");
  }

  return result.data;
}

export async function getRecipientRequirements(
  countryId: string,
  currencyId: string
): Promise<RecipientRequirement[]> {
  const response = await fetch(
    `/api/recipients/requirements?country_id=${encodeURIComponent(countryId)}&currency_id=${encodeURIComponent(currencyId)}`,
    { cache: "no-store" }
  );
  const result = (await response.json()) as { data?: RecipientRequirement[]; error?: string };

  if (!response.ok || !result.data) {
    throw new Error(result.error || "Unable to load recipient requirements.");
  }

  return result.data;
}

export async function createRecipient(input: CreateRecipientInput): Promise<Recipient> {
  const response = await fetch("/api/recipients", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const result = (await response.json()) as { data?: Recipient; error?: string };

  if (!response.ok || !result.data) {
    throw new Error(result.error || "Unable to create recipient.");
  }

  return result.data;
}

// ─── Settlements ─────────────────────────────────────────────

export async function getSettlements(): Promise<Settlement[]> {
  // TODO: GET /api/v1/settlements
  await delay();
  return DEMO_SETTLEMENTS;
}

export async function createSettlement(
  input: CreateSettlementInput
): Promise<Settlement> {
  // TODO: POST /api/v1/settlements
  // TODO: confirm Busha API request body — does it accept USD amount + recipient?
  await delay(1000);
  const recipient = DEMO_RECIPIENTS.find((r) => r.id === input.recipient_id)!;
  return {
    id: `set-${Date.now()}`,
    account_id: DEMO_ACCOUNT.id,
    recipient_id: input.recipient_id,
    recipient,
    amount_usd: input.amount_usd,
    amount_local: input.amount_usd * 1547,
    local_currency: "NGN",
    exchange_rate: 1547,
    fee_usd: input.amount_usd * 0.003,
    status: "processing",
    reference: `SET-${Date.now()}`,
    note: input.note,
    created_at: new Date().toISOString(),
  };
}

// ─── Webhooks ────────────────────────────────────────────────

export async function getWebhooks(): Promise<Webhook[]> {
  const response = await fetch("/api/webhooks", { cache: "no-store" });
  const result = (await response.json()) as {
    data?: {
      endpoint_url: string;
      signing_secret_configured: boolean;
      deliveries: WebhookDelivery[];
    };
    error?: string;
  };

  if (!response.ok || !result.data) {
    throw new Error(result.error || "Unable to load webhook data.");
  }

  return [
    {
      id: "busha-receiver",
      account_id: DEMO_ACCOUNT.id,
      url: result.data.endpoint_url,
      events: ["payment.received", "payment.failed", "settlement.initiated", "settlement.completed", "payment_link.created", "payment_link.paid"],
      is_active: result.data.signing_secret_configured,
      secret: result.data.signing_secret_configured ? "Configured in env" : "Missing in env",
      created_at: new Date().toISOString(),
      last_triggered_at: result.data.deliveries[0]?.received_at,
      failure_count: 0,
    },
  ];
}

export async function getWebhookDeliveries(): Promise<WebhookDelivery[]> {
  const response = await fetch("/api/webhooks", { cache: "no-store" });
  const result = (await response.json()) as {
    data?: {
      deliveries: WebhookDelivery[];
    };
    error?: string;
  };

  if (!response.ok || !result.data) {
    throw new Error(result.error || "Unable to load webhook deliveries.");
  }

  return result.data.deliveries;
}
