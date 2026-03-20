"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, Info, X } from "lucide-react";
import { getSettlements, getRecipients, createSettlement } from "@/lib/api/service";
import { Topbar } from "@/components/shared/topbar";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/toaster";
import { DEMO_ACCOUNT } from "@/lib/api/demo-data";

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
      setAmount("");
      setRecipientId("");
      setNote("");
    },
    onError: () => toast({ title: "Settlement failed", variant: "error" }),
  });

  const amountNum = parseFloat(amount) || 0;
  const fee = amountNum * 0.003;

  return (
    <div>
      <Topbar
        title="Settlements"
        description="Move your USD balance to local bank accounts"
        actions={
          <button onClick={() => setShowModal(true)} className="btn-primary w-full justify-center sm:w-auto">
            <ArrowUpRight className="h-4 w-4" />
            Settle Funds
          </button>
        }
      />

      <div className="space-y-4 p-4 sm:p-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <ArrowUpRight className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Available to settle</p>
            <p className="font-display text-2xl font-bold">{formatCurrency(DEMO_ACCOUNT.balance_usd)}</p>
          </div>
          <div className="sm:ml-auto sm:text-right">
            <p className="text-xs text-muted-foreground">Indicative rate</p>
            <p className="text-sm font-semibold">1 USD = NGN {DEMO_RATE.toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-3 md:hidden">
          {settlements.map((settlement) => (
            <div key={settlement.id} className="card-glass p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{settlement.recipient?.name ?? "-"}</p>
                  <p className="text-xs text-muted-foreground">{settlement.recipient?.bank_name}</p>
                </div>
                <StatusBadge status={settlement.status} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Reference</p>
                  <p className="mt-1 break-all font-mono text-[11px]">{settlement.reference}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Amount</p>
                  <p className="mt-1 font-semibold">{formatCurrency(settlement.amount_usd)}</p>
                  <p className="text-muted-foreground">
                    Approx. {formatCurrency(settlement.amount_local, settlement.local_currency)}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{formatDate(settlement.created_at)}</p>
            </div>
          ))}
        </div>

        <div className="card-glass hidden overflow-x-auto md:block">
          <div className="border-b border-border p-4">
            <h2 className="font-display text-base font-bold">Settlement History</h2>
          </div>
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Recipient</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Reference</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {settlements.map((settlement) => (
                <tr key={settlement.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <p className="font-medium">{settlement.recipient?.name ?? "-"}</p>
                    <p className="text-xs text-muted-foreground">{settlement.recipient?.bank_name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-secondary px-2 py-0.5 font-mono text-xs text-muted-foreground">
                      {settlement.reference}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(settlement.created_at)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={settlement.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="font-semibold">{formatCurrency(settlement.amount_usd)}</p>
                    <p className="text-xs text-muted-foreground">
                      Approx. {formatCurrency(settlement.amount_local, settlement.local_currency)}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-3 pt-6 sm:items-center sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative my-auto max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-card p-4 shadow-xl animate-slide-in sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Settle Funds</h2>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1.5 hover:bg-secondary">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Recipient *</label>
                <select value={recipientId} onChange={(event) => setRecipientId(event.target.value)} className="input-base bg-background">
                  <option value="">Select a recipient...</option>
                  {recipients.map((recipient) => (
                    <option key={recipient.id} value={recipient.id}>
                      {recipient.name} - {recipient.bank_name} ****{recipient.bank_account_number.slice(-4)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Amount (USD) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-muted-foreground">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="0.00"
                    className="input-base pl-7"
                  />
                </div>
              </div>

              {amountNum > 0 ? (
                <div className="space-y-2 rounded-xl bg-secondary p-3.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">You send</span>
                    <span className="font-medium">{formatCurrency(amountNum)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Network fee</span>
                    <span className="font-medium">-{formatCurrency(fee)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rate</span>
                    <span className="font-medium">1 USD = NGN {DEMO_RATE.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Recipient gets</span>
                    <span className="text-primary">Approx. NGN {((amountNum - fee) * DEMO_RATE).toLocaleString()}</span>
                  </div>
                </div>
              ) : null}

              <div>
                <label className="mb-1.5 block text-sm font-medium">Note (optional)</label>
                <input
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="e.g. July payout"
                  className="input-base"
                />
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-xs text-muted-foreground">
                <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-blue-500" />
                Settlements typically arrive within 15 minutes during business hours.
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">
                  Cancel
                </button>
                <button
                  onClick={() => mutation.mutate({ recipient_id: recipientId, amount_usd: amountNum, note })}
                  disabled={mutation.isPending || !recipientId || !amountNum}
                  className="btn-primary flex-1 justify-center"
                >
                  {mutation.isPending ? "Processing..." : "Confirm Settlement"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
