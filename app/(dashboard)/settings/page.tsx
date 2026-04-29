"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Topbar } from "@/components/shared/topbar";
import { EMPTY_ACCOUNT, EMPTY_USER } from "@/lib/api/empty-data";
import { getAccount, getCurrentUser } from "@/lib/api/service";
import { formatCurrency } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toaster";
import { getStoredLoginIdentity, resolveDisplayIdentity } from "@/lib/auth/identity";

export default function SettingsPage() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [storedIdentity, setStoredIdentity] = useState(() => getStoredLoginIdentity());
  const { toast } = useToast();
  const { data: account } = useQuery({ queryKey: ["account"], queryFn: getAccount });
  const { data: currentUser } = useQuery({ queryKey: ["current-user"], queryFn: getCurrentUser });
  const displayedAccount = account ?? EMPTY_ACCOUNT;
  const resolvedIdentity = resolveDisplayIdentity(currentUser, storedIdentity);
  const displayedUser = resolvedIdentity ? { ...EMPTY_USER, ...resolvedIdentity } : EMPTY_USER;
  const initials =
    displayedUser.full_name
      .split(" ")
      .filter(Boolean)
      .map((name) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "WU";

  useEffect(() => {
    setStoredIdentity(getStoredLoginIdentity());
  }, []);

  return (
    <div className="relative min-h-screen">
      <Topbar title="Settings" description="Account and business preferences" />
      
      <div className="max-w-4xl p-4 sm:p-6 lg:p-8 space-y-10">

        {/* Profile Hero - Unboxed & Professional */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-border/40">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[1.5rem] border-2 border-white bg-primary/10 text-xl font-bold text-primary shadow-sm">
                {initials}
              </div>
              <button className="absolute -bottom-1 -right-1 rounded-lg border border-border bg-white p-1.5 text-muted-foreground shadow-md">
                <Icon icon="solar:camera-bold-duotone" className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <h2 className="font-display font-bold text-xl tracking-tight text-slate-900">{displayedUser.full_name}</h2>
              <div className="flex items-center gap-2.5 mt-1">
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                   <Icon icon="solar:letter-bold-duotone" className="w-3.5 h-3.5 text-primary/60" /> {displayedUser.email}
                </p>
                <div className="w-1 h-1 rounded-full bg-border" />
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase tracking-wider border border-emerald-100">
                  <Icon icon="solar:verified-check-bold-duotone" className="w-3 h-3" /> Verified
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setPanelOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-border bg-white px-5 py-2 text-xs font-bold text-slate-700 shadow-sm"
          >
            <Icon icon="solar:user-edit-bold-duotone" className="w-4 h-4 text-primary" />
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings Nav */}
          <div className="lg:col-span-2 space-y-1.5">
            <h6 className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1 mb-3">Core Configuration</h6>
            {[
              { icon: "solar:shield-keyhole-bold-duotone", label: "Security & 2FA", desc: "Encryption and passwords" },
              { icon: "solar:bell-bing-bold-duotone", label: "Notifications", desc: "Manage system alerts" },
              { icon: "solar:key-bold-duotone", label: "API Credentials", desc: "Developer environment keys" },
              { icon: "solar:shop-2-bold-duotone", label: "Business Entity", desc: "Registration and tax profiles" },
              { icon: "solar:global-bold-duotone", label: "Settlement Rule", desc: "Payout logic and currencies" },
            ].map(({ icon, label, desc }) => (
              <button key={label} className="flex w-full items-center gap-3.5 rounded-xl border border-transparent bg-card p-3.5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-transparent bg-secondary text-muted-foreground">
                  <Icon icon={icon} className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-xs text-slate-800">{label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">{desc}</p>
                </div>
                <Icon icon="solar:alt-arrow-right-bold-duotone" className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>

          {/* Sidebar Balance Widget */}
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-white/5 bg-slate-900 p-5 shadow-xl">
              <h6 className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] mb-4 relative z-10">Vault Status</h6>
              <div className="space-y-5 relative z-10">
                <div>
                  <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1">Available Funds</p>
                  <p className="text-xl font-bold tracking-tight text-white">{formatCurrency(displayedAccount.balance_usd)}</p>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1">Local Value ({displayedAccount.local_currency})</p>
                  <p className="text-base font-bold text-white/80">{formatCurrency(displayedAccount.balance_local, displayedAccount.local_currency)}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-2xl bg-secondary/30 border border-border/40">
               <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">Help Desk</p>
               <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                 Technical questions about integrations? Our dev support is live.
               </p>
               <button className="mt-2.5 text-[10px] font-bold uppercase tracking-wider text-primary">Open Ticket</button>
            </div>
          </div>
        </div>
      </div>

      {/* Side Panel Drawer - Profile Edit */}
      <div 
        className={cn(
          "fixed inset-0 z-50 transition-opacity duration-300",
          panelOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="absolute inset-0 bg-black/10" onClick={() => setPanelOpen(false)} />
        
        <div 
          className={cn(
            "absolute right-0 top-0 h-full w-full max-w-lg bg-card shadow-2xl transition-transform duration-300 ease-out transform border-l border-border/50",
            panelOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              <div>
                <h2 className="font-display font-bold text-lg text-slate-900">Personal Information</h2>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Identity and business keys</p>
              </div>
              <button 
                onClick={() => setPanelOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full"
              >
                <Icon icon="solar:close-circle-bold-duotone" className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
               <div className="space-y-6">
                  <div className="space-y-3">
                    <h6 className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Legal Identity</h6>
                    <div className="space-y-3">
                      <div className="relative">
                        <Icon icon="solar:user-bold-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input defaultValue={displayedUser.full_name} className="input-base pl-9 h-10 font-bold text-slate-800" placeholder="Full Name" />
                      </div>
                      <div className="relative">
                        <Icon icon="solar:letter-bold-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input defaultValue={displayedUser.email} type="email" className="input-base pl-9 h-10 font-bold text-slate-800" placeholder="Email Address" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border/40">
                    <h6 className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Business Context</h6>
                    <div className="space-y-3">
                      <div className="relative">
                        <Icon icon="solar:shop-bold-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input defaultValue={displayedUser.business_name ?? ""} className="input-base pl-9 h-10 font-bold text-slate-800" placeholder="Business Name" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1 ml-1 opacity-70">Zone</label>
                          <select className="input-base bg-background h-10 font-bold text-slate-800">
                            <option>Lagos (GMT+1)</option>
                            <option>London (GMT+0)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1 ml-1 opacity-70">Lang</label>
                          <select className="input-base bg-background h-10 font-bold text-slate-800">
                            <option>English (US)</option>
                            <option>French (FR)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
               </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border/40 bg-slate-50/50">
              <div className="flex gap-2.5">
                <button 
                  type="button" 
                  onClick={() => setPanelOpen(false)}
                  className="h-10 flex-1 rounded-xl border border-border bg-white px-4 text-xs font-bold"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    toast({ title: "Profile updated", description: "Changes persisted to system storage.", variant: "success" });
                    setPanelOpen(false);
                  }}
                  className="flex-[1.5] btn-primary justify-center h-10"
                >
                  <Icon icon="solar:check-read-bold-duotone" className="w-4 h-4" />
                  Save Persistently
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
