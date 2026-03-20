// ============================================================
// BushaPay Core Types
// All crypto abstracted — these are pure payment platform types
// ============================================================

export type Currency = "USD" | "EUR" | "GBP" | "NGN" | "GHS" | "KES" | "ZAR";
export type PaymentTargetCurrency = "USDT" | "BTC" | "NGN" | "USD" | "KES";

export type TransactionStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded";

export type PaymentLinkStatus = "active" | "inactive" | "archived";

export type SettlementStatus = "pending" | "processing" | "settled" | "failed";
export type CustomerStatus = "inactive" | "in_review" | "active" | "rejected";
export type CustomerType = "individual" | "business";
export type KycDocumentType = "passport" | "national-id" | "selfie";

// ─── User / Account ─────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name: string;
  business_name?: string;
  avatar_url?: string;
  country: string;
  created_at: string;
  kyc_status: "pending" | "verified" | "rejected";
}

export interface Account {
  id: string;
  user_id: string;
  // Displayed to user as plain balance, never as crypto
  balance_usd: number;
  balance_local: number;
  local_currency: Currency;
  is_demo: boolean;
}

// ─── Transactions ────────────────────────────────────────────

export interface Transaction {
  id: string;
  account_id: string;
  type: "incoming" | "outgoing" | "settlement";
  amount: number;
  currency: Currency;
  status: TransactionStatus;
  description: string;
  reference: string;
  sender_name?: string;
  sender_email?: string;
  payment_link_id?: string;
  created_at: string;
  settled_at?: string;
  metadata?: Record<string, unknown>;
}

// ─── Payment Links ───────────────────────────────────────────

export interface PaymentLink {
  id: string;
  account_id: string;
  title: string;
  description?: string;
  amount?: number; // null = customer-defined
  currency: Currency;
  target_currency?: PaymentTargetCurrency;
  status: PaymentLinkStatus;
  slug: string; // e.g. pay.bushapay.com/pay/{slug}
  hosted_url?: string;
  redirect_url?: string;
  total_collected: number;
  payment_count: number;
  created_at: string;
  expires_at?: string;
}

export interface CreatePaymentLinkInput {
  title: string;
  description?: string;
  amount?: number;
  currency: Currency;
  target_currency?: PaymentTargetCurrency;
  one_time?: boolean;
  allow_customer_amount?: boolean;
  min_amount?: number;
  max_amount?: number;
  redirect_url?: string;
  expires_at?: string;
}

export interface PaymentRequest {
  id: string;
  status: string;
  source_amount: string;
  source_currency: string;
  target_amount: string;
  target_currency: string;
  reference: string;
  expires_at: string;
  additional_info: {
    email: string;
    name?: string;
    phone_number?: string;
    source?: string;
  };
  pay_in?: {
    type: string;
    address?: string;
    network?: string;
    memo?: string;
    account_name?: string;
    bank_name?: string;
    account_number?: string;
    provider?: string;
    phone_number?: string;
    expires_at?: string;
  };
  timeline?: {
    total_steps: number;
    current_step: number;
    transfer_status: string;
    events: Array<{
      step: number;
      done: boolean;
      status: string;
      title: string;
      description: string;
      timestamp?: string;
    }>;
  };
}

export interface CustomerAddress {
  city: string;
  state: string;
  county?: string;
  country_id: string;
  address_line_1: string;
  address_line_2?: string;
  province?: string;
  postal_code: string;
}

export interface CustomerIdentifyingInformation {
  type: KycDocumentType;
  number?: string;
  country: string;
  image_front: string;
  image_back?: string;
}

export interface Customer {
  id: string;
  business_id?: string;
  email: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  phone: string;
  type: CustomerType;
  country_id: string;
  birth_date?: string;
  address: CustomerAddress;
  status: CustomerStatus;
  level?: string;
  display_currency?: Currency | string;
  deposit?: boolean;
  payout?: boolean;
  has_accepted_terms_of_service?: boolean;
  created_at: string;
  updated_at?: string;
  identifying_information?: CustomerIdentifyingInformation[];
}

export interface CreateCustomerInput {
  email: string;
  has_accepted_terms: boolean;
  type: "individual";
  country_id: string;
  phone: string;
  birth_date: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  address: CustomerAddress;
  identifying_information?: CustomerIdentifyingInformation[];
}

// ─── Recipients ──────────────────────────────────────────────

export interface Recipient {
  id: string;
  account_id: string;
  name: string;
  email?: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  country: string;
  currency: Currency;
  is_verified: boolean;
  created_at: string;
  type?: string;
  legal_entity_type?: string;
  active?: boolean;
  owned_by_customer?: boolean;
  fields?: RecipientField[];
}

export interface RecipientField {
  name: string;
  value: string;
  display_name: string;
  required: boolean;
  is_copyable: boolean;
  is_visible: boolean;
}

export interface RecipientRequirementOption {
  label: string;
  value: string;
}

export interface RecipientRequirement {
  name: string;
  display_name: string;
  type: string;
  required: boolean;
  description?: string;
  options?: RecipientRequirementOption[];
}

export interface CreateRecipientInput {
  country_id: string;
  currency_id: string;
  type?: string;
  legal_entity_type?: string;
  customer_id?: string;
  fields: Array<{
    name: string;
    value: string;
  }>;
}

// ─── Settlements ─────────────────────────────────────────────

export interface Settlement {
  id: string;
  account_id: string;
  recipient_id: string;
  recipient?: Recipient;
  amount_usd: number;
  amount_local: number;
  local_currency: Currency;
  exchange_rate: number;
  fee_usd: number;
  status: SettlementStatus;
  reference: string;
  note?: string;
  created_at: string;
  completed_at?: string;
}

export interface CreateSettlementInput {
  recipient_id: string;
  amount_usd: number;
  note?: string;
}

// ─── Webhooks ────────────────────────────────────────────────

export interface Webhook {
  id: string;
  account_id: string;
  url: string;
  events: WebhookEvent[];
  is_active: boolean;
  secret: string;
  created_at: string;
  last_triggered_at?: string;
  failure_count: number;
}

export interface WebhookDelivery {
  id: string;
  event: string;
  received_at: string;
  payload: Record<string, unknown>;
  signature?: string;
}

export type WebhookEvent =
  | "payment.received"
  | "payment.failed"
  | "settlement.initiated"
  | "settlement.completed"
  | "payment_link.created"
  | "payment_link.paid";

// ─── API Response Wrappers ───────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: {
    total: number;
    page: number;
    per_page: number;
  };
}

export interface ApiError {
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}

// ─── Dashboard Analytics ─────────────────────────────────────

export interface DashboardStats {
  total_received_usd: number;
  total_received_change: number; // % vs last period
  pending_settlements_usd: number;
  active_payment_links: number;
  transactions_this_month: number;
  avg_transaction_usd: number;
}

export interface ChartDataPoint {
  date: string;
  amount: number;
  count: number;
}
