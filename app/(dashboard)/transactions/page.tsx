"use client";

import Image from "next/image";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { getTransactions } from "@/lib/api/service";
import { Topbar } from "@/components/shared/topbar";
import { SearchField } from "@/components/shared/search-field";
import { SlideOver } from "@/components/shared/slide-over";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types";

const FILTERS = ["all", "incoming", "outgoing", "settlement"];
const STATUS_FILTERS = ["all", "completed", "pending", "processing", "failed"];

function SectionFilters({
  typeFilter,
  statusFilter,
  search,
  onTypeChange,
  onStatusChange,
  onSearchChange,
}: {
  typeFilter: string;
  statusFilter: string;
  search: string;
  onTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-sm">
          <SearchField value={search} onChange={onSearchChange} placeholder="Search records..." />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 rounded-xl bg-secondary/50 p-1">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => onTypeChange(filter)}
                className={cn(
                  "rounded-lg px-3 py-1 text-[9px] font-bold uppercase tracking-wider transition-all",
                  typeFilter === filter ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto border-b border-border/40 pb-2">
        <Icon icon="solar:filter-bold-duotone" className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => onStatusChange(filter)}
            className={cn(
              "whitespace-nowrap rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-wider transition-all",
              statusFilter === filter
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-border bg-white text-muted-foreground hover:border-slate-400"
            )}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}

function TransactionListItem({
  txn,
  onOpen,
}: {
  txn: Transaction;
  onOpen: (txn: Transaction) => void;
}) {
  const isIncoming = txn.type === "incoming";

  return (
    <div
      onClick={() => onOpen(txn)}
      className="group flex cursor-pointer items-center gap-3 rounded-xl border border-transparent bg-card p-3 shadow-sm transition-all hover:border-border/50 hover:bg-slate-50/50"
    >
      <div
        className={cn(
          "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105",
          isIncoming ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
        )}
      >
        <Icon icon={isIncoming ? "solar:arrow-down-left-bold-duotone" : "solar:arrow-up-right-bold-duotone"} className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h4 className="truncate text-xs font-bold text-slate-800">{txn.description}</h4>
          <StatusBadge status={txn.status} className="px-1 py-0 text-[8px]" />
        </div>
        <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
          {txn.sender_name || "Fluent System"} • {formatDate(txn.created_at)}
        </p>
      </div>

      <div className="hidden px-3 text-right sm:block">
        <p className={cn("text-xs font-bold", isIncoming ? "text-emerald-600" : "text-slate-800")}>
          {isIncoming ? "+" : "-"}
          {formatCurrency(txn.amount, txn.currency)}
        </p>
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{txn.reference}</p>
      </div>

      <Icon icon="solar:alt-arrow-right-bold-duotone" className="h-4 w-4 text-muted-foreground/30" />
    </div>
  );
}

function ReceiptDetailRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-3.5">
      <div className="flex items-center gap-2.5">
        <Icon icon={icon} className="h-4 w-4 text-primary" />
        <span className="text-xs font-bold text-muted-foreground">{label}</span>
      </div>
      <span className="max-w-[55%] text-right text-xs font-bold text-slate-800">{value}</span>
    </div>
  );
}

