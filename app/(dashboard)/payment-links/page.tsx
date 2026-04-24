"use client";

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

export default function PaymentLinksPage() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<PaymentLink | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const getPublicLinkUrl = (link: PaymentLink) => `${window.location.origin}/pay/${link.slug}`;

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
    defaultValues: { currency: "USD", one_time: false, allow_customer_amount: false },
  });

  const allowCustomerAmount = useWatch({ control, name: "allow_customer_amount" });

  const selectedLinkUrl = selectedLink ? (origin ? `${origin}/pay/${selectedLink.slug}` : "") : "";

  const qrLinkUrl = selectedLinkUrl;

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
    reset({ currency: "USD", one_time: false, allow_customer_amount: false, title: "", description: "" });
    setPanelOpen(true);
  };

  const handleEdit = (link: PaymentLink) => {
    setSelectedLink(link);
    reset({
      title: link.title,
      description: link.description || "",
      amount: link.amount,
      currency: link.currency,
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

  const openLink = (link: PaymentLink) => {
    const url = getPublicLinkUrl(link);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const filteredLinks = links.filter(l => 
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onSubmit = (data: CreatePaymentLinkInput) => {
    mutation.mutate(data);
  };

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
                className="group flex items-center gap-3 bg-card hover:bg-slate-50 p-2.5 rounded-xl transition-all cursor-pointer border border-transparent hover:border-border/40 shadow-sm"
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
                  <button onClick={() => copyLink(link)} className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground transition-colors">
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
        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px]" onClick={() => setPanelOpen(false)} />
        
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
                  powered by ejima
                </p>
              </div>
              <button 
                onClick={() => setPanelOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
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
                      <img src={qrCodeDataUrl} alt="QR" className="w-20 h-20" />
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
                      <button onClick={() => copyLink(selectedLink)} type="button" className="text-[9px] font-bold py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all flex items-center gap-1.5 uppercase border border-white/5">
                        <Icon icon="solar:copy-bold-duotone" className="w-3.5 h-3.5 text-primary" />
                        Copy Link
                      </button>
                      <button onClick={() => openLink(selectedLink)} type="button" className="text-[9px] font-bold py-1.5 px-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-1.5 uppercase">
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

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-secondary/50 transition-all cursor-pointer group border border-transparent hover:border-border/40">
                    <input type="checkbox" {...register("allow_customer_amount")} className="w-3.5 h-3.5 rounded accent-primary" />
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider group-hover:text-slate-900 transition-colors">Client chooses amount</span>
                  </label>
                </div>

                <div className="pt-4 flex gap-2.5">
                  <button type="button" onClick={() => setPanelOpen(false)} className="flex-1 h-10 rounded-xl bg-white border border-border font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-sm">
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
