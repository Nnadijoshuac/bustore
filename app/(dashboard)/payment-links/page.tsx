// feature/payment-links — compiled
"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPaymentLinks, createPaymentLink } from "@/lib/api/service";
import { Topbar } from "@/components/shared/topbar";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/toaster";
import { createPaymentLinkSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Plus, Link2, Copy, ExternalLink, X } from "lucide-react";
import type { CreatePaymentLinkInput } from "@/lib/validations";
import { Currency, PaymentLink } from "@/types";

const CURRENCIES: Currency[] = ["USD", "EUR", "GBP", "NGN", "GHS", "KES", "ZAR"];
const LOCAL_STORAGE_PAYMENT_LINKS_KEY = "bushapay_payment_links";

export default function PaymentLinksPage() {
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: links = [], isLoading } = useQuery({
    queryKey: ["payment-links"],
    queryFn: getPaymentLinks,
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreatePaymentLinkInput>({
    resolver: zodResolver(createPaymentLinkSchema),
    defaultValues: { currency: "USD", target_currency: "USDT", one_time: false, allow_customer_amount: false },
  });
  const allowCustomerAmount = useWatch({
    control,
    name: "allow_customer_amount",
  });

  useEffect(() => {
    if (!allowCustomerAmount) {
      return;
    }

    setValue("amount", undefined);
  }, [allowCustomerAmount, setValue]);

  const mutation = useMutation({
    mutationFn: createPaymentLink,
    onSuccess: (newLink) => {
      queryClient.setQueryData<PaymentLink[]>(["payment-links"], (current = []) => [
        newLink,
        ...current.filter((link) => link.id !== newLink.id),
      ]);
      const currentLinks = JSON.parse(
        window.localStorage.getItem(LOCAL_STORAGE_PAYMENT_LINKS_KEY) || "[]"
      ) as PaymentLink[];
      window.localStorage.setItem(
        LOCAL_STORAGE_PAYMENT_LINKS_KEY,
        JSON.stringify([newLink, ...currentLinks.filter((link) => link.id !== newLink.id)])
      );
      toast({ title: "Payment link created!", variant: "success" });
      reset();
      setShowModal(false);
    },
    onError: (error) =>
      toast({
        title: "Failed to create link",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      }),
  });

  const copyLink = (link: PaymentLink) => {
    navigator.clipboard.writeText(`${window.location.origin}/pay/${link.slug}`);
    toast({ title: "Link copied!", description: "Payment link copied to clipboard" });
  };

  return (
    <div>
      <Topbar
        title="Payment Links"
        description="Create shareable links to collect payments"
        actions={
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            New Link
          </button>
        }
      />

      <div className="p-4 sm:p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card-glass p-5 animate-pulse">
                <div className="h-4 bg-secondary rounded w-3/4 mb-3" />
                <div className="h-3 bg-secondary rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {links.map((link) => (
              <div key={link.id} className="card-glass p-5 hover:shadow-md transition-shadow">
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Link2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm break-words">{link.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(link.created_at)}</p>
                    </div>
                  </div>
                  <StatusBadge status={link.status} />
                </div>

                {link.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{link.description}</p>
                )}

                <div className="mb-4 flex flex-wrap items-center gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Collected</p>
                    <p className="font-bold text-sm">{formatCurrency(link.total_collected, link.currency)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Payments</p>
                    <p className="font-bold text-sm">{link.payment_count}</p>
                  </div>
                  {link.amount && (
                    <div>
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="font-bold text-sm">{formatCurrency(link.amount, link.currency)}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-secondary p-2.5">
                  <p className="text-xs text-muted-foreground font-mono flex-1 truncate">
                    /pay/{link.slug}
                  </p>
                  <button
                    onClick={() => copyLink(link)}
                    className="p-1.5 hover:bg-card rounded transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={`/pay/${link.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 hover:bg-card rounded transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-3 pt-6 sm:items-center sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative my-auto w-full max-w-md rounded-2xl bg-card p-4 shadow-xl animate-slide-in sm:p-6 max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-xl">Create Payment Link</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-secondary rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Title *</label>
                <input {...register("title")} placeholder="e.g. Logo Design Package" className="input-base" />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Description</label>
                <textarea {...register("description")} placeholder="What are you getting paid for?" rows={2} className="input-base resize-none" />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Amount (optional)</label>
                  <input
                    {...register("amount")}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    disabled={allowCustomerAmount}
                    className="input-base disabled:bg-secondary disabled:text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Leave blank to let payer choose</p>
                  {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Currency</label>
                  <select {...register("currency")} className="input-base bg-background">
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Target Currency</label>
                  <input {...register("target_currency")} className="input-base" />
                </div>
                <label className="flex items-center gap-2 text-sm sm:pt-7">
                  <input type="checkbox" {...register("one_time")} className="accent-primary" />
                  <span>One-time link</span>
                </label>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register("allow_customer_amount")} className="accent-primary" />
                <span>Allow customer-defined amount</span>
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Min Amount</label>
                  <input {...register("min_amount")} type="number" step="0.01" placeholder="0.00" className="input-base" />
                  {errors.min_amount && <p className="text-xs text-red-500 mt-1">{errors.min_amount.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Max Amount</label>
                  <input {...register("max_amount")} type="number" step="0.01" placeholder="0.00" className="input-base" />
                  {errors.max_amount && <p className="text-xs text-red-500 mt-1">{errors.max_amount.message}</p>}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Redirect URL (optional)</label>
                <input {...register("redirect_url")} type="url" placeholder="https://yourdomain.com/thank-you" className="input-base" />
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1 justify-center">
                  {mutation.isPending ? "Creating…" : "Create Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
