"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import QRCode from "qrcode";
import type { PaymentLink, PaymentRequest } from "@/types";
import { createPaymentRequest, getPaymentRequest } from "@/lib/api/service";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  FileText,
  Globe,
  Lock,
  Receipt,
  ShieldCheck,
} from "lucide-react";

const LOCAL_STORAGE_PAYMENT_LINKS_KEY = "bushapay_payment_links";
const PAYMENT_METHOD_OPTIONS = [
  { value: "USDT", label: "USDT", description: "Stablecoin payment" },
  { value: "BTC", label: "BTC", description: "Bitcoin payment" },
  { value: "NGN", label: "NGN", description: "Naira collection" },
  { value: "USD", label: "USD", description: "Dollar collection" },
  { value: "KES", label: "KES", description: "Kenyan shilling collection" },
] as const;

export default function PublicPaymentPage() {
  const { slug } = useParams();
  const slugValue = Array.isArray(slug) ? slug[0] : slug;
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
        email,
        name,
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

      if (!request) {
        return false;
      }

      return request.status === "pending" ? 5000 : false;
    },
  });

  const isCryptoPayment = paymentRequest?.pay_in?.type === "address";
  const payInLabel = isCryptoPayment ? "Deposit Address" : "Account Number";
  const payInValue = isCryptoPayment
    ? paymentRequest?.pay_in?.address
    : paymentRequest?.pay_in?.account_number;

  const qrPayload = paymentRequest?.pay_in?.address
    ? `${paymentRequest.pay_in.address}${paymentRequest.pay_in.network ? `?network=${paymentRequest.pay_in.network}` : ""}${
        paymentRequest.source_amount && paymentRequest.source_currency
          ? `&amount=${paymentRequest.source_amount}&currency=${paymentRequest.source_currency}`
          : ""
      }`
    : "";

  const { data: qrCodeUrl = "" } = useQuery({
    queryKey: ["payment-request-qr", qrPayload],
    queryFn: () =>
      QRCode.toDataURL(qrPayload, {
        margin: 1,
        width: 220,
      }),
    enabled: Boolean(qrPayload),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 p-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <p className="text-sm text-muted-foreground">Loading payment link...</p>
        </div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 p-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <h1 className="mb-2 font-display text-xl font-bold">Payment link unavailable</h1>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "The payment link could not be loaded."}
          </p>
        </div>
      </div>
    );
  }

  const handlePay = () => {
    if (!name || !email || !paymentAmount) return;
    paymentRequestMutation.mutate();
  };

  const copyAddress = async (request: PaymentRequest) => {
    const value = request.pay_in?.type === "address" ? request.pay_in.address : request.pay_in?.account_number;

    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_24%),linear-gradient(180deg,_#f5f8fb_0%,_#edf4f1_52%,_#f9fbfc_100%)] px-3 py-6 sm:p-4">
      <div className="mx-auto flex w-full max-w-5xl flex-col justify-center">
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

        <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 shadow-[0_28px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
            <section className="border-b border-border/40 p-5 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                    <FileText className="h-3.5 w-3.5" />
                    Invoice
                  </div>
                  <h1 className="mt-5 break-words font-display text-3xl font-bold tracking-[-0.04em] text-busha-slate sm:text-4xl">
                    {link.title}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                    {link.description || "Professional services rendered and payable through Fluent's Busha-backed collection flow."}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/50 bg-slate-50 px-4 py-3 text-right shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Invoice ID</p>
                  <p className="mt-1 font-mono text-sm font-semibold text-slate-800">{link.slug}</p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/50 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Issued Through</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">Fluent Collections</p>
                </div>
                <div className="rounded-2xl border border-border/50 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Collection Rail</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">Busha Payment Request</p>
                </div>
                <div className="rounded-2xl border border-border/50 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Created</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{formatDate(link.created_at)}</p>
                </div>
              </div>

              <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-border/50">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] border-b border-border/50 bg-slate-100/70 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground sm:px-5">
                  <span>Line Item</span>
                  <span>Amount</span>
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] px-4 py-5 sm:px-5">
                  <div className="pr-4">
                    <p className="text-sm font-semibold text-slate-900">{link.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {link.description || "One-time invoice issued for client settlement through Fluent."}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{link.currency}</p>
                    <p className="mt-1 font-display text-2xl font-bold text-slate-900">
                      {link.amount?.toLocaleString() || paymentAmount || "Custom"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] border-t border-border/50 bg-slate-50 px-4 py-4 sm:px-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Amount Due</p>
                    <p className="mt-1 text-sm text-slate-600">Inclusive of live payment instructions generated at checkout.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{link.currency}</p>
                    <p className="mt-1 font-display text-3xl font-bold text-busha-slate">
                      {link.amount?.toLocaleString() || paymentAmount || "Open"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-slate-700">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-semibold text-slate-900">Verified collection flow</p>
                  <p className="mt-1 leading-6">
                    Payment instructions are issued only when checkout begins, keeping this invoice current, secure, and reference-safe.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-[linear-gradient(180deg,_#0f172a_0%,_#111f2f_100%)] p-5 text-white sm:p-8">
              {!paymentRequest ? (
                <form
                  className="space-y-5"
                  onSubmit={(event) => {
                    event.preventDefault();
                    handlePay();
                  }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                        <Receipt className="h-3.5 w-3.5 text-primary" />
                        Checkout
                      </div>
                      <h2 className="mt-4 font-display text-2xl font-bold tracking-tight">Review and pay invoice</h2>
                      <p className="mt-2 text-sm leading-6 text-white/65">
                        Choose a rail, confirm payer details, and Fluent will create a live Busha request.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/8 px-4 py-3 text-right">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Amount Due</p>
                      <p className="mt-1 font-display text-3xl font-bold">
                        {paymentAmount ? formatCurrency(parseFloat(paymentAmount), link.currency) : formatCurrency(link.amount || 0, link.currency)}
                      </p>
                    </div>
                  </div>

                  {!link.amount && (
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-white/80">Invoice Amount ({link.currency})</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-white/45">
                          {link.currency === "USD" ? "$" : link.currency === "NGN" ? "N" : link.currency}
                        </span>
                        <input
                          type="number"
                          value={amount}
                          onChange={(event) => setAmount(event.target.value)}
                          placeholder="0.00"
                          className="input-base border-white/10 bg-white/10 pl-8 text-white placeholder:text-white/30"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-white/80">Payer Name</label>
                      <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="John Doe"
                        className="input-base border-white/10 bg-white/10 text-white placeholder:text-white/30"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-white/80">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@email.com"
                        className="input-base border-white/10 bg-white/10 text-white placeholder:text-white/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/80">Payment Method</label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {PAYMENT_METHOD_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setSelectedPaymentMethod(option.value)}
                          className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                            paymentMethod === option.value
                              ? "border-primary bg-primary/12 shadow-sm"
                              : "border-white/10 bg-white/5 hover:border-primary/40"
                          }`}
                        >
                          <p className="font-medium text-white">{option.label}</p>
                          <p className="mt-1 text-xs text-white/55">{option.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start gap-3">
                      <Globe className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <p className="text-sm leading-6 text-white/70">
                        Busha will generate current payment instructions for this invoice, whether that is a wallet address, QR code, or bank collection details.
                      </p>
                    </div>
                  </div>

                  {paymentRequestMutation.error && (
                    <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                      {paymentRequestMutation.error instanceof Error
                        ? paymentRequestMutation.error.message
                        : "Unable to create payment request."}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={paymentRequestMutation.isPending || !name || !email || !paymentAmount}
                    className="btn-primary w-full justify-center rounded-2xl py-3.5 text-base shadow-lg shadow-primary/20"
                  >
                    {paymentRequestMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/20 border-t-slate-900" />
                        Preparing instructions...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Generate Payment Instructions
                      </span>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-white/45">
                    <Lock className="h-3 w-3" />
                    Secured by Fluent · 256-bit encryption
                  </div>
                </form>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                        <Receipt className="h-3.5 w-3.5 text-primary" />
                        Payment Receipt
                      </div>
                      <h2 className="mt-4 font-display text-2xl font-bold tracking-tight">
                        {paymentRequest.status === "completed" ? "Payment confirmed" : "Payment instructions ready"}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-white/65">
                        {paymentRequest.status === "completed"
                          ? "Busha has confirmed this payment request."
                          : `Send exactly ${paymentRequest.source_amount} ${paymentRequest.source_currency} using the verified details below.`}
                      </p>
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                        paymentRequest.status === "completed"
                          ? "bg-emerald-500/15 text-emerald-200"
                          : "bg-amber-500/15 text-amber-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {paymentRequest.status === "completed" ? <CheckCircle2 className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
                        <span className="capitalize">{paymentRequest.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Amount</p>
                      <p className="mt-2 font-display text-3xl font-bold text-white">
                        {paymentRequest.source_amount} {paymentRequest.source_currency}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Reference</p>
                      <p className="mt-2 break-all font-mono text-sm font-semibold text-white">{paymentRequest.reference}</p>
                    </div>
                  </div>

                  {isCryptoPayment && qrCodeUrl && (
                    <div className="flex justify-center rounded-[1.75rem] border border-white/10 bg-white p-5">
                      <Image
                        src={qrCodeUrl}
                        alt="Payment address QR code"
                        width={220}
                        height={220}
                        unoptimized
                        className="h-full w-full max-w-[220px]"
                      />
                    </div>
                  )}

                  <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Network / Provider</p>
                        <p className="mt-2 text-sm font-semibold text-white">
                          {paymentRequest.pay_in?.network ||
                            paymentRequest.pay_in?.provider ||
                            paymentRequest.target_currency}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">{payInLabel}</p>
                        <div className="mt-2 rounded-2xl bg-slate-950/40 p-3 font-mono text-xs break-all text-white/90">
                          {payInValue || "Busha will provide this detail shortly."}
                        </div>
                      </div>
                    </div>

                    {!isCryptoPayment && (
                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {paymentRequest.pay_in?.bank_name ? (
                          <div className="rounded-2xl bg-white/6 p-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Bank</p>
                            <p className="mt-1 text-sm font-semibold text-white">{paymentRequest.pay_in.bank_name}</p>
                          </div>
                        ) : null}
                        {paymentRequest.pay_in?.account_name ? (
                          <div className="rounded-2xl bg-white/6 p-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Account Name</p>
                            <p className="mt-1 text-sm font-semibold text-white">{paymentRequest.pay_in.account_name}</p>
                          </div>
                        ) : null}
                        {paymentRequest.pay_in?.phone_number ? (
                          <div className="rounded-2xl bg-white/6 p-3 sm:col-span-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Phone Number</p>
                            <p className="mt-1 text-sm font-semibold text-white">{paymentRequest.pay_in.phone_number}</p>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => copyAddress(paymentRequest)}
                    className="btn-secondary w-full justify-center rounded-2xl border-white/15 bg-white/8 py-3 text-white hover:bg-white/12"
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied" : `Copy ${isCryptoPayment ? "Address" : "Account"}`}
                  </button>

                  {paymentRequest.pay_in?.expires_at && (
                    <p className="text-center text-xs text-white/45">
                      Payment instruction expires {formatDate(paymentRequest.pay_in.expires_at)}
                    </p>
                  )}

                  {paymentRequest.timeline?.events?.length ? (
                    <div className="space-y-3">
                      {paymentRequest.timeline.events.map((event) => (
                        <div key={`${event.step}-${event.status}`} className="rounded-2xl border border-white/10 bg-white/6 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-white">{event.title}</p>
                            <span className="text-[10px] uppercase tracking-[0.18em] text-white/45">{event.status}</span>
                          </div>
                          <p className="mt-1 text-sm leading-6 text-white/60">{event.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
