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
      {isDemoMode && (
        <div className="demo-banner flex-wrap gap-y-1">
          <TestTube2 className="h-4 w-4" />
          <span>You&apos;re viewing demo data - no real transactions are shown.</span>
          <span className="font-semibold sm:ml-auto">
            Demo Balance: {formatCurrency(DEMO_ACCOUNT.balance_usd)}
          </span>
        </div>
      )}
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 px-4 backdrop-blur sm:px-6">
        <div className="flex min-h-16 flex-col justify-center gap-3 py-3 sm:min-h-16 sm:flex-row sm:items-center sm:justify-between sm:py-0">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={toggleMobileSidebar}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:bg-secondary md:hidden"
              aria-label="Open navigation"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="font-display text-lg font-bold leading-none">{title}</h1>
              {description ? (
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{description}</p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <div className="flex-1 sm:flex-none">{actions}</div>
            <button
              type="button"
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-transparent text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
