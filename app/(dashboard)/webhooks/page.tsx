"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, Copy, Eye, EyeOff } from "lucide-react";
import { getWebhookDeliveries, getWebhooks } from "@/lib/api/service";
import { Topbar } from "@/components/shared/topbar";
import { formatDate } from "@/lib/utils";
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

      <div className="space-y-6 p-4 sm:p-6">
        <div className="card-glass p-5">
          <h2 className="mb-4 font-display text-base font-bold">Available Events</h2>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {ALL_EVENTS.map((event) => (
              <div key={event.key} className="flex items-start gap-2.5 rounded-lg bg-secondary p-3">
                <Activity className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
                <div>
                  <p className="font-mono text-xs font-semibold">{event.key}</p>
                  <p className="text-xs text-muted-foreground">{event.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {webhook ? (
          <div className="card-glass space-y-4 p-5">
            <div>
              <h2 className="font-display text-base font-bold">Receiver Endpoint</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Register this URL in your Busha dashboard or webhook settings.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-secondary p-2.5">
              <span className="min-w-0 flex-1 truncate font-mono text-xs">{webhook.url}</span>
              <button onClick={() => copyValue(webhook.url, "Endpoint URL")} className="rounded p-1 hover:bg-card">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-secondary p-2.5">
              <span className="text-xs text-muted-foreground">Signing secret:</span>
              <span className="min-w-0 flex-1 truncate font-mono text-xs">
                {showSecret ? webhook.secret : "****************"}
              </span>
              <button onClick={() => setShowSecret((current) => !current)} className="rounded p-1 hover:bg-card">
                {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Status: {webhook.is_active ? "signing secret configured" : "signing secret missing in env"}
            </p>
          </div>
        ) : null}

        <div>
          <h2 className="mb-3 font-display text-base font-bold">Recent Deliveries</h2>
          {deliveries.length === 0 ? (
            <div className="card-glass p-5 text-sm text-muted-foreground">
              No webhook deliveries recorded yet. Send a test event from Busha after registering the endpoint.
            </div>
          ) : (
            deliveries.map((delivery) => (
              <div key={delivery.id} className="card-glass mb-3 p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-semibold">{delivery.event}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(delivery.received_at)}</p>
                  </div>
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-secondary p-3 text-xs">
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
