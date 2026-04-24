"use client";

import { Icon } from "@iconify/react";
import { useAppStore } from "@/lib/store/app.store";
import { formatCurrency } from "@/lib/utils";
import { DEMO_ACCOUNT } from "@/lib/api/demo-data";
import { cn } from "@/lib/utils";

interface TopbarProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function Topbar({ title, description, actions }: TopbarProps) {
  const { isDemoMode, toggleMobileSidebar } = useAppStore();

  return (
    <div className="sticky top-0 z-30 w-full">
      {isDemoMode ? (
        <div className="flex items-center gap-2 bg-slate-900 px-6 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-white/40">
          <Icon icon="solar:test-tube-bold-duotone" className="h-3 w-3 text-amber-500" />
          <span>Demo Mode • Simulation</span>
          <span className="ml-auto text-primary opacity-80">System Ready</span>
        </div>
      ) : null}

      <header className="border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur-xl transition-all sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={toggleMobileSidebar}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-all hover:bg-muted hover:text-foreground md:hidden"
            >
              <Icon icon="solar:hamburger-menu-bold-duotone" className="h-5 w-5" />
            </button>
            
            <div className="min-w-0">
              <h1 className="truncate font-display text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                {title}
              </h1>
              {description && (
                <p className="hidden truncate text-[10px] font-bold text-muted-foreground uppercase tracking-wider sm:block opacity-60">
                  {description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden items-center gap-2 sm:flex mr-1">
               {actions}
            </div>
            
            <button
              type="button"
              className="group relative flex h-9 w-9 items-center justify-center rounded-lg bg-secondary transition-all hover:bg-muted"
            >
              <Icon icon="solar:bell-bing-bold-duotone" className="h-4.5 w-4.5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="absolute right-2.5 top-2.5 flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
            </button>

            <div className="sm:hidden">
               {actions}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
