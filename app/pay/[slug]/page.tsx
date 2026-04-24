"use client";

import Image from "next/image";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import QRCode from "qrcode";
import type { PaymentLink, PaymentRequest } from "@/types";
import { createPaymentRequest, getPaymentRequest } from "@/lib/api/service";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CreditCard, Lock, Globe, Copy, CheckCircle2, Clock3 } from "lucide-react";

const LOCAL_STORAGE_PAYMENT_LINKS_KEY = "bushapay_payment_links";
const PAYMENT_METHOD_OPTIONS = [
  { value: "USDT", label: "USDT", description: "Stablecoin payment" },
  { value: "BTC", label: "BTC", description: "Bitcoin payment" },
  { value: "NGN", label: "NGN", description: "Naira collection" },
  { value: "USD", label: "USD", description: "Dollar collection" },
  { value: "KES", label: "KES", description: "Kenyan shilling collection" },
] as const;

function getStoredPaymentLink(slug: string) {
  if (typeof window === "undefined") {
    return undefined;
  }

  const storedLinks = JSON.parse(
    window.localStorage.getItem(LOCAL_STORAGE_PAYMENT_LINKS_KEY) || "[]"
  ) as PaymentLink[];

  return storedLinks.find((link) => link.slug === slug);
}

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

  const { data: link, error, isLoading } = useQuery({
    queryKey: ["payment-link", slugValue],
    queryFn: async () => {
      const response = await fetch(`/api/payment-links/${slugValue}`, { cache: "no-store" });

      if (!response.ok) {
        const storedLink = slugValue ? getStoredPaymentLink(slugValue) : undefined;

        if (storedLink) {
          return storedLink;
        }

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
  const {
    data: paymentRequest,
  } = useQuery({
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-sm text-muted-foreground">Loading payment link...</p>
        </div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <h1 className="font-display font-bold text-xl mb-2">Payment link unavailable</h1>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 px-3 py-6 sm:p-4">
      <div className="mx-auto flex w-full max-w-lg flex-col justify-center">
        <div className="mb-5 flex items-center justify-center gap-2 sm:mb-6">
          <Image
            src="/logo_fluent.png"
            alt="Fluent logo"
            width={108}
            height={72}
            priority
            sizes="108px"
            className="h-9 w-auto object-contain"
          />
          <span className="font-display text-lg font-bold sm:text-xl">Fluent</span>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-br from-busha-slate to-busha-slate-mid p-5 text-white sm:p-6">
            <p className="text-white/60 text-sm mb-1">Pay to</p>
            <h1 className="mb-0.5 break-words font-display text-2xl font-bold sm:text-3xl">{link.title}</h1>
            {link.description && <p className="break-words text-sm text-white/70">{link.description}</p>}
            {link.amount && (
              <div className="mt-4 inline-flex flex-wrap items-baseline gap-1">
                <span className="text-white/60 text-sm">{link.currency}</span>
                <span className="font-display text-3xl font-bold sm:text-4xl">{link.amount.toLocaleString()}</span>
              </div>
            )}

            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white/75">
              Payment code
              <span className="font-mono text-white">{link.slug}</span>
            </div>
          </div>

          {!paymentRequest ? (
            <form
              className="space-y-4 p-4 sm:p-6"
              onSubmit={(event) => {
                event.preventDefault();
                handlePay();
              }}
            >
              {!link.amount && (
                <div>
                  <label className="text-sm font-medium block mb-1.5">Amount ({link.currency})</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">
                      {link.currency === "USD" ? "$" : link.currency === "NGN" ? "N" : link.currency}
                    </span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      placeholder="0.00"
                      className="input-base pl-8"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium block mb-1.5">Your Name</label>
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="John Doe" className="input-base" />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Email Address</label>
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@email.com" className="input-base" />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">How would you like to pay?</label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {PAYMENT_METHOD_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(option.value)}
                      className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                        paymentMethod === option.value
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      <p className="font-medium text-busha-slate">{option.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{option.description}</p>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Choose the rail that is easiest for you. Fluent will generate the matching Busha payment instructions.
                </p>
              </div>

              <div className="p-3 bg-secondary rounded-xl flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Busha will generate live payment instructions for this invoice, whether that is a wallet address or
                  bank collection details.
                </p>
              </div>

              {paymentRequestMutation.error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {paymentRequestMutation.error instanceof Error
                    ? paymentRequestMutation.error.message
                    : "Unable to create payment request."}
                </div>
              )}

              <button
                type="submit"
                disabled={paymentRequestMutation.isPending || !name || !email || !paymentAmount}
                className="btn-primary w-full justify-center py-3 text-base rounded-xl"
              >
                {paymentRequestMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating request...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Pay {paymentAmount ? formatCurrency(parseFloat(paymentAmount), link.currency) : "Now"}
                  </span>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" />
                Secured by Fluent · 256-bit encryption
              </div>
            </form>
          ) : (
            <div className="space-y-4 p-4 sm:p-6">
              <div
                className={`rounded-2xl border p-4 ${
                  paymentRequest.status === "completed"
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <div
                  className={`flex items-center gap-2 mb-2 ${
                    paymentRequest.status === "completed" ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  {paymentRequest.status === "completed" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Clock3 className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium capitalize">{paymentRequest.status}</span>
                </div>
                <p className="text-sm text-slate-800">
                  {paymentRequest.status === "completed"
                    ? "Payment confirmed by Busha."
                    : `Send exactly ${paymentRequest.source_amount} ${paymentRequest.source_currency} using the instructions below.`}
                </p>
              </div>

              {isCryptoPayment && qrCodeUrl && (
                <div className="flex justify-center rounded-2xl border border-border bg-white p-4">
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

              <div>
                <p className="text-xs text-muted-foreground mb-1">Network</p>
                <p className="font-semibold">
                  {paymentRequest.pay_in?.network ||
                    paymentRequest.pay_in?.provider ||
                    paymentRequest.target_currency}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">{payInLabel}</p>
                <div className="rounded-xl bg-secondary p-3 font-mono text-xs break-all">
                  {payInValue || "Busha will provide this detail shortly."}
                </div>
              </div>

              {!isCryptoPayment && (
                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  {paymentRequest.pay_in?.bank_name ? (
                    <div className="rounded-xl bg-secondary p-3">
                      <p className="text-xs text-muted-foreground mb-1">Bank</p>
                      <p className="font-semibold">{paymentRequest.pay_in.bank_name}</p>
                    </div>
                  ) : null}
                  {paymentRequest.pay_in?.account_name ? (
                    <div className="rounded-xl bg-secondary p-3">
                      <p className="text-xs text-muted-foreground mb-1">Account Name</p>
                      <p className="font-semibold">{paymentRequest.pay_in.account_name}</p>
                    </div>
                  ) : null}
                  {paymentRequest.pay_in?.phone_number ? (
                    <div className="rounded-xl bg-secondary p-3">
                      <p className="text-xs text-muted-foreground mb-1">Phone Number</p>
                      <p className="font-semibold">{paymentRequest.pay_in.phone_number}</p>
                    </div>
                  ) : null}
                </div>
              )}

              <button onClick={() => copyAddress(paymentRequest)} className="btn-secondary w-full justify-center">
                <Copy className="w-4 h-4" />
                {copied ? "Copied" : `Copy ${isCryptoPayment ? "Address" : "Account"}`}
              </button>

              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-xl bg-secondary p-3">
                  <p className="text-xs text-muted-foreground mb-1">Amount</p>
                  <p className="font-semibold">
                    {paymentRequest.source_amount} {paymentRequest.source_currency}
                  </p>
                </div>
                <div className="rounded-xl bg-secondary p-3">
                  <p className="text-xs text-muted-foreground mb-1">Reference</p>
                  <p className="font-semibold break-all">{paymentRequest.reference}</p>
                </div>
              </div>

              {paymentRequest.pay_in?.expires_at && (
                <p className="text-xs text-muted-foreground">
                  Address expires {formatDate(paymentRequest.pay_in.expires_at)}
                </p>
              )}

              {paymentRequest.timeline?.events?.length ? (
                <div className="space-y-2 pt-2">
                  {paymentRequest.timeline.events.map((event) => (
                    <div key={`${event.step}-${event.status}`} className="rounded-xl bg-secondary p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">{event.title}</p>
                        <span className="text-xs uppercase text-muted-foreground">{event.status}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
