// feature/settlements — compiled
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettlements, getRecipients, createSettlement } from "@/lib/api/service";
import { Topbar } from "@/components/shared/topbar";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/toaster";
import { DEMO_ACCOUNT } from "@/lib/api/demo-data";
import { ArrowUpRight, X, Info } from "lucide-react";

const DEMO_RATE = 1547;

export default function SettlementsPage() {
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [note, setNote] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settlements = [] } = useQuery({ queryKey: ["settlements"], queryFn: getSettlements });
  const { data: recipients = [] } = useQuery({ queryKey: ["recipients"], queryFn: getRecipients });

  const mutation = useMutation({
    mutationFn: createSettlement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settlements"] });
      toast({ title: "Settlement initiated!", description: "Funds are on their way.", variant: "success" });
      setShowModal(false);
      setAmount(""); setRecipientId(""); setNote("");
    },
    onError: () => toast({ title: "Settlement failed", variant: "error" }),
  });

  const amountNum = parseFloat(amount) || 0;
  const localAmount = amountNum * DEMO_RATE;
  const fee = amountNum * 0.003;

  return (
    <div>
      <Topbar
        title="Settlements"
        description="Move your USD balance to local bank accounts"
        actions={
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <ArrowUpRight className="w-4 h-4" />
            Settle Funds
          </button>
        }
      />

      <div className="p-6 space-y-4">
        {/* Balance pill */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Available to Settle</p>
            <p className="font-display font-bold text-2xl">{formatCurrency(DEMO_ACCOUNT.balance_usd)}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-muted-foreground">Rate (indicative)</p>
            <p className="font-semibold text-sm">1 USD ≈ ₦{DEMO_RATE.toLocaleString()}</p>
          </div>
        </div>

        {/* Table */}
        <div className="card-glass overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-display font-bold text-base">Settlement History</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Recipient</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Reference</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {settlements.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <p className="font-medium">{s.recipient?.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{s.recipient?.bank_name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                      {s.reference}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(s.created_at)}</td>
                  <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <p className="font-semibold">{formatCurrency(s.amount_usd)}</p>
                    <p className="text-xs text-muted-foreground">
                      ≈ {formatCurrency(s.amount_local, s.local_currency)}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settle Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-md p-6 animate-slide-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-xl">Settle Funds</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-secondary rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Recipient *</label>
                <select
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  className="input-base bg-background"
                >
                  <option value="">Select a recipient…</option>
                  {recipients.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} — {r.bank_name} ****{r.bank_account_number.slice(-4)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Amount (USD) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="input-base pl-7"
                  />
                </div>
              </div>

              {amountNum > 0 && (
                <div className="rounded-xl bg-secondary p-3.5 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">You send</span>
                    <span className="font-medium">{formatCurrency(amountNum)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Network fee</span>
                    <span className="font-medium">−{formatCurrency(fee)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rate</span>
                    <span className="font-medium">1 USD = ₦{DEMO_RATE.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Recipient gets</span>
                    <span className="text-primary">≈ ₦{((amountNum - fee) * DEMO_RATE).toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium block mb-1.5">Note (optional)</label>
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. July payout" className="input-base" />
              </div>

              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg">
                <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                Settlements typically arrive within 15 minutes during business hours.
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button
                  onClick={() => mutation.mutate({ recipient_id: recipientId, amount_usd: amountNum, note })}
                  disabled={mutation.isPending || !recipientId || !amountNum}
                  className="btn-primary flex-1 justify-center"
                >
                  {mutation.isPending ? "Processing…" : "Confirm Settlement"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