function ReceiptSummary({ txn }: { txn: Transaction }) {
  const isIncoming = txn.type === "incoming";

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(160deg,_#0f172a_0%,_#122133_100%)] text-white shadow-xl">
      <div className="border-b border-white/10 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">Receipt Summary</p>
            <h3 className="mt-2 text-3xl font-bold tracking-tight">
              {isIncoming ? "+" : "-"}
              {formatCurrency(txn.amount, txn.currency)}
            </h3>
            <p className="mt-2 text-sm text-white/65">{txn.description}</p>
          </div>

          <div
            className={cn(
              "rounded-2xl px-4 py-3 text-sm font-semibold",
              isIncoming ? "bg-emerald-500/15 text-emerald-100" : "bg-white/10 text-white"
            )}
          >
            <div className="flex items-center gap-2">
              <Icon icon={isIncoming ? "solar:arrow-down-left-bold-duotone" : "solar:arrow-up-right-bold-duotone"} className="h-4 w-4" />
              <span className="capitalize">{txn.type}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Reference</p>
          <p className="mt-2 break-all font-mono text-sm font-semibold text-white">{txn.reference}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Recorded At</p>
          <p className="mt-2 text-sm font-semibold text-white">{formatDate(txn.created_at)}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Counterparty</p>
          <p className="mt-2 text-sm font-semibold text-white">{txn.sender_name || "Fluent System"}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Status</p>
          <div className="mt-2">
            <StatusBadge status={txn.status} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReceiptDrawer({
  transaction,
  open,
  onClose,
}: {
  transaction: Transaction | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title="Receipt"
      subtitle="Verified transaction record"
      headerContent={
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
            <h2 className="font-display text-lg font-bold text-slate-900">Receipt</h2>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Verified transaction record</p>
          </div>
        </div>
      }
      footer={
        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="h-10 flex-1 rounded-xl border border-border bg-white px-4 text-xs font-bold transition-colors hover:bg-slate-50"
          >
            Close
          </button>
          <button className="btn-secondary h-10 flex-1 justify-center border-border">
            <Icon icon="solar:download-bold-duotone" className="h-4 w-4" />
            PDF Receipt
          </button>
        </div>
      }
    >
      {transaction ? (
        <div className="space-y-6">
          <ReceiptSummary txn={transaction} />

          <div className="space-y-4">
            <h6 className="px-1 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Receipt Details</h6>
            <div className="grid grid-cols-1 gap-3">
              <ReceiptDetailRow icon="solar:calendar-bold-duotone" label="Timestamp" value={formatDate(transaction.created_at)} />
              <ReceiptDetailRow icon="solar:hashtag-bold-duotone" label="Reference" value={<span className="font-mono">{transaction.reference}</span>} />
              <ReceiptDetailRow icon="solar:document-text-bold-duotone" label="Description" value={transaction.description} />
              <ReceiptDetailRow icon="solar:user-bold-duotone" label="Entity" value={transaction.sender_name || "Fluent System"} />
              <ReceiptDetailRow icon="solar:wallet-bold-duotone" label="Currency" value={<span className="uppercase tracking-wider">{transaction.currency}</span>} />
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-primary/10 bg-primary/5 p-3.5">
            <Icon icon="solar:verified-check-bold-duotone" className="mt-0.5 h-4 w-4 text-primary" />
            <p className="text-[10px] font-medium leading-relaxed text-slate-600">
              This receipt is a verified transaction record from your Fluent workspace. It is suitable for client confirmation, bookkeeping, and tax reference.
            </p>
          </div>
        </div>
      ) : null}
    </SlideOver>
  );
}

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

  const transactions = (data?.data ?? []).filter((transaction) => {
    if (!search) {
      return true;
    }

    const searchValue = search.toLowerCase();
    return (
      transaction.description.toLowerCase().includes(searchValue) ||
      transaction.reference.toLowerCase().includes(searchValue) ||
      (transaction.sender_name ?? "").toLowerCase().includes(searchValue)
    );
  });

  const openReceipt = (transaction: Transaction) => {
    setSelectedTxn(transaction);
    setPanelOpen(true);
  };

  return (
    <div className="relative min-h-screen">
      <Topbar title="Transactions" description="Full record of all business payments" />

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <SectionFilters
          typeFilter={typeFilter}
          statusFilter={statusFilter}
          search={search}
          onTypeChange={setTypeFilter}
          onStatusChange={setStatusFilter}
          onSearchChange={setSearch}
        />

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-16 animate-pulse rounded-xl bg-card" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={<Icon icon="solar:bill-list-bold-duotone" className="h-7 w-7" />}
            title="No records found"
            description="Try adjusting your filters to find specific transactions."
          />
        ) : (
          <div className="space-y-1.5">
            {transactions.map((txn) => (
              <TransactionListItem key={txn.id} txn={txn} onOpen={openReceipt} />
            ))}
          </div>
        )}
      </div>

      <ReceiptDrawer transaction={selectedTxn} open={panelOpen} onClose={() => setPanelOpen(false)} />
    </div>
  );
}
