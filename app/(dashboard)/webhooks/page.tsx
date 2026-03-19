"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getWebhookDeliveries, getWebhooks } from "@/lib/api/service";
import { Topbar } from "@/components/shared/topbar";
import { formatDate } from "@/lib/utils";
import { Activity, Copy, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/toaster";

const ALL_EVENTS = [
  { key: "payment.received", desc: "Fired when a payment is received" },
  { key: "payment.failed", desc: "Fired when a payment fails" },
  { key: "settlement.initiated", desc: "Fired when settlement starts" },
  { key: "settlement.completed", desc: "Fired when settlement completes" },
  { key: "payment_link.created", desc: "Fired when a link is created" },
  { key: "payment_link.paid", desc: "Fired when a link receives payment" },
];

export default function WebhooksPage() {
  const [showSecret, setShowSecret] = useState(false);
  const { toast } = useToast();
  const { data: webhooks = [] } = useQuery({ queryKey: ["webhooks"], queryFn: getWebhooks });
  const { data: deliveries = [] } = useQuery({ queryKey: ["webhook-deliveries"], queryFn: getWebhookDeliveries });
  const webhook = webhooks[0];

  const copyValue = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    toast({ title: `${label} copied` });
  };

  return (
    <div>
      <Topbar title="Webhooks" description="Use this endpoint in Busha and inspect received deliveries" />
      <div className="p-6 space-y-6">
        <div className="card-glass p-5">
          <h2 className="font-display font-bold text-base mb-4">Available Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {ALL_EVENTS.map((event) => (
              <div key={event.key} className="flex items-start gap-2.5 p-3 bg-secondary rounded-lg">
                <Activity className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-mono font-semibold">{event.key}</p>
                  <p className="text-xs text-muted-foreground">{event.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {webhook && (
          <div className="card-glass p-5 space-y-4">
            <div>
              <h2 className="font-display font-bold text-base">Receiver Endpoint</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Register this URL in your Busha dashboard or webhook settings.
              </p>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-secondary rounded-lg">
              <span className="font-mono text-xs flex-1 truncate">{webhook.url}</span>
              <button onClick={() => copyValue(webhook.url, "Endpoint URL")} className="p-1 hover:bg-card rounded">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-secondary rounded-lg">
              <span className="text-xs text-muted-foreground">Signing secret:</span>
              <span className="font-mono text-xs flex-1 truncate">
                {showSecret ? webhook.secret : "••••••••••••••••"}
              </span>
              <button onClick={() => setShowSecret((current) => !current)} className="p-1 hover:bg-card rounded">
                {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Status: {webhook.is_active ? "signing secret configured" : "signing secret missing in env"}
            </p>
          </div>
        )}

        <div>
          <h2 className="font-display font-bold text-base mb-3">Recent Deliveries</h2>
          {deliveries.length === 0 ? (
            <div className="card-glass p-5 text-sm text-muted-foreground">
              No webhook deliveries recorded yet. Send a test event from Busha after registering the endpoint.
            </div>
          ) : (
            deliveries.map((delivery) => (
              <div key={delivery.id} className="card-glass p-4 mb-3">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-mono text-sm font-semibold">{delivery.event}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(delivery.received_at)}</p>
                  </div>
                </div>
                <pre className="text-xs bg-secondary rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(delivery.payload, null, 2)}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
