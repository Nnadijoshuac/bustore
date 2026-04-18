"use client";

import { useState } from "react";
import { Sparkles, RefreshCw, TrendingUp, Zap, AlertCircle } from "lucide-react";

const ICONS = [TrendingUp, Zap, AlertCircle];

export function AIInsightsCard() {
  const [bullets, setBullets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const fetch_ = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/insights", { method: "POST" });
      const data = (await res.json()) as { bullets?: string[]; error?: string };
      if (!res.ok || !data.bullets) throw new Error(data.error ?? "Failed to generate insights");
      setBullets(data.bullets);
      setLoaded(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-glass overflow-hidden">
      <div className="h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent" />
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-sm font-bold">AI Insights</h2>
              <p className="text-[11px] text-muted-foreground">Smart summary of your operations</p>
            </div>
          </div>
          <button
            onClick={fetch_}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            {loaded ? "Refresh" : "Generate"}
          </button>
        </div>

        {!loaded && !loading && !error && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <p className="max-w-xs text-sm text-muted-foreground">
              Click <span className="font-medium text-foreground">Generate</span> for an AI-powered summary of your revenue and payments.
            </p>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            {[75, 90, 65].map((w, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="skeleton mt-0.5 h-5 w-5 flex-shrink-0 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-3 rounded" style={{ width: `${w}%` }} />
                  <div className="skeleton h-3 w-2/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && bullets.length > 0 && (
          <div className="space-y-2.5">
            {bullets.map((bullet, i) => {
              const Icon = ICONS[i] ?? Sparkles;
              return (
                <div key={i} className="flex items-start gap-3 rounded-xl bg-secondary/40 p-3">
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-lg bg-primary/15">
                    <Icon className="h-3 w-3 text-primary" />
                  </div>
                  <p className="text-sm leading-6 text-foreground">{bullet}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
