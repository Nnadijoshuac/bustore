"use client";

import Image from "next/image";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { getTransactions } from "@/lib/api/service";
import { Topbar } from "@/components/shared/topbar";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types";

const FILTERS = ["all", "incoming", "outgoing", "settlement"];
const STATUS_FILTERS = ["all", "completed", "pending", "processing", "failed"];

export default function TransactionsPage() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", typeFilter, statusFilter],
    queryFn: () =>
      getTransactions({
        type: typeFilter === "all" ? undefined : typeFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
  });

  const txns = (data?.data ?? []).filter(
    (transaction) =>
      !search ||
      transaction.description.toLowerCase().includes(search.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(search.toLowerCase()) ||
      (transaction.sender_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleView = (txn: Transaction) => {
    setSelectedTxn(txn);
    setPanelOpen(true);
  };

  return (
    <div className="relative min-h-screen">
      <Topbar title="Transactions" description="Full record of all business payments" />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Filters & Search */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Icon icon="solar:magnifer-bold-duotone" className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search records..."
                className="input-base pl-8 bg-card border-none shadow-sm h-9"
              />
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
               <div className="flex items-center gap-1.5 p-1 bg-secondary/50 rounded-xl">
                 {FILTERS.map(f => (
                   <button
                     key={f}
                     onClick={() => setTypeFilter(f)}
                     className={cn(
                       "px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all",
                       typeFilter === f ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                     )}
                   >
                     {f}
                   </button>
                 ))}
               </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 border-b border-border/40">
            <Icon icon="solar:filter-bold-duotone" className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            {STATUS_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={cn(
                  "px-3 py-1 rounded-full text-[9px] font-bold border transition-all whitespace-nowrap uppercase tracking-wider",
                  statusFilter === f ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-border text-muted-foreground hover:border-slate-400"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-card rounded-xl animate-pulse" />)}
          </div>
        ) : txns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-3">
              <Icon icon="solar:bill-list-bold-duotone" className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="font-display font-bold text-base text-slate-800">No records found</h3>
            <p className="text-[10px] text-muted-foreground max-w-xs mx-auto mt-0.5">
              Try adjusting your filters to find specific transactions.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {txns.map((txn) => (
              <div
                key={txn.id}
                onClick={() => handleView(txn)}
                className="group flex items-center gap-3 bg-card hover:bg-slate-50/50 p-3 rounded-xl transition-all cursor-pointer border border-transparent hover:border-border/50 shadow-sm"
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform",
                  txn.type === "incoming" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                )}>
                  <Icon icon={txn.type === "incoming" ? "solar:arrow-down-left-bold-duotone" : "solar:arrow-up-right-bold-duotone"} className="w-5 h-5" />
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-xs truncate text-slate-800">{txn.description}</h4>
                    <StatusBadge status={txn.status} className="text-[8px] px-1 py-0" />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                    {txn.sender_name || "Fluent System"} • {formatDate(txn.created_at)}
                  </p>
                </div>

                <div className="hidden sm:block text-right px-3">
                  <p className={cn(
                    "text-xs font-bold",
                    txn.type === "incoming" ? "text-emerald-600" : "text-slate-800"
                  )}>
                    {txn.type === "incoming" ? "+" : "-"}{formatCurrency(txn.amount, txn.currency)}
                  </p>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">
                    {txn.reference}
                  </p>
                </div>

                <Icon icon="solar:alt-arrow-right-bold-duotone" className="w-4 h-4 text-muted-foreground/30" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Side Panel Drawer */}
      <div 
        className={cn(
          "fixed inset-0 z-50 transition-opacity duration-300",
          panelOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" onClick={() => setPanelOpen(false)} />
        
        <div 
          className={cn(
            "absolute right-0 top-0 h-full w-full max-w-lg bg-card shadow-2xl transition-transform duration-300 ease-out transform border-l border-border/50",
            panelOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo_fluent.png"
                  alt="Fluent logo"
                  width={120}
                  height={80}
                  priority
                  sizes="120px"
                  className="h-9 w-auto object-contain"
                />
                <div>
                  <h2 className="font-display font-bold text-lg text-slate-900">Receipt</h2>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Verified transaction record</p>
                </div>
              </div>
              <button 
                onClick={() => setPanelOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
              >
                <Icon icon="solar:close-circle-bold-duotone" className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
              {selectedTxn && (
                <div className="space-y-6">
                  <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(160deg,_#0f172a_0%,_#122133_100%)] text-white shadow-xl">
                     <div className="border-b border-white/10 px-6 py-5">
                       <div className="flex items-start justify-between gap-4">
                         <div>
                           <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">Receipt Summary</p>
                           <h3 className="mt-2 text-3xl font-bold tracking-tight">
                             {selectedTxn.type === "incoming" ? "+" : "-"}{formatCurrency(selectedTxn.amount, selectedTxn.currency)}
                           </h3>
                           <p className="mt-2 text-sm text-white/65">{selectedTxn.description}</p>
                         </div>
                         <div className={cn(
                           "rounded-2xl px-4 py-3 text-sm font-semibold",
                           selectedTxn.type === "incoming" ? "bg-emerald-500/15 text-emerald-100" : "bg-white/10 text-white"
                         )}>
                           <div className="flex items-center gap-2">
                             <Icon icon={selectedTxn.type === "incoming" ? "solar:arrow-down-left-bold-duotone" : "solar:arrow-up-right-bold-duotone"} className="w-4 h-4" />
                             <span className="capitalize">{selectedTxn.type}</span>
                           </div>
                         </div>
                       </div>
                     </div>
                     <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
                       <div>
                         <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Reference</p>
                         <p className="mt-2 break-all font-mono text-sm font-semibold text-white">{selectedTxn.reference}</p>
                       </div>
                       <div>
                         <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Recorded At</p>
                         <p className="mt-2 text-sm font-semibold text-white">{formatDate(selectedTxn.created_at)}</p>
                       </div>
                       <div>
                         <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Counterparty</p>
                         <p className="mt-2 text-sm font-semibold text-white">{selectedTxn.sender_name || "Fluent System"}</p>
                       </div>
                       <div>
                         <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Status</p>
                         <div className="mt-2">
                           <StatusBadge status={selectedTxn.status} />
                         </div>
                       </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                    <h6 className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Receipt Details</h6>
                    <div className="grid grid-cols-1 gap-3">
                       <div className="flex items-center justify-between p-3.5 rounded-xl bg-card border border-border/50">
                         <div className="flex items-center gap-2.5">
                           <Icon icon="solar:calendar-bold-duotone" className="w-4 h-4 text-primary" />
                           <span className="text-xs font-bold text-muted-foreground">Timestamp</span>
                         </div>
                         <span className="text-xs font-bold text-slate-800">{formatDate(selectedTxn.created_at)}</span>
                       </div>

                       <div className="flex items-center justify-between p-3.5 rounded-xl bg-card border border-border/50">
                         <div className="flex items-center gap-2.5">
                           <Icon icon="solar:hashtag-bold-duotone" className="w-4 h-4 text-primary" />
                           <span className="text-xs font-bold text-muted-foreground">Reference</span>
                         </div>
                         <span className="text-xs font-mono font-bold text-slate-800">{selectedTxn.reference}</span>
                       </div>

                       <div className="flex items-center justify-between p-3.5 rounded-xl bg-card border border-border/50">
                         <div className="flex items-center gap-2.5">
                           <Icon icon="solar:document-text-bold-duotone" className="w-4 h-4 text-primary" />
                           <span className="text-xs font-bold text-muted-foreground">Description</span>
                         </div>
                         <span className="max-w-[55%] text-right text-xs font-bold text-slate-800">{selectedTxn.description}</span>
                       </div>

                       <div className="flex items-center justify-between p-3.5 rounded-xl bg-card border border-border/50">
                         <div className="flex items-center gap-2.5">
                           <Icon icon="solar:user-bold-duotone" className="w-4 h-4 text-primary" />
                           <span className="text-xs font-bold text-muted-foreground">Entity</span>
                         </div>
                         <span className="text-xs font-bold text-slate-800">{selectedTxn.sender_name || "Fluent System"}</span>
                       </div>

                       <div className="flex items-center justify-between p-3.5 rounded-xl bg-card border border-border/50">
                         <div className="flex items-center gap-2.5">
                           <Icon icon="solar:wallet-bold-duotone" className="w-4 h-4 text-primary" />
                           <span className="text-xs font-bold text-muted-foreground">Currency</span>
                         </div>
                         <span className="text-xs font-bold uppercase tracking-wider text-slate-800">{selectedTxn.currency}</span>
                       </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-primary/5 flex items-start gap-2.5 border border-primary/10">
                    <Icon icon="solar:verified-check-bold-duotone" className="w-4 h-4 text-primary mt-0.5" />
                    <p className="text-[10px] text-slate-600 leading-relaxed font-medium">
                      This receipt is a verified transaction record from your Fluent workspace. It is suitable for client confirmation, bookkeeping, and tax reference.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border/40 bg-slate-50/50">
              <div className="flex gap-2.5">
                <button 
                  onClick={() => setPanelOpen(false)}
                  className="flex-1 h-10 px-4 rounded-xl bg-white border border-border font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
                <button className="flex-1 btn-secondary justify-center h-10 border-border">
                  <Icon icon="solar:download-bold-duotone" className="w-4 h-4" />
                  PDF Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
