"use client";

import Image from "next/image";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { useAppStore } from "@/lib/store/app.store";
import { DEMO_USER } from "@/lib/api/demo-data";

const NAV_ITEMS = [
  { href: "/overview", label: "Overview", icon: "solar:widget-2-bold-duotone" },
  { href: "/transactions", label: "Transactions", icon: "solar:transfer-horizontal-bold-duotone" },
  { href: "/payment-links", label: "Payment Links", icon: "solar:link-bold-duotone" },
  { href: "/recipients", label: "Recipients", icon: "solar:target-bold-duotone" },
  { href: "/customers", label: "Customers", icon: "solar:users-group-rounded-bold-duotone" },
  { href: "/settlements", label: "Settlements", icon: "solar:card-send-bold-duotone" },
  { href: "/webhooks", label: "Webhooks", icon: "solar:webhook-bold-duotone" },
];

const BOTTOM_NAV = [{ href: "/settings", label: "Settings", icon: "solar:settings-bold-duotone" }];

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
          "fixed inset-0 z-30 bg-slate-950/20 backdrop-blur-[2px] transition-opacity md:hidden",
          mobileSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={closeMobileSidebar}
      />

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border/50 bg-card transition-all duration-300 ease-in-out",
          "w-64 md:w-auto",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          sidebarOpen ? "md:w-56" : "md:w-[64px]"
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center px-5",
            showExpanded ? "justify-between" : "justify-center px-0"
          )}
        >
          <div className="flex items-center gap-2.5">
             <div className="w-8 h-8 flex items-center justify-center shrink-0">
                <Image 
                  src="/logo_fluent.png" 
                  alt="Ejima Logo" 
                  width={32} 
                  height={32} 
                  className="w-full h-auto object-contain" 
                />
             </div>
             {showExpanded && (
                <span className="font-display text-base font-bold tracking-tight text-slate-900">Ejima</span>
             )}
          </div>
          
          {mobileSidebarOpen && (
            <button onClick={toggleMobileSidebar} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
              <Icon icon="solar:close-circle-bold-duotone" className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4 custom-scrollbar">
          {NAV_ITEMS.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all",
                  active 
                    ? "bg-primary/10 text-primary shadow-sm shadow-primary/5" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  !showExpanded && "justify-center px-0 h-9 w-9 mx-auto"
                )}
                title={!showExpanded ? label : undefined}
              >
                <Icon icon={icon} className={cn("w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-110", active && "scale-105")} />
                {showExpanded ? <span>{label}</span> : null}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-4 space-y-3">
          <div className="space-y-0.5 border-t border-border/40 pt-4">
            {BOTTOM_NAV.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all",
                  pathname === href 
                    ? "bg-primary/10 text-primary shadow-sm shadow-primary/5" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  !showExpanded && "justify-center px-0 h-9 w-9 mx-auto"
                )}
                title={!showExpanded ? label : undefined}
              >
                <Icon icon={icon} className="w-4.5 h-4.5 shrink-0" />
                {showExpanded ? <span>{label}</span> : null}
              </Link>
            ))}
          </div>

          {showExpanded ? (
            <div className="p-3 rounded-xl bg-secondary/50 flex items-center gap-2.5 border border-border/30">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-[10px] shadow-sm border border-border/40 text-primary">
                {DEMO_USER.full_name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold truncate leading-none mb-0.5 text-slate-800">{DEMO_USER.full_name}</p>
                <p className="text-[9px] text-muted-foreground truncate">{DEMO_USER.email}</p>
              </div>
            </div>
          ) : (
             <div className="w-8 h-8 mx-auto rounded-lg bg-secondary/50 flex items-center justify-center font-bold text-[9px] border border-border/30 text-primary">
                {DEMO_USER.full_name.split(" ").map(n => n[0]).join("")}
             </div>
          )}

          <button
            type="button"
            onClick={toggleSidebar}
            className={cn(
              "hidden w-full items-center gap-2.5 px-2.5 py-1.5 text-[10px] font-bold text-muted-foreground hover:text-foreground md:flex transition-colors",
              !showExpanded && "justify-center"
            )}
          >
            <Icon 
              icon="solar:alt-arrow-left-bold-duotone"
              className={cn("w-4 h-4 transition-transform duration-300", !sidebarOpen && "rotate-180")}
            />
            {showExpanded ? <span>Collapse Sidebar</span> : null}
          </button>
        </div>
      </aside>
    </>
  );
}
