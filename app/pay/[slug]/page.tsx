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

  const paymentRequestMutation = useMutation({
    mutationFn: () =>
      createPaymentRequest({
        payment_link_id: link!.id,
        payment_link_slug: link!.slug,
        amount: paymentAmount,
        quote_currency: link!.currency,
        target_currency: link!.target_currency || "USDT",
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
    if (!request.pay_in?.address) {
      return;
    }

    await navigator.clipboard.writeText(request.pay_in.address);
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

              <div className="p-3 bg-secondary rounded-xl flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Busha will generate a payment request and show the deposit address for this invoice.
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
                    : `Send exactly ${paymentRequest.source_amount} ${paymentRequest.source_currency} to the address below.`}
                </p>
              </div>

              {qrCodeUrl && (
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
                <p className="font-semibold">{paymentRequest.pay_in?.network || paymentRequest.target_currency}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Deposit Address</p>
                <div className="rounded-xl bg-secondary p-3 font-mono text-xs break-all">
                  {paymentRequest.pay_in?.address}
                </div>
              </div>

              <button onClick={() => copyAddress(paymentRequest)} className="btn-secondary w-full justify-center">
                <Copy className="w-4 h-4" />
                {copied ? "Copied" : "Copy Address"}
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
