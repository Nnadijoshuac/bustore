"use client";

import { Bell, PanelLeft, TestTube2 } from "lucide-react";
import { useAppStore } from "@/lib/store/app.store";
import { formatCurrency } from "@/lib/utils";
import { DEMO_ACCOUNT } from "@/lib/api/demo-data";

interface TopbarProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function Topbar({ title, description, actions }: TopbarProps) {
  const { isDemoMode, toggleMobileSidebar } = useAppStore();

  return (
    <>
      {isDemoMode ? (
        <div className="demo-banner flex-wrap gap-y-1">
          <TestTube2 className="h-4 w-4" />
          <span>You&apos;re viewing demo data. No real transactions are shown.</span>
          <span className="font-semibold sm:ml-auto">Demo Balance: {formatCurrency(DEMO_ACCOUNT.balance_usd)}</span>
        </div>
      ) : null}

      <div className="sticky top-0 z-30 px-3 pt-3 sm:px-6 sm:pt-4">
        <header className="rounded-2xl border border-border/80 bg-card/95 px-4 py-3 shadow-sm shadow-slate-200/60 backdrop-blur sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <button
                type="button"
                onClick={toggleMobileSidebar}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:bg-secondary md:hidden"
                aria-label="Open navigation"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
              <div className="min-w-0">
                <h1 className="truncate font-display text-lg font-semibold leading-tight text-busha-slate sm:text-xl">
                  {title}
                </h1>
                {description ? (
                  <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">{description}</p>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:flex-shrink-0">
              <div className="min-w-0 flex-1 sm:flex-none">{actions}</div>
              <button
                type="button"
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>
      </div>
    </>
  );
}
