"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, ArrowDownLeft, Link2, Users,
  ArrowUpRight, Webhook, Settings, ChevronLeft,
  Zap, TestTube2,
} from "lucide-react";
import { useAppStore } from "@/lib/store/app.store";
import { DEMO_USER } from "@/lib/api/demo-data";

const NAV_ITEMS = [
  { href: "/overview",       label: "Overview",       icon: LayoutDashboard },
  { href: "/transactions",   label: "Transactions",   icon: ArrowDownLeft },
  { href: "/payment-links",  label: "Payment Links",  icon: Link2 },
  { href: "/recipients",     label: "Recipients",     icon: Users },
  { href: "/customers",      label: "Customers",      icon: Users },
  { href: "/settlements",    label: "Settlements",    icon: ArrowUpRight },
  { href: "/webhooks",       label: "Webhooks",       icon: Webhook },
];

const BOTTOM_NAV = [
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, isDemoMode } = useAppStore();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen z-40 flex flex-col",
        "bg-card border-r border-border",
        "transition-all duration-300 ease-in-out",
        sidebarOpen ? "w-60" : "w-[68px]"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center h-16 px-4 border-b border-border",
        sidebarOpen ? "gap-3" : "justify-center"
      )}>
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {sidebarOpen && (
          <span className="font-display font-bold text-lg tracking-tight">
            Fluent
          </span>
        )}
      </div>

      {/* Demo badge */}
      {isDemoMode && sidebarOpen && (
        <div className="mx-3 mt-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200">
          <TestTube2 className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-xs font-medium text-amber-700">Demo Mode</span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                active ? "sidebar-link-active" : "sidebar-link",
                !sidebarOpen && "justify-center px-2"
              )}
              title={!sidebarOpen ? label : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-border pt-3 space-y-0.5">
        {BOTTOM_NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              pathname === href ? "sidebar-link-active" : "sidebar-link",
              !sidebarOpen && "justify-center px-2"
            )}
            title={!sidebarOpen ? label : undefined}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span>{label}</span>}
          </Link>
        ))}

        {/* User */}
        {sidebarOpen && (
          <div className="flex items-center gap-2.5 px-3 py-2 mt-1">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
              {DEMO_USER.full_name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{DEMO_USER.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">{DEMO_USER.email}</p>
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "sidebar-link w-full mt-1",
            !sidebarOpen && "justify-center px-2"
          )}
        >
          <ChevronLeft className={cn(
            "w-4 h-4 flex-shrink-0 transition-transform duration-300",
            !sidebarOpen && "rotate-180"
          )} />
          {sidebarOpen && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
