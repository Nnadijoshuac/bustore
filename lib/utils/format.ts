import { Currency } from "@/types";

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  EUR: "EUR ",
  GBP: "GBP ",
  NGN: "NGN ",
  GHS: "GHS ",
  KES: "KSh",
  ZAR: "R",
};

export function formatCurrency(
  amount: number,
  currency: Currency = "USD",
  options: { compact?: boolean; showCode?: boolean } = {}
): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    notation: options.compact ? "compact" : "standard",
  }).format(amount);

  return options.showCode ? `${symbol}${formatted} ${currency}` : `${symbol}${formatted}`;
}

export function formatDate(
  dateString: string,
  format: "short" | "long" | "relative" = "short"
): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (format === "relative") {
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
  }

  if (format === "short") {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function truncateAddress(str: string, chars = 6): string {
  if (str.length <= chars * 2) return str;
  return `${str.slice(0, chars)}...${str.slice(-chars)}`;
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
