"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { getWebhookDeliveries, getWebhooks } from "@/lib/api/service";
import { Topbar } from "@/components/shared/topbar";
import { EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import type { WebhookDelivery } from "@/types";

const ALL_EVENTS = [
  { key: "payment.received", desc: "Fired when a payment is received" },
  { key: "payment.failed", desc: "Fired when a payment fails" },
  { key: "settlement.initiated", desc: "Fired when settlement starts" },
  { key: "settlement.completed", desc: "Fired when settlement completes" },
  { key: "payment_link.created", desc: "Fired when a link is created" },
  { key: "payment_link.paid", desc: "Fired when a link receives payment" },
];

export default function WebhooksPage() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<WebhookDelivery | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  
  const { toast } = useToast();
  const { data: webhooks = [] } = useQuery({ queryKey: ["webhooks"], queryFn: getWebhooks });
  const { data: deliveries = [] } = useQuery({ queryKey: ["webhook-deliveries"], queryFn: getWebhookDeliveries });
  
  const webhook = webhooks[0];

  const copyValue = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    toast({ title: `${label} copied` });
  };

  const handleView = (delivery: WebhookDelivery) => {
    setSelectedDelivery(delivery);
    setPanelOpen(true);
  };

  return (
    <div className="relative min-h-screen">
      <Topbar title="Webhooks" description="Real-time notifications for payment events" />

      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Receiver Config - Professional Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8 border-b border-border/40">
           <div className="lg:col-span-2 space-y-5">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">Receiver Endpoint</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Integration point for your backend</p>
              </div>

              {webhook && (
                <div className="space-y-3">
                  <div className="group relative flex items-center gap-3 p-4 rounded-xl bg-slate-900 text-white shadow-lg overflow-hidden transition-all hover:bg-slate-950">
                    <div className="absolute top-0 right-0 w-24 h-full bg-primary/10 -skew-x-12 translate-x-12" />
                    <Icon icon="solar:terminal-bold-duotone" className="w-5 h-5 text-primary shrink-0" />
                    <code className="text-[11px] font-mono flex-1 truncate opacity-90">{webhook.url}</code>
                    <button 
                      onClick={() => copyValue(webhook.url, "Endpoint URL")}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Icon icon="solar:copy-bold-duotone" className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-card border border-border/40 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Icon icon="solar:shield-keyhole-bold-duotone" className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1 opacity-60">Signing Secret</p>
                        <p className="text-[11px] font-mono font-bold text-slate-800">{showSecret ? webhook.secret : "••••••••••••••••"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => setShowSecret(!showSecret)}
                        className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground"
                      >
                        <Icon icon={showSecret ? "solar:eye-closed-bold-duotone" : "solar:eye-bold-duotone"} className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => copyValue(webhook.secret, "Secret")}
                        className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground"
                      >
                        <Icon icon="solar:copy-bold-duotone" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
           </div>

           <div className="bg-primary/5 rounded-[1.5rem] p-5 border border-primary/10 flex flex-col justify-between">
              <div>
                <h6 className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] mb-3">Live Status</h6>
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", webhook?.is_active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300")} />
                  <p className="text-[10px] font-bold text-slate-700">{webhook?.is_active ? "ENDPOINT ACTIVE" : "NOT CONFIGURED"}</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium mt-4">
                Verify event signatures using the provided secret to ensure data integrity.
              </p>
           </div>
        </div>

        {/* Events Grid */}
        <div className="space-y-4">
           <h6 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Supported Event Types</h6>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
             {ALL_EVENTS.map((event) => (
                <div key={event.key} className="p-3.5 rounded-xl bg-card border border-border/40 shadow-sm transition-all hover:border-primary/30 group">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Icon icon="solar:bolt-bold-duotone" className="w-4 h-4" />
                    </div>
                    <code className="text-[9px] font-bold font-mono text-slate-700">{event.key}</code>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium">{event.desc}</p>
                </div>
              ))}
           </div>
        </div>

        {/* Deliveries List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
             <h6 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Audit Logs</h6>
             <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">{deliveries.length} entries</p>
          </div>
          
          {deliveries.length === 0 ? (
            <EmptyState
              icon={<Icon icon="solar:activity-bold-duotone" className="w-7 h-7" />}
              title="No activity yet"
              description="Logs will appear here once you trigger a test event."
            />
          ) : (
            <div className="space-y-1.5">
              {deliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  onClick={() => handleView(delivery)}
                  className="group flex items-center gap-3 bg-card hover:bg-slate-50/50 p-3 rounded-xl transition-all cursor-pointer border border-transparent hover:border-border/50 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Icon icon="solar:list-arrow-down-bold-duotone" className="w-5 h-5" />
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs truncate font-mono text-slate-800">{delivery.event}</h4>
                    <p className="text-[9px] text-muted-foreground mt-0.5 font-bold uppercase tracking-wider opacity-60">
                      ID: {delivery.id}
                    </p>
                  </div>

                  <div className="hidden sm:block text-right px-3">
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-lg">
                      200 OK
                    </span>
                    <p className="text-[9px] text-muted-foreground mt-0.5 font-bold uppercase tracking-wider">
                      {formatDate(delivery.received_at)}
                    </p>
                  </div>

                  <Icon icon="solar:alt-arrow-right-bold-duotone" className="w-4 h-4 text-muted-foreground/30" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Side Panel Drawer */}
      <div 
        className={cn(
          "fixed inset-0 z-50 transition-opacity duration-300",
          panelOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" onClick={() => setPanelOpen(false)} />
        
        <div 
          className={cn(
            "absolute right-0 top-0 h-full w-full max-w-xl bg-card shadow-2xl transition-transform duration-300 ease-out transform border-l border-border/50",
            panelOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              <div>
                <h2 className="font-display font-bold text-lg text-slate-900">Delivery Inspector</h2>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Payload breakdown</p>
              </div>
              <button 
                onClick={() => setPanelOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
              >
                <Icon icon="solar:close-circle-bold-duotone" className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
              {selectedDelivery && (
                <div className="space-y-6">
                  <div className="p-5 rounded-[1.5rem] bg-secondary/30 border border-border/40">
                     <div className="flex items-center gap-2.5 mb-4">
                       <Icon icon="solar:code-bold-duotone" className="w-5 h-5 text-primary" />
                       <h3 className="font-mono font-bold text-xs text-slate-800 truncate">{selectedDelivery.event}</h3>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Received At</p>
                          <p className="text-xs font-bold text-slate-800">{formatDate(selectedDelivery.received_at)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">HTTP Status</p>
                          <p className="text-xs font-bold text-emerald-600">200 SUCCESS</p>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <h6 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">JSON Response</h6>
                      <button 
                        onClick={() => copyValue(JSON.stringify(selectedDelivery.payload, null, 2), "Payload")}
                        className="text-[9px] font-bold text-primary hover:underline uppercase tracking-wider"
                      >
                        Copy Payload
                      </button>
                    </div>
                    <div className="relative group">
                       <pre className="p-5 rounded-2xl bg-slate-900 text-primary-foreground/90 font-mono text-[10px] leading-relaxed overflow-x-auto border border-white/5 shadow-inner max-h-[400px]">
                         {JSON.stringify(selectedDelivery.payload, null, 2)}
                       </pre>
                       <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Icon icon="solar:terminal-bold-duotone" className="w-4 h-4 text-white/20" />
                       </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border/40 bg-slate-50/50">
              <button 
                onClick={() => setPanelOpen(false)}
                className="w-full h-10 rounded-xl bg-white border border-border font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
