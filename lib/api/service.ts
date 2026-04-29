import {
  Account,
  ApiResponse,
  ChartDataPoint,
  CreateCustomerInput,
  CreatePaymentLinkInput,
  CreateRecipientInput,
  CreateSettlementInput,
  Customer,
  DashboardStats,
  PaymentLink,
  PaymentRequest,
  Quote,
  Recipient,
  RecipientRequirement,
  Settlement,
  Transaction,
} from "@/types";
import {
  DEMO_CHART_DATA,
  DEMO_STATS,
} from "./demo-data";

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

function isWithinLastDays(dateString: string, days: number, now = new Date()) {
  const date = new Date(dateString);
  const diff = now.getTime() - date.getTime();
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
}

function sumTransactions(transactions: Transaction[], predicate: (transaction: Transaction) => boolean) {
  return transactions.filter(predicate).reduce((sum, transaction) => sum + transaction.amount, 0);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [links, transactionsResponse, customers] = await Promise.all([
      getPaymentLinks(),
      getTransactions(),
      getCustomers(),
    ]);
    const transactions = transactionsResponse.data;
    const now = new Date();
    const currentWindowStart = new Date(now);
    currentWindowStart.setDate(currentWindowStart.getDate() - 30);
    const previousWindowStart = new Date(currentWindowStart);
    previousWindowStart.setDate(previousWindowStart.getDate() - 30);

    const currentWindow = transactions.filter((transaction) => {
      const createdAt = new Date(transaction.created_at).getTime();
      return createdAt >= currentWindowStart.getTime() && createdAt <= now.getTime();
    });
    const previousWindow = transactions.filter((transaction) => {
      const createdAt = new Date(transaction.created_at).getTime();
      return createdAt >= previousWindowStart.getTime() && createdAt < currentWindowStart.getTime();
    });

    const totalReceivedCurrent = sumTransactions(
      currentWindow,
      (transaction) => transaction.type === "incoming" && transaction.status === "completed"
    );
    const totalReceivedPrevious = sumTransactions(
      previousWindow,
      (transaction) => transaction.type === "incoming" && transaction.status === "completed"
    );
    const totalReceivedAllTime = sumTransactions(
      transactions,
      (transaction) => transaction.type === "incoming" && transaction.status === "completed"
    );
    const currentMonthTransactions = transactions.filter((transaction) =>
      isWithinLastDays(transaction.created_at, 30, now)
    );
    const completedIncomingCount = Math.max(
      currentWindow.filter((transaction) => transaction.type === "incoming" && transaction.status === "completed").length,
      1
    );
    const change =
      totalReceivedPrevious > 0
        ? ((totalReceivedCurrent - totalReceivedPrevious) / totalReceivedPrevious) * 100
        : totalReceivedCurrent > 0
          ? 100
          : 0;

    return {
      total_received_usd: totalReceivedAllTime,
      total_received_change: Number(change.toFixed(1)),
      pending_settlements_usd: sumTransactions(
        transactions,
        (transaction) =>
          transaction.type !== "incoming" &&
          (transaction.status === "pending" || transaction.status === "processing")
      ),
      active_payment_links: links.filter((link) => link.status === "active").length,
      transactions_this_month: currentMonthTransactions.length,
      avg_transaction_usd: Number((totalReceivedCurrent / completedIncomingCount).toFixed(2)),
      customer_count: customers.length,
    };
  } catch {
    return DEMO_STATS;
  }
}

export async function getChartData(): Promise<ChartDataPoint[]> {
  try {
    const { data } = await getTransactions();
    const now = new Date();
    const points: ChartDataPoint[] = [];

    for (let offset = 29; offset >= 0; offset -= 1) {
      const day = new Date(now);
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - offset);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayTransactions = data.filter((transaction) => {
        const createdAt = new Date(transaction.created_at).getTime();
        return (
          createdAt >= day.getTime() &&
          createdAt < nextDay.getTime() &&
          transaction.type === "incoming" &&
          transaction.status === "completed"
        );
      });

      points.push({
        date: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        amount: dayTransactions.reduce((sum, transaction) => sum + transaction.amount, 0),
        count: dayTransactions.length,
      });
    }

    return points;
  } catch {
    await delay();
    return DEMO_CHART_DATA;
  }
}

export async function getTransactions(params?: {
  page?: number;
  status?: string;
  type?: string;
}): Promise<ApiResponse<Transaction[]>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.status) searchParams.set("status", params.status);
  if (params?.type) searchParams.set("type", params.type);

  const response = await fetch(`/api/transactions${searchParams.size ? `?${searchParams.toString()}` : ""}`, {
    cache: "no-store",
  });
  const result = (await response.json()) as ApiResponse<Transaction[]> & { error?: string };

  if (!response.ok || !result.data) {
    throw new Error(result.error || "Unable to load transactions.");
  }

  return result;
}

export async function getAccount(): Promise<Account> {
  const response = await fetch("/api/account", { cache: "no-store" });
  const result = (await response.json()) as { data?: Account; error?: string };

  if (!response.ok || !result.data) {
    throw new Error(result.error || "Unable to load account.");
  }

  return result.data;
}

export async function getPaymentLinks(): Promise<PaymentLink[]> {
  const response = await fetch("/api/payment-links", { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Unable to load payment links.");
  }

  const result = (await response.json()) as { data: PaymentLink[] };
  return result.data;
}

export async function createPaymentLink(input: CreatePaymentLinkInput): Promise<PaymentLink> {
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
  quote_amount: string;
  quote_currency: string;
  source_currency: string;
  target_currency: string;
  email: string;
  name: string;
  phone_number?: string;
  reference?: string;
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

export async function createQuote(input: {
  source_currency: string;
  target_currency: string;
  source_amount?: string;
  target_amount?: string;
  pay_in?: Record<string, unknown>;
  pay_out?: Record<string, unknown>;
}): Promise<Quote> {
  const response = await fetch("/api/quotes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const result = (await response.json()) as { data?: Quote; error?: string };

  if (!response.ok || !result.data) {
    throw new Error(result.error || "Unable to create quote.");
  }

  return result.data;
}

export async function togglePaymentLink(
  _id: string,
  _status: "active" | "inactive"
): Promise<void> {
  void _id;
  void _status;
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

export async function getSettlements(): Promise<Settlement[]> {
  const response = await fetch("/api/settlements", { cache: "no-store" });
  const result = (await response.json()) as { data?: Settlement[]; error?: string };

  if (!response.ok || !result.data) {
    throw new Error(result.error || "Unable to load settlements.");
  }

  return result.data;
}

export async function createSettlement(input: CreateSettlementInput): Promise<Settlement> {
  const response = await fetch("/api/settlements", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const result = (await response.json()) as { data?: Settlement; error?: string };

  if (!response.ok || !result.data) {
    throw new Error(result.error || "Unable to create settlement.");
  }

  return result.data;
}
