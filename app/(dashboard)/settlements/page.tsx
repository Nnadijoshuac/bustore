"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { getAccount, getSettlements, getRecipients, createQuote, createSettlement } from "@/lib/api/service";
import { Topbar } from "@/components/shared/topbar";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/toaster";
import { DEMO_ACCOUNT } from "@/lib/api/demo-data";
import { cn } from "@/lib/utils";
import type { Settlement } from "@/types";

const DEMO_RATE = 1547;

export default function SettlementsPage() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [amount, setAmount] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [note, setNote] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settlements = [], isLoading } = useQuery({ queryKey: ["settlements"], queryFn: getSettlements });
  const { data: recipients = [] } = useQuery({ queryKey: ["recipients"], queryFn: getRecipients });
  const { data: account } = useQuery({ queryKey: ["account"], queryFn: getAccount });

  const mutation = useMutation({
    mutationFn: createSettlement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
      queryClient.invalidateQueries({ queryKey: ["settlements"] });
      toast({ title: "Settlement initiated", description: "Busha transfer has been created and is now processing.", variant: "success" });
      setPanelOpen(false);
      setAmount("");
      setRecipientId("");
      setNote("");
    },
    onError: (error) =>
      toast({
        title: "Settlement failed",
        description: error instanceof Error ? error.message : "Unable to create settlement.",
        variant: "error",
      }),
  });

  const amountNum = parseFloat(amount) || 0;
  const fee = amountNum * 0.003;
  const selectedRecipientRecord = recipients.find((recipient) => recipient.id === recipientId);
  const quoteCurrency = selectedRecipientRecord?.currency || "NGN";
  const quoteErrorMessage = "Live Busha quote unavailable. Demo estimate shown below.";
  const displayedAccount = account ?? DEMO_ACCOUNT;

  const {
    data: payoutQuote,
    error: payoutQuoteError,
    isLoading: isLoadingQuote,
  } = useQuery({
    queryKey: ["settlement-quote", recipientId, amountNum],
    queryFn: () =>
      createQuote({
        source_currency: "USD",
        target_currency: quoteCurrency,
        source_amount: amountNum.toFixed(2),
        pay_out: recipientId
          ? {
              type: "bank_transfer",
              recipient_id: recipientId,
            }
          : undefined,
      }),
    enabled: Boolean(recipientId && amountNum > 0 && selectedRecipientRecord),
    retry: false,
  });

  const handleNew = () => {
    setSelectedSettlement(null);
    setPanelOpen(true);
  };

  const handleView = (settlement: Settlement) => {
    setSelectedSettlement(settlement);
    setPanelOpen(true);
  };

  const filteredSettlements = settlements.filter(s => 
    s.recipient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.reference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen">
      <Topbar
        title="Cash Out"
        description="Send available balance to a saved bank or mobile-money recipient"
        actions={
          <button onClick={handleNew} className="btn-primary py-1.5 h-8">
            <Icon icon="solar:card-send-bold-duotone" className="w-4 h-4" />
            New Settlement
          </button>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Balance Status - Premium Hero */}
         <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 p-6 text-white shadow-xl">
           <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div>
               <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] mb-2">Available for Settlement</p>
               <h2 className="text-3xl font-display font-bold tracking-tight">{formatCurrency(displayedAccount.balance_usd)}</h2>
             </div>
             <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Live Exchange Rate</p>
                <p className="text-xs font-bold">1 USD = <span className="text-primary">{(payoutQuote?.rate?.rate ? Number(payoutQuote.rate.rate) : DEMO_RATE).toLocaleString()} {quoteCurrency}</span></p>
             </div>
           </div>
        </div>

        <div>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Icon icon="solar:magnifer-bold-duotone" className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-base pl-8 bg-card border-none shadow-sm h-9"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-card rounded-xl animate-pulse" />)}
            </div>
          ) : filteredSettlements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-3">
                <Icon icon="solar:history-bold-duotone" className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="font-display font-bold text-base text-slate-800">No history found</h3>
              <p className="text-[10px] text-muted-foreground max-w-xs mx-auto mt-0.5">
                Your completed and pending cash-outs will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSettlements.map((settlement) => (
                <div
                  key={settlement.id}
                  onClick={() => handleView(settlement)}
                   className="flex cursor-pointer items-center gap-3 rounded-xl border border-transparent bg-card p-3 shadow-sm"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon icon="solar:bank-bold-duotone" className="w-5 h-5" />
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs truncate text-slate-800">{settlement.recipient?.name || "Settlement"}</h4>
                      <StatusBadge status={settlement.status} className="text-[8px] px-1 py-0" />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-mono font-medium">
                      REF: {settlement.reference}
                    </p>
                  </div>

                  <div className="hidden sm:block text-right px-3">
                    <p className="text-xs font-bold text-slate-800">
                      {formatCurrency(settlement.amount_usd)}
                    </p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">
                      ≈ {formatCurrency(settlement.amount_local, settlement.local_currency)}
                    </p>
                  </div>

                  <Icon icon="solar:alt-arrow-right-bold-duotone" className="w-4 h-4 text-muted-foreground/30" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Side Panel Drawer */}
      <div 
        className={cn(
          "fixed inset-0 z-50 transition-opacity duration-300",
          panelOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="absolute inset-0 bg-black/10" onClick={() => setPanelOpen(false)} />
        
        <div 
          className={cn(
            "absolute right-0 top-0 h-full w-full max-w-lg bg-card shadow-2xl transition-transform duration-300 ease-out transform border-l border-border/50",
            panelOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              <div>
                <h2 className="font-display font-bold text-lg text-slate-900">
                  {selectedSettlement ? "Settlement Details" : "Initiate Settlement"}
                </h2>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                  {selectedSettlement ? `Reference ${selectedSettlement.reference}` : "Withdraw to a saved recipient"}
                </p>
              </div>
              <button 
                onClick={() => setPanelOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full"
              >
                <Icon icon="solar:close-circle-bold-duotone" className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
              
              {selectedSettlement ? (
                <div className="space-y-6">
                  <div className="flex flex-col items-center text-center p-6 rounded-[2rem] bg-secondary/30 border border-border/40">
                     <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm mb-3">
                       <Icon icon="solar:bank-bold-duotone" className="w-7 h-7 text-primary" />
                     </div>
                     <h3 className="text-2xl font-bold tracking-tight text-slate-900">{formatCurrency(selectedSettlement.amount_usd)}</h3>
                     <p className="text-xs text-muted-foreground mt-0.5 font-bold">To {selectedSettlement.recipient?.name}</p>
                     <StatusBadge status={selectedSettlement.status} className="mt-3" />
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    <div className="space-y-3">
                      <h6 className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Breakdown</h6>
                      <div className="space-y-2 p-4 rounded-xl bg-card border border-border/40 shadow-sm">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-muted-foreground">Local Amount</span>
                          <span className="text-slate-800">{formatCurrency(selectedSettlement.amount_local, selectedSettlement.local_currency)}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-muted-foreground">Exchange Rate</span>
                          <span className="text-primary">1 USD = {selectedSettlement.exchange_rate} {selectedSettlement.local_currency}</span>
                        </div>
                        <div className="h-px bg-border/40 my-1" />
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-muted-foreground">Network Fee</span>
                          <span className="text-red-500">-{formatCurrency(selectedSettlement.fee_usd)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h6 className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Meta Data</h6>
                      <div className="grid grid-cols-2 gap-3">
                         <div className="p-3 rounded-xl bg-secondary/50 border border-border/20">
                           <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1 opacity-60">Date</p>
                           <p className="text-xs font-bold text-slate-800">{formatDate(selectedSettlement.created_at)}</p>
                         </div>
                         <div className="p-3 rounded-xl bg-secondary/50 border border-border/20">
                           <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1 opacity-60">Reference</p>
                           <p className="text-[10px] font-mono font-bold truncate text-slate-800">{selectedSettlement.reference}</p>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h6 className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Destination</h6>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold block mb-1 text-slate-700">Recipient Bank Account</label>
                        <select 
                          value={recipientId} 
                          onChange={(e) => setRecipientId(e.target.value)} 
                          className="input-base h-10 bg-background"
                        >
                          <option value="">Choose an account...</option>
                          {recipients.map(r => (
                            <option key={r.id} value={r.id}>{r.name} — {r.bank_name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border/40">
                    <h6 className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Amount to Settle</h6>
                    <div className="space-y-3">
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">$</span>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          className="input-base pl-7 h-12 text-lg font-bold"
                        />
                      </div>
                      
                      {amountNum > 0 && (
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2.5">
                          {recipientId && (
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                              <span className="text-primary/60">Quote Source</span>
                              <span className="text-primary">{payoutQuote ? "Busha Live" : "Demo Estimate"}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                            <span className="text-primary/60">Platform Fee (0.3%)</span>
                            <span className="text-primary">-{formatCurrency(fee)}</span>
                          </div>
                          {payoutQuote?.fees?.length ? (
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                              <span className="text-primary/60">Busha Fees</span>
                              <span className="text-primary">
                                {payoutQuote.fees.map((item) => `${item.amount} ${item.currency || quoteCurrency}`).join(", ")}
                              </span>
                            </div>
                          ) : null}
                          <div className="h-px bg-primary/10" />
                          <div className="flex justify-between items-end">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Net Payout</span>
                            <div className="text-right">
                               <p className="text-base font-bold text-primary">
                                 {payoutQuote
                                   ? `${payoutQuote.target_currency} ${Number(payoutQuote.target_amount || 0).toLocaleString()}`
                                   : `NGN ${((amountNum - fee) * DEMO_RATE).toLocaleString()}`}
                               </p>
                               <p className="text-[9px] text-primary/60 font-bold uppercase tracking-tight">
                                 {payoutQuote?.rate?.rate
                                   ? `1 ${payoutQuote.source_currency} = ${Number(payoutQuote.rate.rate).toLocaleString()} ${payoutQuote.target_currency}`
                                   : "Demo rate applied"}
                               </p>
                            </div>
                          </div>
                          {payoutQuote?.expires_at ? (
                            <p className="text-[9px] font-bold uppercase tracking-tight text-primary/70">
                              Quote expires {formatDate(payoutQuote.expires_at)}
                            </p>
                          ) : null}
                          {isLoadingQuote ? (
                            <p className="text-[9px] font-bold uppercase tracking-tight text-primary/70">Fetching live Busha quote...</p>
                          ) : null}
                          {payoutQuoteError ? (
                            <p className="text-[9px] font-bold uppercase tracking-tight text-amber-700">{quoteErrorMessage}</p>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border/40">
                    <h6 className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Additional Note</h6>
                    <input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="e.g. Project payout"
                      className="input-base h-10"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50/50 flex items-start gap-2.5 border border-blue-100">
                    <Icon icon="solar:info-circle-bold-duotone" className="w-4 h-4 text-blue-500 mt-0.5" />
                    <p className="text-[10px] text-blue-800 leading-normal font-medium">
                      Quote preview is fetched from Busha when available. Confirming this form now creates a live Busha transfer from the quote when your API credentials and payout path are valid.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border/40 bg-slate-50/50">
              <div className="flex gap-2.5">
                <button 
                  type="button" 
                  onClick={() => setPanelOpen(false)}
                  className="h-10 flex-1 rounded-xl border border-border bg-white px-4 text-xs font-bold"
                >
                  {selectedSettlement ? "Close" : "Cancel"}
                </button>
                {!selectedSettlement && (
                  <button 
                    onClick={() => mutation.mutate({ recipient_id: recipientId, amount_usd: amountNum, note })}
                    disabled={mutation.isPending || !recipientId || !amountNum}
                    className="flex-[1.5] btn-primary justify-center h-10"
                  >
                    <Icon icon="solar:check-read-bold-duotone" className="w-4 h-4" />
                    {mutation.isPending ? "Processing..." : "Confirm Settlement"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
