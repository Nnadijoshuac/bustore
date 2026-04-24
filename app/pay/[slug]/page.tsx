"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import QRCode from "qrcode";
import type { PaymentLink, PaymentRequest } from "@/types";
import { createPaymentRequest, getPaymentRequest } from "@/lib/api/service";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle2, Clock3, Copy, CreditCard, Lock } from "lucide-react";

const LOCAL_STORAGE_PAYMENT_LINKS_KEY = "bushapay_payment_links";
const PAYMENT_METHOD_OPTIONS = [
  { value: "USDT", label: "USDT", description: "Stablecoin payment" },
  { value: "BTC", label: "BTC", description: "Bitcoin payment" },
  { value: "NGN", label: "NGN", description: "Naira collection" },
  { value: "USD", label: "USD", description: "Dollar collection" },
  { value: "KES", label: "KES", description: "Kenyan shilling collection" },
] as const;

function formatInvoiceAmount(link: PaymentLink, fallbackAmount: string) {
  return link.amount?.toLocaleString() || fallbackAmount || "Custom";
}

function getAmountPrefix(currency: PaymentLink["currency"]) {
  if (currency === "USD") return "$";
  if (currency === "NGN") return "N";
  return currency;
}

function buildQrPayload(paymentRequest?: PaymentRequest) {
  if (!paymentRequest?.pay_in?.address) {
    return "";
  }

  const { address, network } = paymentRequest.pay_in;
  const amountPart =
    paymentRequest.source_amount && paymentRequest.source_currency
      ? `&amount=${paymentRequest.source_amount}&currency=${paymentRequest.source_currency}`
      : "";

  return `${address}${network ? `?network=${network}` : ""}${amountPart}`;
}

function getPayInDetails(paymentRequest?: PaymentRequest) {
  const isCryptoPayment = paymentRequest?.pay_in?.type === "address";

  return {
    isCryptoPayment,
    payInLabel: isCryptoPayment ? "Deposit Address" : "Account Number",
    payInValue: isCryptoPayment ? paymentRequest?.pay_in?.address : paymentRequest?.pay_in?.account_number,
  };
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_24%),linear-gradient(180deg,_#f8fbfc_0%,_#eef3f1_52%,_#fbfcfc_100%)] px-3 py-6 sm:p-4">
      <div className="mx-auto flex w-full max-w-5xl flex-col justify-center">{children}</div>
    </div>
  );
}

function BrandHeader() {
  return (
    <div className="mb-6 flex items-center justify-center gap-3 sm:mb-8">
      <Image
        src="/logo_fluent.png"
        alt="Fluent logo"
        width={148}
        height={100}
        priority
        sizes="148px"
        className="h-12 w-auto object-contain"
      />
      <div>
        <span className="font-display text-lg font-bold sm:text-xl">Fluent</span>
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Invoice Desk</p>
      </div>
    </div>
  );
}

function CenteredMessage({
  title,
  description,
}: {
  title?: string;
  description: string;
}) {
  return (
    <PageShell>
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          {title ? <h1 className="mb-2 font-display text-xl font-bold">{title}</h1> : null}
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </PageShell>
  );
}

function InvoiceMetaCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function PaymentMethodGrid({
  selectedValue,
  onSelect,
}: {
  selectedValue: (typeof PAYMENT_METHOD_OPTIONS)[number]["value"];
  onSelect: (value: (typeof PAYMENT_METHOD_OPTIONS)[number]["value"]) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {PAYMENT_METHOD_OPTIONS.map((option) => {
        const isSelected = selectedValue === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className={`rounded-2xl border px-4 py-3 text-left transition-all ${
              isSelected
                ? "border-white bg-white text-slate-950 shadow-sm"
                : "border-white/10 bg-transparent text-white hover:border-white/30 hover:bg-white/[0.03]"
            }`}
          >
            <p className={isSelected ? "font-semibold text-slate-950" : "font-semibold text-white"}>{option.label}</p>
            <p className={isSelected ? "mt-1 text-xs text-slate-500" : "mt-1 text-xs text-white/50"}>
              {option.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function ReceiptMetric({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="border-b border-white/10 pb-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">{label}</p>
      <div className="mt-2">{value}</div>
    </div>
  );
}

function ReceiptInfoBlock({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">{label}</p>
      <div className="mt-2">{value}</div>
    </div>
  );
}

function TimelineCard({
  title,
  status,
  description,
}: {
  title: string;
  status: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">{title}</p>
        <span className="text-[10px] uppercase tracking-[0.18em] text-white/45">{status}</span>
      </div>
      <p className="mt-1 text-sm leading-6 text-white/60">{description}</p>
    </div>
  );
}

function InvoicePanel({
  link,
  paymentAmount,
}: {
  link: PaymentLink;
  paymentAmount: string;
}) {
  return (
    <section className="border-b border-border/40 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">Invoice</p>
          <h1 className="mt-4 max-w-xl break-words font-display text-3xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-4xl">
            {link.title}
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-7 text-slate-600">
            {link.description || "Payment for this invoice."}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Invoice ID</p>
          <p className="mt-1 font-mono text-sm font-medium text-slate-800">{link.slug}</p>
        </div>
      </div>

      <div className="mt-10 grid gap-8 border-t border-border/50 pt-6 sm:grid-cols-2">
        <InvoiceMetaCard label="Powered By" value="Fluent x Busha" />
        <InvoiceMetaCard label="Created" value={formatDate(link.created_at)} />
      </div>

      <div className="mt-12 border-t border-border/50 pt-8">
        <div className="grid gap-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div className="pr-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Line Item</p>
            <p className="mt-3 text-base font-semibold text-slate-950">{link.title}</p>
            <p className="mt-2 max-w-lg text-sm leading-7 text-slate-600">{link.description || "Invoice payment."}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Amount Due</p>
            <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{link.currency}</p>
            <p className="mt-1 font-display text-4xl font-semibold tracking-[-0.05em] text-slate-950">
              {formatInvoiceAmount(link, paymentAmount)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CheckoutPanel({
  link,
  amount,
  paymentAmount,
  paymentMethod,
  isPending,
  error,
  onAmountChange,
  onPaymentMethodChange,
  onSubmit,
}: {
  link: PaymentLink;
  amount: string;
  paymentAmount: string;
  paymentMethod: (typeof PAYMENT_METHOD_OPTIONS)[number]["value"];
  isPending: boolean;
  error?: string;
  onAmountChange: (value: string) => void;
  onPaymentMethodChange: (value: (typeof PAYMENT_METHOD_OPTIONS)[number]["value"]) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">Checkout</p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.04em]">Pay invoice</h2>
          <p className="mt-2 text-sm text-white/55">Choose a rail and generate payment details instantly.</p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Amount Due</p>
          <p className="mt-1 font-display text-3xl font-bold">
            {paymentAmount ? formatCurrency(parseFloat(paymentAmount), link.currency) : formatCurrency(link.amount || 0, link.currency)}
          </p>
        </div>
      </div>

      {!link.amount ? (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-white/80">Amount ({link.currency})</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-white/45">
              {getAmountPrefix(link.currency)}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(event) => onAmountChange(event.target.value)}
              placeholder="0.00"
              className="input-base border-white/10 bg-white/10 pl-8 text-white placeholder:text-white/30"
            />
          </div>
        </div>
      ) : null}

      <div className="border-t border-white/10 pt-5">
        <label className="mb-2 block text-sm font-medium text-white/80">Payment Method</label>
        <PaymentMethodGrid selectedValue={paymentMethod} onSelect={onPaymentMethodChange} />
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending || !paymentAmount}
        className="btn-primary w-full justify-center rounded-2xl py-3.5 text-base shadow-lg shadow-primary/20"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/20 border-t-slate-900" />
            Preparing instructions...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Generate QR Code
          </span>
        )}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-xs text-white/45">
        <Lock className="h-3 w-3" />
        Secure checkout
      </div>
    </form>
  );
}

function PaymentReceiptPanel({
  paymentRequest,
  qrCodeUrl,
  copied,
  onCopy,
}: {
  paymentRequest: PaymentRequest;
  qrCodeUrl: string;
  copied: boolean;
  onCopy: () => void;
}) {
  const { isCryptoPayment, payInLabel, payInValue } = getPayInDetails(paymentRequest);
  const statusIsCompleted = paymentRequest.status === "completed";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">Payment</p>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight">
            {statusIsCompleted ? "Payment confirmed" : "Scan to pay"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/65">
            {statusIsCompleted
              ? "Busha has confirmed this payment request."
              : `Send exactly ${paymentRequest.source_amount} ${paymentRequest.source_currency} using the details below.`}
          </p>
        </div>

        <div
          className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
            statusIsCompleted ? "bg-emerald-500/15 text-emerald-200" : "bg-amber-500/15 text-amber-100"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusIsCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
            <span className="capitalize">{paymentRequest.status}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ReceiptMetric
          label="Amount"
          value={
            <p className="font-display text-3xl font-bold text-white">
              {paymentRequest.source_amount} {paymentRequest.source_currency}
            </p>
          }
        />
        <ReceiptMetric
          label="Reference"
          value={<p className="break-all font-mono text-sm font-semibold text-white">{paymentRequest.reference}</p>}
        />
      </div>

      {isCryptoPayment && qrCodeUrl ? (
        <div className="flex justify-center border-y border-white/10 py-6">
          <Image
            src={qrCodeUrl}
            alt="Payment address QR code"
            width={220}
            height={220}
            unoptimized
            className="h-full w-full max-w-[220px]"
          />
        </div>
      ) : null}

      <div className="border-t border-white/10 pt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <ReceiptInfoBlock
            label="Network"
            value={
              <p className="text-sm font-semibold text-white">
                {paymentRequest.pay_in?.network || paymentRequest.pay_in?.provider || paymentRequest.target_currency}
              </p>
            }
          />
          <ReceiptInfoBlock
            label={payInLabel}
            value={
              <div className="font-mono text-xs break-all text-white/90">
                {payInValue || "Busha will provide this detail shortly."}
              </div>
            }
          />
        </div>

        {!isCryptoPayment ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {paymentRequest.pay_in?.bank_name ? (
              <ReceiptMetric
                label="Bank"
                value={<p className="text-sm font-semibold text-white">{paymentRequest.pay_in.bank_name}</p>}
              />
            ) : null}
            {paymentRequest.pay_in?.account_name ? (
              <ReceiptMetric
                label="Account Name"
                value={<p className="text-sm font-semibold text-white">{paymentRequest.pay_in.account_name}</p>}
              />
            ) : null}
            {paymentRequest.pay_in?.phone_number ? (
              <div className="sm:col-span-2">
                <ReceiptMetric
                  label="Phone Number"
                  value={<p className="text-sm font-semibold text-white">{paymentRequest.pay_in.phone_number}</p>}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <button
        onClick={onCopy}
        className="btn-secondary w-full justify-center rounded-2xl border-white/15 bg-white/8 py-3 text-white hover:bg-white/12"
      >
        <Copy className="h-4 w-4" />
        {copied ? "Copied" : `Copy ${isCryptoPayment ? "Address" : "Account"}`}
      </button>

      {paymentRequest.pay_in?.expires_at ? (
        <p className="text-center text-xs text-white/45">Expires {formatDate(paymentRequest.pay_in.expires_at)}</p>
      ) : null}

      {paymentRequest.timeline?.events?.length ? (
        <div className="space-y-3">
          {paymentRequest.timeline.events.map((event) => (
            <TimelineCard
              key={`${event.step}-${event.status}`}
              title={event.title}
              status={event.status}
              description={event.description}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function PublicPaymentPage() {
  const { slug } = useParams();
  const slugValue = Array.isArray(slug) ? slug[0] : slug;
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    (typeof PAYMENT_METHOD_OPTIONS)[number]["value"] | null
  >(null);

  useEffect(() => {
    window.localStorage.removeItem(LOCAL_STORAGE_PAYMENT_LINKS_KEY);
  }, []);

  const { data: link, error, isLoading } = useQuery({
    queryKey: ["payment-link", slugValue],
    queryFn: async () => {
      const response = await fetch(`/api/payment-links/${slugValue}`, { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Payment link not found.");
      }

      const result = (await response.json()) as { data: PaymentLink };
      return result.data;
    },
    enabled: Boolean(slugValue),
  });

  const paymentAmount = link?.amount ? String(link.amount) : amount;
  const paymentMethod =
    selectedPaymentMethod ||
    PAYMENT_METHOD_OPTIONS.find((option) => option.value === link?.currency)?.value ||
    "USDT";

  const paymentRequestMutation = useMutation({
    mutationFn: () =>
      createPaymentRequest({
        payment_link_id: link!.id,
        payment_link_slug: link!.slug,
        amount: paymentAmount,
        quote_currency: link!.currency,
        target_currency: paymentMethod,
        email: "checkout@fluent.so",
        name: "Guest Payer",
      }),
  });

  const requestId = paymentRequestMutation.data?.id;
  const { data: paymentRequest } = useQuery({
    queryKey: ["payment-request", requestId],
    queryFn: () => getPaymentRequest(requestId!),
    enabled: Boolean(requestId),
    initialData: paymentRequestMutation.data,
    refetchInterval: (query) => {
      const request = query.state.data as PaymentRequest | undefined;
      return request?.status === "pending" ? 5000 : false;
    },
  });

  const qrPayload = buildQrPayload(paymentRequest);
  const { data: qrCodeUrl = "" } = useQuery({
    queryKey: ["payment-request-qr", qrPayload],
    queryFn: () => QRCode.toDataURL(qrPayload, { margin: 1, width: 220 }),
    enabled: Boolean(qrPayload),
  });

  if (isLoading) {
    return <CenteredMessage description="Loading payment link..." />;
  }

  if (!link) {
    return (
      <CenteredMessage
        title="Payment link unavailable"
        description={error instanceof Error ? error.message : "The payment link could not be loaded."}
      />
    );
  }

  const handlePay = () => {
    if (!paymentAmount) {
      return;
    }

    paymentRequestMutation.mutate();
  };

  const handleCopyPaymentDetail = async () => {
    const { payInValue } = getPayInDetails(paymentRequest);

    if (!payInValue) {
      return;
    }

    await navigator.clipboard.writeText(payInValue);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <PageShell>
      <BrandHeader />

      <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/92 shadow-[0_28px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
          <InvoicePanel link={link} paymentAmount={paymentAmount} />

          <section className="bg-[linear-gradient(180deg,_#0f172a_0%,_#111f2f_100%)] p-6 text-white sm:p-8 lg:p-10">
            {!paymentRequest ? (
              <CheckoutPanel
                link={link}
                amount={amount}
                paymentAmount={paymentAmount}
                paymentMethod={paymentMethod}
                isPending={paymentRequestMutation.isPending}
                error={
                  paymentRequestMutation.error instanceof Error
                    ? paymentRequestMutation.error.message
                    : undefined
                }
                onAmountChange={setAmount}
                onPaymentMethodChange={setSelectedPaymentMethod}
                onSubmit={handlePay}
              />
            ) : (
              <PaymentReceiptPanel
                paymentRequest={paymentRequest}
                qrCodeUrl={qrCodeUrl}
                copied={copied}
                onCopy={handleCopyPaymentDetail}
              />
            )}
          </section>
        </div>
      </div>
    </PageShell>
  );
}
