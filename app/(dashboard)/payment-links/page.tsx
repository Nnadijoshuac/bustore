"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPaymentLinks, createPaymentLink } from "@/lib/api/service";
import { SearchField } from "@/components/shared/search-field";
import { Topbar } from "@/components/shared/topbar";
import { EmptyState } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/toaster";
import { createPaymentLinkSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Icon } from "@iconify/react";
import type { CreatePaymentLinkInput } from "@/lib/validations";
import { Currency, PaymentLink } from "@/types";
import QRCode from "qrcode";
import { AILinkGenerator } from "@/components/ai/ai-link-generator";
import { cn } from "@/lib/utils";

const CURRENCIES: Currency[] = ["USD", "EUR", "GBP", "NGN", "GHS", "KES", "ZAR"];
const TARGET_CURRENCIES = ["USDT", "BTC", "NGN", "USD", "KES"] as const;
const LINK_TEMPLATES = [
  {
    id: "invoice",
    label: "Invoice",
    title: "Client invoice",
    description: "Simple one-time client payment for approved work.",
    allow_customer_amount: false,
  },
  {
    id: "deposit",
    label: "Deposit",
    title: "Project deposit",
    description: "Upfront commitment payment before work begins.",
    allow_customer_amount: false,
  },
  {
    id: "flexible",
    label: "Flexible",
    title: "Custom payment",
    description: "Customer enters the amount due before paying.",
    allow_customer_amount: true,
  },
] as const;

