"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownLeft, ArrowUpRight, Search } from "lucide-react";
import { getTransactions } from "@/lib/api/service";
import { Topbar } from "@/components/shared/topbar";
import { StatusBadge } from "@/components/ui/badge";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";

const FILTERS = ["all", "incoming", "outgoing", "settlement"];
const STATUS_FILTERS = ["all", "completed", "pending", "processing", "failed"];

export default function TransactionsPage() {
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

  return (
    <div>
      <Topbar title="Transactions" description="All incoming and outgoing payments" />

      <div className="space-y-4 p-4 sm:p-6">
        <div className="flex flex-col gap-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search transactions..."
              className="input-base pl-9"
            />
          </div>

          <div className="overflow-x-auto pb-1">
            <div className="flex w-max gap-2 rounded-xl bg-secondary p-1">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTypeFilter(filter)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    typeFilter === filter
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto pb-1">
            <div className="flex w-max gap-2 rounded-xl bg-secondary p-1">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    statusFilter === filter
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="card-glass overflow-hidden">
            <table className="hidden w-full text-sm md:table">
              <tbody>{Array.from({ length: 6 }).map((_, index) => <TableRowSkeleton key={index} cols={5} />)}</tbody>
            </table>
            <div className="space-y-3 p-4 md:hidden">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-2xl bg-secondary p-4">
                  <div className="mb-3 h-4 w-1/2 rounded bg-background/70" />
                  <div className="h-3 w-1/3 rounded bg-background/70" />
                </div>
              ))}
            </div>
          </div>
        ) : txns.length === 0 ? (
          <div className="card-glass p-12 text-center text-sm text-muted-foreground">No transactions found</div>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {txns.map((txn) => (
                <div key={txn.id} className="card-glass p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
                        txn.type === "incoming" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {txn.type === "incoming" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{txn.description}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{txn.sender_name ?? "-"}</p>
                        </div>
                        <StatusBadge status={txn.status} className="text-[10px]" />
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-muted-foreground">Reference</p>
                          <p className="mt-1 break-all font-mono text-[11px]">{txn.reference}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground">Amount</p>
                          <p className={`mt-1 font-semibold ${txn.type === "incoming" ? "text-emerald-600" : "text-foreground"}`}>
                            {txn.type === "incoming" ? "+" : "-"}
                            {formatCurrency(txn.amount, txn.currency)}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">{formatDate(txn.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card-glass hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Transaction</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Reference</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {txns.map((txn) => (
                    <tr key={txn.id} className="border-b border-border transition-colors last:border-0 hover:bg-secondary/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                              txn.type === "incoming" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {txn.type === "incoming" ? (
                              <ArrowDownLeft className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{txn.description}</p>
                            <p className="text-xs text-muted-foreground">{txn.sender_name ?? "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-secondary px-2 py-0.5 font-mono text-xs text-muted-foreground">
                          {txn.reference}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(txn.created_at)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={txn.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-semibold ${txn.type === "incoming" ? "text-emerald-600" : "text-foreground"}`}>
                          {txn.type === "incoming" ? "+" : "-"}
                          {formatCurrency(txn.amount, txn.currency)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {data?.meta ? (
          <p className="text-center text-xs text-muted-foreground">
            Showing {txns.length} of {data.meta.total} transactions
          </p>
        ) : null}
      </div>
    </div>
  );
}
