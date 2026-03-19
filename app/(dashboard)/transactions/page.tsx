// feature/transactions — compiled
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "@/lib/api/service";
import { Topbar } from "@/components/shared/topbar";
import { StatusBadge } from "@/components/ui/badge";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, Search, Filter } from "lucide-react";

const FILTERS = ["all", "incoming", "outgoing", "settlement"];
const STATUS_FILTERS = ["all", "completed", "pending", "processing", "failed"];

export default function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", typeFilter, statusFilter],
    queryFn: () => getTransactions({
      type: typeFilter === "all" ? undefined : typeFilter,
      status: statusFilter === "all" ? undefined : statusFilter,
    }),
  });

  const txns = (data?.data ?? []).filter((t) =>
    !search || t.description.toLowerCase().includes(search.toLowerCase()) ||
    t.reference.toLowerCase().includes(search.toLowerCase()) ||
    (t.sender_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Topbar title="Transactions" description="All incoming and outgoing payments" />
      <div className="p-6 space-y-4">

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions…"
              className="input-base pl-9"
            />
          </div>
          <div className="flex gap-1 bg-secondary rounded-lg p-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                  typeFilter === f
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-secondary rounded-lg p-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                  statusFilter === f
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card-glass overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">Transaction</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">Reference</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">Status</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs">Amount</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
              ) : txns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    No transactions found
                  </td>
                </tr>
              ) : (
                txns.map((txn) => (
                  <tr key={txn.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          txn.type === "incoming" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                        }`}>
                          {txn.type === "incoming"
                            ? <ArrowDownLeft className="w-3.5 h-3.5" />
                            : <ArrowUpRight className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{txn.description}</p>
                          <p className="text-xs text-muted-foreground">{txn.sender_name ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                        {txn.reference}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(txn.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={txn.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${
                        txn.type === "incoming" ? "text-emerald-600" : "text-foreground"
                      }`}>
                        {txn.type === "incoming" ? "+" : "−"}{formatCurrency(txn.amount, txn.currency)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data?.meta && (
          <p className="text-xs text-muted-foreground text-center">
            Showing {txns.length} of {data.meta.total} transactions
          </p>
        )}
      </div>
    </div>
  );
}
