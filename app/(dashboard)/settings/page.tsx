"use client";

import { Topbar } from "@/components/shared/topbar";
import { DEMO_USER, DEMO_ACCOUNT } from "@/lib/api/demo-data";
import { formatCurrency } from "@/lib/utils";
import { Shield, Bell, Key, Building2, Globe, ChevronRight } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      <Topbar title="Settings" description="Manage your account and preferences" />
      <div className="p-6 max-w-2xl space-y-5">

        {/* Profile */}
        <div className="card-glass p-5">
          <h2 className="font-display font-bold text-base mb-4">Profile</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary font-bold text-xl flex items-center justify-center">
              {DEMO_USER.full_name.split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <p className="font-semibold">{DEMO_USER.full_name}</p>
              <p className="text-sm text-muted-foreground">{DEMO_USER.business_name}</p>
              <span className="badge-green mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                KYC Verified
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground font-medium block mb-1">Full Name</label>
              <input defaultValue={DEMO_USER.full_name} className="input-base" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium block mb-1">Business Name</label>
              <input defaultValue={DEMO_USER.business_name ?? ""} className="input-base" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground font-medium block mb-1">Email</label>
              <input defaultValue={DEMO_USER.email} type="email" className="input-base" />
            </div>
          </div>
          <button className="btn-primary mt-4">Save Changes</button>
        </div>

        {/* Balance info */}
        <div className="card-glass p-5">
          <h2 className="font-display font-bold text-base mb-3">Account Balance</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-secondary rounded-xl">
              <p className="text-xs text-muted-foreground">USD Balance</p>
              <p className="font-bold text-lg">{formatCurrency(DEMO_ACCOUNT.balance_usd)}</p>
            </div>
            <div className="p-3 bg-secondary rounded-xl">
              <p className="text-xs text-muted-foreground">Local Equivalent</p>
              <p className="font-bold text-lg">{formatCurrency(DEMO_ACCOUNT.balance_local, DEMO_ACCOUNT.local_currency)}</p>
            </div>
          </div>
        </div>

        {/* Settings nav */}
        {[
          { icon: Shield, label: "Security & 2FA", desc: "Manage password and two-factor authentication" },
          { icon: Bell, label: "Notifications", desc: "Email and in-app notification preferences" },
          { icon: Key, label: "API Keys", desc: "Manage your API keys for direct integration" },
          { icon: Building2, label: "Business Details", desc: "Update business registration and tax info" },
          { icon: Globe, label: "Settlement Preferences", desc: "Default currency and settlement schedule" },
        ].map(({ icon: Icon, label, desc }) => (
          <button key={label} className="card-glass p-4 flex items-center gap-3 w-full hover:shadow-md transition-shadow text-left">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground flex-shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}
