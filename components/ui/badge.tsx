import { cn } from "@/lib/utils";
import { TransactionStatus, SettlementStatus, PaymentLinkStatus } from "@/types";

interface BadgeProps {
  status: TransactionStatus | SettlementStatus | PaymentLinkStatus | string;
  className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string; dot: string }> = {
  completed:  { label: "Completed",  className: "badge-green",  dot: "bg-emerald-500" },
  settled:    { label: "Settled",    className: "badge-green",  dot: "bg-emerald-500" },
  active:     { label: "Active",     className: "badge-green",  dot: "bg-emerald-500" },
  pending:    { label: "Pending",    className: "badge-yellow", dot: "bg-amber-500" },
  processing: { label: "Processing", className: "badge-yellow", dot: "bg-amber-500" },
  failed:     { label: "Failed",     className: "badge-red",    dot: "bg-red-500" },
  refunded:   { label: "Refunded",   className: "badge-slate",  dot: "bg-slate-400" },
  inactive:   { label: "Inactive",   className: "badge-slate",  dot: "bg-slate-400" },
  archived:   { label: "Archived",   className: "badge-slate",  dot: "bg-slate-400" },
};

export function StatusBadge({ status, className }: BadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "badge-slate",
    dot: "bg-slate-400",
  };

  return (
    <span className={cn(config.className, className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