export default function PaymentLinksPage() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<PaymentLink | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const getPublicLinkUrl = (link: PaymentLink) => link.hosted_url || `${window.location.origin}/pay/${link.slug}`;

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

  const allowCustomerAmount = useWatch({ control, name: "allow_customer_amount" });

  const selectedLinkUrl = selectedLink
    ? selectedLink.hosted_url || (origin ? `${origin}/pay/${selectedLink.slug}` : "")
    : "";

  const qrLinkUrl = selectedLinkUrl;
  const checkoutEmbedUrl = selectedLink
    ? `${selectedLinkUrl}${selectedLinkUrl.includes("?") ? "&" : "?"}embed=card`
    : "";
  const qrEmbedUrl = selectedLink
    ? `${selectedLinkUrl}${selectedLinkUrl.includes("?") ? "&" : "?"}embed=qr`
    : "";

  const { data: qrCodeDataUrl = "" } = useQuery({
    queryKey: ["payment-link-qr", qrLinkUrl],
    queryFn: () => QRCode.toDataURL(qrLinkUrl, { margin: 1, width: 140 }),
    enabled: Boolean(qrLinkUrl),
  });

  useEffect(() => {
    if (allowCustomerAmount) {
      setValue("amount", undefined);
    } else {
      setValue("min_amount", undefined);
      setValue("max_amount", undefined);
    }
  }, [allowCustomerAmount, setValue]);

  const handleNew = () => {
    setSelectedLink(null);
    reset({ currency: "USD", target_currency: "USDT", one_time: false, allow_customer_amount: false, title: "", description: "" });
    setPanelOpen(true);
  };

  const handleEdit = (link: PaymentLink) => {
    setSelectedLink(link);
    reset({
      title: link.title,
      description: link.description || "",
      amount: link.amount,
      currency: link.currency,
      target_currency: link.target_currency || "USDT",
      one_time: link.one_time,
      allow_customer_amount: link.allow_customer_amount,
      redirect_url: link.redirect_url || "",
    });
    setPanelOpen(true);
  };

  const mutation = useMutation({
    mutationFn: createPaymentLink,
    onSuccess: (link) => {
      queryClient.invalidateQueries({ queryKey: ["payment-links"] });
      setSelectedLink(link);
      setPanelOpen(true);
      reset({
        title: link.title,
        description: link.description || "",
        amount: link.amount,
        currency: link.currency,
        target_currency: link.target_currency || "USDT",
        one_time: link.one_time,
        allow_customer_amount: link.allow_customer_amount,
        redirect_url: link.redirect_url || "",
      });
      toast({ title: "Link Created", description: "Your payment link is live.", variant: "success" });
    },
    onError: (error) =>
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Please check your inputs.",
        variant: "error",
      }),
  });

  const copyLink = (link: PaymentLink) => {
    const url = getPublicLinkUrl(link);
    navigator.clipboard.writeText(url);
    toast({ title: "Copied", description: "URL saved to clipboard" });
  };

  const copySnippet = async (snippet: string, label: string) => {
    await navigator.clipboard.writeText(snippet);
    toast({ title: `${label} copied`, description: "Embed code saved to clipboard." });
  };

  const openLink = (link: PaymentLink) => {
    const url = getPublicLinkUrl(link);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const applyTemplate = (template: (typeof LINK_TEMPLATES)[number]) => {
    reset({
      title: template.title,
      description: template.description,
      currency: "USD",
      target_currency: "USDT",
      one_time: false,
      allow_customer_amount: template.allow_customer_amount,
      amount: template.allow_customer_amount ? undefined : undefined,
      min_amount: template.allow_customer_amount ? 50 : undefined,
      max_amount: template.allow_customer_amount ? 5000 : undefined,
      redirect_url: "",
    });
  };

  const filteredLinks = links.filter(l => 
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onSubmit = (data: CreatePaymentLinkInput) => {
    mutation.mutate(data);
  };

  const checkoutEmbedSnippet = selectedLink
    ? `<iframe src="${checkoutEmbedUrl}" title="${selectedLink.title}" style="width:100%;max-width:420px;height:320px;border:0;border-radius:24px;overflow:hidden;" loading="lazy"></iframe>`
    : "";
  const qrEmbedSnippet = selectedLink
    ? `<iframe src="${qrEmbedUrl}" title="${selectedLink.title} QR code" style="width:100%;max-width:320px;height:360px;border:0;border-radius:24px;overflow:hidden;" loading="lazy"></iframe>`
    : "";
  const buttonEmbedSnippet = selectedLink
    ? `<a href="${selectedLinkUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;justify-content:center;padding:12px 18px;border-radius:999px;background:#00c896;color:#052e2b;font:600 14px sans-serif;text-decoration:none;">Pay ${selectedLink.title}</a>`
    : "";

  return (
    <div className="relative min-h-screen">
      <Topbar
        title="Payment Links"
        description="Global collection points for your services"
        actions={
          <button onClick={handleNew} className="btn-primary py-1.5 h-8">
            <Icon icon="solar:add-circle-bold-duotone" className="w-4 h-4" />
            New Link
          </button>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <SearchField value={searchQuery} onChange={setSearchQuery} placeholder="Filter links..." />
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-card rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredLinks.length === 0 ? (
          <EmptyState
            icon={<Icon icon="solar:link-broken-bold-duotone" className="w-10 h-10" />}
            title="No links active"
            description="Click 'New Link' to get started."
          />
        ) : (
          <div className="space-y-1.5">
            {filteredLinks.map((link) => (
              <div
                key={link.id}
                onClick={() => handleEdit(link)}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-transparent bg-card p-2.5 shadow-sm"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Icon icon="solar:link-bold-duotone" className="w-4 h-4" />
                </div>
                
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-[11px] truncate text-slate-800">{link.title}</h4>
                  <p className="text-[9px] text-muted-foreground mt-0.5 truncate uppercase tracking-wider font-bold">
                    /{link.slug}
                  </p>
                </div>

                <div className="hidden sm:block text-right px-2">
                  <p className="text-[11px] font-bold text-slate-800">
                    {link.amount ? formatCurrency(link.amount, link.currency) : "Custom"}
                  </p>
                </div>

                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => copyLink(link)} className="rounded-lg p-1.5 text-muted-foreground">
                    <Icon icon="solar:copy-bold-duotone" className="w-3.5 h-3.5" />
                  </button>
                  <Icon icon="solar:alt-arrow-right-bold-duotone" className="w-3.5 h-3.5 text-muted-foreground/20" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Side Panel Drawer - More Modern & Compact */}
      <div 
        className={cn(
          "fixed inset-0 z-50 transition-opacity duration-300",
          panelOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="absolute inset-0 bg-slate-900/10" onClick={() => setPanelOpen(false)} />
        
        <div 
          className={cn(
            "absolute right-0 top-0 h-full w-full max-w-md bg-card shadow-2xl transition-transform duration-300 ease-out transform border-l border-border/40",
            panelOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/40 bg-slate-50/30">
              <div>
                <h2 className="font-display font-bold text-base text-slate-900 leading-none">
                  {selectedLink ? "Payment Detail" : "New Collection Link"}
                </h2>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5 opacity-60">
                  fluent collections
                </p>
              </div>
              <button 
                onClick={() => setPanelOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full"
              >
                <Icon icon="solar:close-circle-bold-duotone" className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {selectedLink && (
                <div className="p-5 rounded-2xl bg-slate-900 text-white flex items-center gap-4 relative overflow-hidden shadow-lg border border-white/5">
                  <div className="absolute top-0 right-0 w-24 h-full bg-primary/10 -skew-x-12 translate-x-12" />
                  <div className="bg-white p-1.5 rounded-xl shadow-sm shrink-0 border border-white/10">
                    {qrCodeDataUrl ? (
                      <Image src={qrCodeDataUrl} alt="QR" width={80} height={80} unoptimized className="h-20 w-20" />
                    ) : (
                      <div className="w-20 h-20 bg-secondary animate-pulse rounded-lg" />
                    )}
                  </div>
                  <div className="min-w-0 z-10">
                    <h5 className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] mb-1">Payer Portal</h5>
                    <p className="text-[10px] text-white/50 leading-normal mb-2 truncate font-mono">
                      {selectedLinkUrl || `/${selectedLink.slug}`}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => copyLink(selectedLink)} type="button" className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase">
                        <Icon icon="solar:copy-bold-duotone" className="w-3.5 h-3.5 text-primary" />
                        Copy Link
                      </button>
                      <button onClick={() => openLink(selectedLink)} type="button" className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[9px] font-bold uppercase text-primary-foreground">
                        <Icon icon="solar:square-top-down-bold-duotone" className="w-3.5 h-3.5" />
                        Open Checkout
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <form 
                onSubmit={handleSubmit(onSubmit)} 
                className="space-y-6 pb-8"
              >
                {!selectedLink && <AILinkGenerator setValue={setValue} />}

                {!selectedLink && (
                  <div className="space-y-3">
                    <h6 className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Quick Start</h6>
                    <div className="grid grid-cols-3 gap-2">
                      {LINK_TEMPLATES.map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => applyTemplate(template)}
                          className="rounded-xl border border-border/60 bg-white px-3 py-3 text-left shadow-sm"
                        >
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-800">{template.label}</p>
                          <p className="mt-1 text-[9px] leading-4 text-muted-foreground">{template.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h6 className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Context</h6>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold block mb-1 text-slate-500 uppercase tracking-wider">Service Title</label>
                      <input {...register("title")} placeholder="e.g. Creative Consulting" className="input-base h-10 font-bold text-slate-800" />
                      {errors.title && <p className="text-[9px] text-red-500 mt-1 font-bold uppercase tracking-tight">{errors.title.message}</p>}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold block mb-1 text-slate-500 uppercase tracking-wider">Description</label>
                      <textarea {...register("description")} rows={2} className="input-base resize-none py-2 font-medium" placeholder="Describe the scope..." />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border/40">
                  <h6 className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Financials</h6>
                  
                  {!allowCustomerAmount ? (
                    <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                      <div>
                        <label className="text-[10px] font-bold block mb-1 text-slate-500 uppercase tracking-wider">Fixed Amt</label>
                        <input {...register("amount", { valueAsNumber: true })} type="number" step="0.01" className="input-base h-10 font-bold" placeholder="0.00" />
                        {errors.amount && <p className="text-[9px] text-red-500 mt-1 font-bold uppercase tracking-tight">{errors.amount.message}</p>}
                      </div>
                      <div>
                        <label className="text-[10px] font-bold block mb-1 text-slate-500 uppercase tracking-wider">Currency</label>
                        <select {...register("currency")} className="input-base h-10 font-bold bg-background">
                          {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold block mb-1 text-slate-500 uppercase tracking-wider">Min Amt</label>
                          <input {...register("min_amount", { valueAsNumber: true })} type="number" step="0.01" className="input-base h-10 font-bold" placeholder="0.00" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold block mb-1 text-slate-500 uppercase tracking-wider">Max Amt</label>
                          <input {...register("max_amount", { valueAsNumber: true })} type="number" step="0.01" className="input-base h-10 font-bold" placeholder="0.00" />
                        </div>
                      </div>
                      {errors.min_amount && <p className="text-[9px] text-red-500 font-bold uppercase tracking-tight">{errors.min_amount.message}</p>}
                      <div>
                        <label className="text-[10px] font-bold block mb-1 text-slate-500 uppercase tracking-wider">Currency</label>
                        <select {...register("currency")} className="input-base h-10 font-bold bg-background">
                          {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                  <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-transparent p-2.5">
                    <input type="checkbox" {...register("allow_customer_amount")} className="w-3.5 h-3.5 rounded accent-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Client chooses amount</span>
                  </label>

                  <div>
                    <label className="text-[10px] font-bold block mb-1 text-slate-500 uppercase tracking-wider">Preferred Pay-In</label>
                    <select {...register("target_currency")} className="input-base h-10 font-bold bg-background">
                      {TARGET_CURRENCIES.map((currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedLink && (
                  <div className="space-y-4 rounded-2xl border border-border/50 bg-slate-50/60 p-4">
                    <div>
                      <h6 className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Website Embed</h6>
                      <p className="mt-1 text-[10px] leading-5 text-slate-500">
                        Drop any of these snippets into your website, landing page, or client portal.
                      </p>
                    </div>

                    <EmbedSnippet
                      title="Embedded Checkout Card"
                      description="Shows the amount, title, and a pay button inside your page."
                      code={checkoutEmbedSnippet}
                      onCopy={() => copySnippet(checkoutEmbedSnippet, "Checkout embed")}
                    />

                    <EmbedSnippet
                      title="Embedded QR Card"
                      description="Displays a QR code that opens the payment page when scanned."
                      code={qrEmbedSnippet}
                      onCopy={() => copySnippet(qrEmbedSnippet, "QR embed")}
                    />

                    <EmbedSnippet
                      title="Pay Button"
                      description="Use a lightweight button if you only want click-to-pay."
                      code={buttonEmbedSnippet}
                      onCopy={() => copySnippet(buttonEmbedSnippet, "Pay button")}
                    />
                  </div>
                )}

                <div className="pt-4 flex gap-2.5">
                  <button type="button" onClick={() => setPanelOpen(false)} className="h-10 flex-1 rounded-xl border border-border bg-white text-[10px] font-bold uppercase tracking-widest shadow-sm">
                    Discard
                  </button>
                  <button 
                    type="submit"
                    disabled={mutation.isPending}
                    className="flex-[1.5] btn-primary justify-center h-10 text-[10px] uppercase tracking-[0.15em] shadow-lg shadow-primary/20"
                  >
                    {mutation.isPending ? "Syncing..." : selectedLink ? "Update Link" : "Activate Link"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmbedSnippet({
  title,
  description,
  code,
  onCopy,
}: {
  title: string;
  description: string;
  code: string;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-800">{title}</p>
          <p className="mt-1 text-[10px] leading-4 text-muted-foreground">{description}</p>
        </div>
        <button type="button" onClick={onCopy} className="rounded-lg bg-secondary px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-700">
          Copy
        </button>
      </div>
      <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-950 p-3 text-[9px] leading-5 text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}
