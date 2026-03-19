"use client";

import { Bell, Search, TestTube2 } from "lucide-react";
import { useAppStore } from "@/lib/store/app.store";
import { formatCurrency } from "@/lib/utils";
import { DEMO_ACCOUNT } from "@/lib/api/demo-data";

interface TopbarProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function Topbar({ title, description, actions }: TopbarProps) {
  const { isDemoMode } = useAppStore();

  return (
    <>
      {isDemoMode && (
        <div className="demo-banner">
          <TestTube2 className="w-4 h-4" />
          <span>
            You&apos;re viewing demo data — no real transactions are shown.
          </span>
          <span className="ml-auto font-semibold">
            Demo Balance: {formatCurrency(DEMO_ACCOUNT.balance_usd)}
          </span>
        </div>
      )}
      <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card sticky top-0 z-30">
        <div>
          <h1 className="font-display font-bold text-lg leading-none">{title}</h1>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </header>
    </>
  );
}
