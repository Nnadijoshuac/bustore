"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Link2,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { getChartData, getDashboardStats, getTransactions } from "@/lib/api/service";
import { DEMO_ACCOUNT } from "@/lib/api/demo-data";
import { Topbar } from "@/components/shared/topbar";
import { StatusBadge } from "@/components/ui/badge";
import { StatCardSkeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function OverviewPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

  const { data: chart } = useQuery({
    queryKey: ["chart-data"],
    queryFn: getChartData,
  });

  const { data: txnResponse } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => getTransactions(),
  });

  const recentTxns = txnResponse?.data?.slice(0, 5) ?? [];

  return (
    <div>
      <Topbar
        title="Overview"
        description="Your payment operation at a glance"
        actions={
          <Link href="/payment-links" className="btn-primary w-full justify-center sm:w-auto">
            <Plus className="h-4 w-4" />
            New Payment Link
          </Link>
        }
      />

      <div className="space-y-6 p-4 sm:p-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-busha-slate to-busha-slate-mid p-5 text-white sm:p-6">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
            <div className="absolute bottom-0 left-20 h-40 w-40 translate-y-1/2 rounded-full bg-primary" />
          </div>

          <div className="relative">
            <p className="mb-1 text-sm font-medium text-white/60">Available Balance</p>
            <p className="mb-1 font-display text-3xl font-bold sm:text-4xl">
              {formatCurrency(DEMO_ACCOUNT.balance_usd)}
            </p>
            <p className="text-sm text-white/50">
              Approx. {formatCurrency(DEMO_ACCOUNT.balance_local, DEMO_ACCOUNT.local_currency)} local
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/settlements"
                className="flex items-center justify-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur transition-colors hover:bg-white/25"
              >
                <ArrowUpRight className="h-4 w-4" />
                Settle Funds
              </Link>
              <Link
                href="/payment-links"
                className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium transition-colors hover:bg-busha-green-dark"
              >
                <Link2 className="h-4 w-4" />
                Get Paid
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, index) => <StatCardSkeleton key={index} />)
          ) : (
            <>
              <StatCard
                label="Total Received"
                value={formatCurrency(stats?.total_received_usd ?? 0)}
                change={stats?.total_received_change}
                icon={<ArrowDownLeft className="h-4 w-4" />}
                positive
              />
              <StatCard
                label="Pending Settlement"
                value={formatCurrency(stats?.pending_settlements_usd ?? 0)}
                icon={<Clock className="h-4 w-4" />}
                sublabel="In progress"
              />
              <StatCard
                label="Active Links"
                value={String(stats?.active_payment_links ?? 0)}
                icon={<Link2 className="h-4 w-4" />}
                sublabel="Payment links"
              />
              <StatCard
                label="Avg. Transaction"
                value={formatCurrency(stats?.avg_transaction_usd ?? 0)}
                icon={<TrendingUp className="h-4 w-4" />}
                sublabel={`${stats?.transactions_this_month ?? 0} this month`}
              />
            </>
          )}
        </div>

        <div className="card-glass p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold">Revenue</h2>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chart ?? []}>
              <defs>
                <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00C896" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00C896" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 88%)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#8A9BB0" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: "#8A9BB0" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid hsl(215 20% 88%)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: number) => [formatCurrency(value), "Amount"]}
              />
              <Area type="monotone" dataKey="amount" stroke="#00C896" strokeWidth={2} fill="url(#colorAmt)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card-glass">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h2 className="font-display text-base font-bold">Recent Transactions</h2>
            <Link href="/transactions" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </div>

          <div className="divide-y divide-border">
            {recentTxns.map((txn) => (
              <div key={txn.id} className="flex items-center gap-4 px-4 py-3.5 sm:px-5">
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${
                    txn.type === "incoming" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {txn.type === "incoming" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{txn.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {txn.sender_name ?? "Settlement"} · {formatDate(txn.created_at, "relative")}
                  </p>
                </div>

                <div className="flex-shrink-0 text-right">
                  <p className={`text-sm font-semibold ${txn.type === "incoming" ? "text-emerald-600" : "text-foreground"}`}>
                    {txn.type === "incoming" ? "+" : "-"}
                    {formatCurrency(txn.amount, txn.currency)}
                  </p>
                  <StatusBadge status={txn.status} className="text-[10px]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  change,
  icon,
  positive,
  sublabel,
}: {
  label: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  positive?: boolean;
  sublabel?: string;
}) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <p className="font-display text-2xl font-bold">{value}</p>
      {change !== undefined ? (
        <div className={`flex items-center gap-1 text-xs font-medium ${positive ? "text-emerald-600" : "text-red-500"}`}>
          {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(change)}% vs last month
        </div>
      ) : sublabel ? (
        <p className="text-xs text-muted-foreground">{sublabel}</p>
      ) : null}
    </div>
  );
}
