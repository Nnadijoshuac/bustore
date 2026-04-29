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
import { Icon } from "@iconify/react";
import { getAccount, getChartData, getDashboardStats, getTransactions } from "@/lib/api/service";
import { DEMO_ACCOUNT } from "@/lib/api/demo-data";
import { Topbar } from "@/components/shared/topbar";
import { StatusBadge } from "@/components/ui/badge";
import { StatCardSkeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { AIInsightsCard } from "@/components/ai/ai-insights-card";
import { useAppStore } from "@/lib/store/app.store";

export default function OverviewPage() {
  const { hideBalance, toggleHideBalance } = useAppStore();
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

  const { data: account } = useQuery({
    queryKey: ["account"],
    queryFn: getAccount,
  });

  const recentTxns = txnResponse?.data?.slice(0, 5) ?? [];
  const displayedAccount = account ?? DEMO_ACCOUNT;

  return (
    <div className="min-h-screen pb-10">
      <Topbar
        title="Overview"
        description="A high-level summary of your business performance"
        actions={
          <div className="flex items-center gap-2">
            <Link href="/payment-links" className="btn-secondary hidden sm:inline-flex py-1.5 h-8">
              Manage Links
            </Link>
            <Link href="/payment-links" className="btn-primary py-1.5 h-8">
              <Icon icon="solar:add-circle-bold-duotone" className="w-4 h-4" />
              New Link
            </Link>
          </div>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 p-6 text-white shadow-xl">
          <div className="relative z-10 flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3 opacity-60">
                  <Icon icon="solar:wallet-money-bold-duotone" className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Available Balance</span>
                </div>
                <div className="flex items-center gap-4">
                  <h2 className="text-4xl font-display font-bold tracking-tight">
                    {hideBalance ? "********" : formatCurrency(displayedAccount.balance_usd)}
                  </h2>
                  <button onClick={toggleHideBalance} className="rounded-lg bg-white/5 p-2">
                    <Icon
                      icon={hideBalance ? "solar:eye-bold-duotone" : "solar:eye-closed-bold-duotone"}
                      className="w-4 h-4 text-white/60"
                    />
                  </button>
                </div>
                <p className="text-white/40 text-xs font-medium mt-1">
                  approx.{" "}
                  {hideBalance
                    ? "********"
                    : formatCurrency(displayedAccount.balance_local, displayedAccount.local_currency)}{" "}
                  local value
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/settlements"
                  className="flex items-center gap-2 rounded-xl bg-white px-5 py-2 text-xs font-bold text-slate-900 active:scale-95"
                >
                  <Icon icon="solar:card-send-bold-duotone" className="w-4 h-4" />
                  Cash Out
                </Link>
                <Link
                  href="/payment-links"
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-5 py-2 text-xs font-bold text-white"
                >
                  <Icon icon="solar:link-bold-duotone" className="w-4 h-4 text-primary" />
                  Get Paid
                </Link>
              </div>
            </div>
          </div>
        </div>

        <AIInsightsCard />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, index) => <StatCardSkeleton key={index} />)
          ) : (
            <>
              <StatCard
                label="Gross Volume"
                value={formatCurrency(stats?.total_received_usd ?? 0)}
                change={stats?.total_received_change}
                icon="solar:chart-square-bold-duotone"
                positive
              />
              <StatCard
                label="In Transit"
                value={formatCurrency(stats?.pending_settlements_usd ?? 0)}
                icon="solar:clock-circle-bold-duotone"
                sublabel="Cash-outs processing"
              />
              <StatCard
                label="Active Links"
                value={String(stats?.active_payment_links ?? 0)}
                icon="solar:link-round-bold-duotone"
                sublabel="Payment channels"
              />
              <StatCard
                label="Customer Base"
                value={String(stats?.customer_count ?? 0)}
                icon="solar:users-group-rounded-bold-duotone"
                sublabel="Unique payers"
              />
            </>
          )}
        </div>

        <div className="space-y-4">
          <div className="px-1 flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base">Revenue Performance</h3>
              <p className="text-[10px] text-muted-foreground">Volume over the last 30 days</p>
            </div>
          </div>

          <div className="p-5 rounded-[1.5rem] bg-card shadow-sm border border-border/40">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chart ?? []}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C896" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#00C896" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 9, fill: "#8A9BB0", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "#8A9BB0", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "none",
                    borderRadius: 12,
                    fontSize: 11,
                    color: "#fff",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                  itemStyle={{ color: "#00C896" }}
                  formatter={(value: number) => [formatCurrency(value), "Amount"]}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#00C896"
                  strokeWidth={2.5}
                  fill="url(#colorAmt)"
                  dot={false}
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="px-1 flex items-center justify-between">
            <h3 className="font-display font-bold text-base">Recent Activity</h3>
            <Link href="/transactions" className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary">
              View All <Icon icon="solar:arrow-right-bold-duotone" className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-1.5">
            {recentTxns.map((txn) => (
              <Link
                key={txn.id}
                href="/transactions"
                className="flex items-center gap-3 rounded-xl border border-transparent bg-card p-3 shadow-sm"
              >
                <div
                  className={cn(
                    "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg",
                    txn.type === "incoming" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                  )}
                >
                  <Icon
                    icon={txn.type === "incoming" ? "solar:arrow-down-left-bold-duotone" : "solar:arrow-up-right-bold-duotone"}
                    className="w-5 h-5"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-xs font-bold text-slate-800">{txn.description}</p>
                    <StatusBadge status={txn.status} className="text-[8px] px-1 py-0" />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {txn.sender_name || "Settlement"} · {formatDate(txn.created_at, "relative")}
                  </p>
                </div>

                <div className="flex-shrink-0 text-right pr-1">
                  <p className={cn("text-xs font-bold", txn.type === "incoming" ? "text-emerald-600" : "text-foreground")}>
                    {txn.type === "incoming" ? "+" : "-"}
                    {formatCurrency(txn.amount, txn.currency)}
                  </p>
                </div>

                <Icon icon="solar:alt-arrow-right-bold-duotone" className="w-4 h-4 text-muted-foreground/20" />
              </Link>
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
  icon: string;
  positive?: boolean;
  sublabel?: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-border/40 bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
          <Icon icon={icon} className="w-4 h-4" />
        </div>
      </div>
      <p className="text-xl font-bold tracking-tight mb-1">{value}</p>
      {change !== undefined ? (
        <div
          className={cn(
            "flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider",
            positive ? "text-emerald-600" : "text-red-500"
          )}
        >
          <Icon
            icon={positive ? "solar:trending-up-bold-duotone" : "solar:trending-down-bold-duotone"}
            className="h-3 w-3"
          />
          {Math.abs(change)}% vs last month
        </div>
      ) : sublabel ? (
        <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">{sublabel}</p>
      ) : null}
    </div>
  );
}
