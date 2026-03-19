"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardStats, getChartData, getTransactions } from "@/lib/api/service";
import { Topbar } from "@/components/shared/topbar";
import { StatCardSkeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, ArrowDownLeft, Link2,
  ArrowUpRight, Clock, Plus,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { DEMO_ACCOUNT } from "@/lib/api/demo-data";

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
        description="Your business at a glance"
        actions={
          <Link href="/payment-links" className="btn-primary">
            <Plus className="w-4 h-4" />
            New Payment Link
          </Link>
        }
      />

      <div className="p-6 space-y-6">
        {/* Balance Hero */}
        <div className="rounded-2xl bg-gradient-to-br from-busha-slate to-busha-slate-mid text-white p-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-20 w-40 h-40 rounded-full bg-primary translate-y-1/2" />
          </div>
          <div className="relative">
            <p className="text-sm text-white/60 font-medium mb-1">Available Balance</p>
            <p className="font-display text-4xl font-bold mb-1">
              {formatCurrency(DEMO_ACCOUNT.balance_usd)}
            </p>
            <p className="text-white/50 text-sm">
              ≈ {formatCurrency(DEMO_ACCOUNT.balance_local, DEMO_ACCOUNT.local_currency)} local
            </p>
            <div className="flex gap-3 mt-6">
              <Link
                href="/settlements"
                className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 rounded-lg text-sm font-medium transition-colors backdrop-blur"
              >
                <ArrowUpRight className="w-4 h-4" />
                Settle Funds
              </Link>
              <Link
                href="/payment-links"
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-busha-green-dark rounded-lg text-sm font-medium transition-colors"
              >
                <Link2 className="w-4 h-4" />
                Get Paid
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                label="Total Received"
                value={formatCurrency(stats?.total_received_usd ?? 0)}
                change={stats?.total_received_change}
                icon={<ArrowDownLeft className="w-4 h-4" />}
                positive
              />
              <StatCard
                label="Pending Settlement"
                value={formatCurrency(stats?.pending_settlements_usd ?? 0)}
                icon={<Clock className="w-4 h-4" />}
                sublabel="In progress"
              />
              <StatCard
                label="Active Links"
                value={String(stats?.active_payment_links ?? 0)}
                icon={<Link2 className="w-4 h-4" />}
                sublabel="Payment links"
              />
              <StatCard
                label="Avg. Transaction"
                value={formatCurrency(stats?.avg_transaction_usd ?? 0)}
                icon={<TrendingUp className="w-4 h-4" />}
                sublabel={`${stats?.transactions_this_month ?? 0} this month`}
              />
            </>
          )}
        </div>

        {/* Chart */}
        <div className="card-glass p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-base">Revenue</h2>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chart ?? []}>
              <defs>
                <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00C896" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00C896" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 88%)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#8A9BB0" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#8A9BB0" }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid hsl(215 20% 88%)", borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [formatCurrency(v), "Amount"]}
              />
              <Area type="monotone" dataKey="amount" stroke="#00C896" strokeWidth={2}
                fill="url(#colorAmt)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Transactions */}
        <div className="card-glass">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-display font-bold text-base">Recent Transactions</h2>
            <Link href="/transactions" className="text-xs text-primary font-medium hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentTxns.map((txn) => (
              <div key={txn.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  txn.type === "incoming"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-slate-100 text-slate-500"
                }`}>
                  {txn.type === "incoming"
                    ? <ArrowDownLeft className="w-4 h-4" />
                    : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{txn.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {txn.sender_name ?? "Settlement"} · {formatDate(txn.created_at, "relative")}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-semibold ${
                    txn.type === "incoming" ? "text-emerald-600" : "text-foreground"
                  }`}>
                    {txn.type === "incoming" ? "+" : "-"}{formatCurrency(txn.amount, txn.currency)}
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
  label, value, change, icon, positive, sublabel,
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
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <p className="font-display font-bold text-2xl">{value}</p>
      {change !== undefined ? (
        <div className={`flex items-center gap-1 text-xs font-medium ${
          positive ? "text-emerald-600" : "text-red-500"
        }`}>
          {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(change)}% vs last month
        </div>
      ) : sublabel ? (
        <p className="text-xs text-muted-foreground">{sublabel}</p>
      ) : null}
    </div>
  );
}
