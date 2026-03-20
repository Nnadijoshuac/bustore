"use client";

import Image from "next/image";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  LayoutDashboard,
  Link2,
  Settings,
  TestTube2,
  Users,
  Webhook,
  X,
} from "lucide-react";
import { useAppStore } from "@/lib/store/app.store";
import { DEMO_USER } from "@/lib/api/demo-data";

const NAV_ITEMS = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowDownLeft },
  { href: "/payment-links", label: "Payment Links", icon: Link2 },
  { href: "/recipients", label: "Recipients", icon: Users },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/settlements", label: "Settlements", icon: ArrowUpRight },
  { href: "/webhooks", label: "Webhooks", icon: Webhook },
];

const BOTTOM_NAV = [{ href: "/settings", label: "Settings", icon: Settings }];

export function Sidebar() {
  const pathname = usePathname();
  const {
    sidebarOpen,
    toggleSidebar,
    isDemoMode,
    mobileSidebarOpen,
    toggleMobileSidebar,
    closeMobileSidebar,
  } = useAppStore();

  const showExpanded = mobileSidebarOpen || sidebarOpen;

  useEffect(() => {
    closeMobileSidebar();
  }, [pathname, closeMobileSidebar]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm transition-opacity md:hidden",
          mobileSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={closeMobileSidebar}
      />

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-card shadow-xl shadow-slate-200/60 transition-all duration-300 ease-in-out",
          "w-72 md:w-auto",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          sidebarOpen ? "md:w-60" : "md:w-[68px]"
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center border-b border-border px-4",
            showExpanded ? "gap-3" : "justify-center"
          )}
        >
          <Image
            src="/logo_fluent.png"
            alt="Fluent logo"
            width={108}
            height={72}
            priority
            sizes="108px"
            className="h-9 w-auto flex-shrink-0 object-contain"
          />
          {showExpanded ? (
            <>
              <div className="min-w-0 flex-1">
                <span className="font-display text-base font-semibold tracking-tight text-busha-slate">Fluent</span>
                <p className="text-xs text-muted-foreground">Busha-powered ops</p>
              </div>
              <button
                type="button"
                onClick={toggleMobileSidebar}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary md:hidden"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : null}
        </div>

        {isDemoMode && showExpanded ? (
          <div className="mx-3 mt-3 flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5">
            <TestTube2 className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-xs font-medium text-amber-700">Demo Mode</span>
          </div>
        ) : null}

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  active ? "sidebar-link-active" : "sidebar-link",
                  !showExpanded && "justify-center px-2"
                )}
                title={!showExpanded ? label : undefined}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {showExpanded ? <span>{label}</span> : null}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-0.5 border-t border-border px-3 pb-4 pt-3">
          {BOTTOM_NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                pathname === href ? "sidebar-link-active" : "sidebar-link",
                !showExpanded && "justify-center px-2"
              )}
              title={!showExpanded ? label : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {showExpanded ? <span>{label}</span> : null}
            </Link>
          ))}

          {showExpanded ? (
            <div className="mt-1 flex items-center gap-2.5 px-3 py-2">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                {DEMO_USER.full_name
                  .split(" ")
                  .map((name) => name[0])
                  .join("")}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{DEMO_USER.full_name}</p>
                <p className="truncate text-xs text-muted-foreground">{DEMO_USER.email}</p>
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={toggleSidebar}
            className={cn("sidebar-link mt-1 hidden w-full md:flex", !showExpanded && "justify-center px-2")}
          >
            <ChevronLeft
              className={cn("h-4 w-4 flex-shrink-0 transition-transform duration-300", !sidebarOpen && "rotate-180")}
            />
            {showExpanded ? <span>Collapse</span> : null}
          </button>
        </div>
      </aside>
    </>
  );
}
