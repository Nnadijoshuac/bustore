import type { PaymentRequest } from "@/types";

type DemoPaymentRequestRecord = {
  createdAt: number;
  paymentRequest: PaymentRequest;
};

const STORE_KEY = "__bushapay_demo_payment_requests__";
const COMPLETION_DELAY_MS = 45_000;

function getStore() {
  const globalStore = globalThis as typeof globalThis & {
    [STORE_KEY]?: Map<string, DemoPaymentRequestRecord>;
  };

  if (!globalStore[STORE_KEY]) {
    globalStore[STORE_KEY] = new Map<string, DemoPaymentRequestRecord>();
  }

  return globalStore[STORE_KEY]!;
}

function buildTimeline(status: "pending" | "completed"): PaymentRequest["timeline"] {
  return {
    total_steps: 3,
    current_step: status === "completed" ? 3 : 2,
    transfer_status: status,
    events: [
      {
        step: 1,
        done: true,
        status: "created",
        title: "Request created",
        description: "Fluent generated a payment request for this checkout.",
      },
      {
        step: 2,
        done: true,
        status: "awaiting_payment",
        title: "Payment details ready",
        description: "The payer can use the wallet or bank details shown below.",
      },
      {
        step: 3,
        done: status === "completed",
        status: status === "completed" ? "completed" : "pending",
        title: status === "completed" ? "Payment confirmed" : "Waiting for payment",
        description:
          status === "completed"
            ? "Demo mode auto-confirmed this payment request."
            : "Demo mode will auto-confirm this request shortly.",
      },
    ],
  };
}

export function createDemoPaymentRequest(input: {
  payment_link_slug: string;
  quote_amount: string;
  quote_currency: string;
  source_currency: string;
  target_currency: string;
  email: string;
  name: string;
  phone_number?: string;
  reference?: string;
}) {
  const now = Date.now();
  const expiresAt = new Date(now + 30 * 60_000).toISOString();
  const sourceCurrency = input.source_currency.toUpperCase();
  const isBankTransfer = sourceCurrency === "NGN";
  const id = `demo-pr-${now}`;

  const paymentRequest: PaymentRequest = {
    id,
    status: "pending",
    source_amount: input.quote_amount,
    source_currency: sourceCurrency,
    target_amount: input.quote_amount,
    target_currency: input.target_currency.toUpperCase(),
    reference: input.reference || `${input.payment_link_slug}-${now}`,
    expires_at: expiresAt,
    additional_info: {
      email: input.email,
      name: input.name,
      phone_number: input.phone_number,
      source: "demo",
    },
    pay_in: isBankTransfer
      ? {
          type: "bank_transfer",
          account_name: "Fluent Demo Collections",
          bank_name: "Demo Bank",
          account_number: "1029384756",
          provider: "NIP",
          expires_at: expiresAt,
        }
      : {
          type: "address",
          address:
            sourceCurrency === "BTC"
              ? "bc1qfluentdemowallet9w3r6z8k2m4n7p5t"
              : "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
          network: sourceCurrency === "BTC" ? "BTC" : "TRX",
          memo: undefined,
          expires_at: expiresAt,
        },
    timeline: buildTimeline("pending"),
  };

  getStore().set(id, { createdAt: now, paymentRequest });
  return paymentRequest;
}

export function getDemoPaymentRequest(id: string) {
  const record = getStore().get(id);

  if (!record) {
    return undefined;
  }

  const status = Date.now() - record.createdAt >= COMPLETION_DELAY_MS ? "completed" : "pending";

  return {
    ...record.paymentRequest,
    status,
    timeline: buildTimeline(status),
  } satisfies PaymentRequest;
}
