"use client";

import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

async function fetchInsights() {
  const response = await fetch("/api/ai/insights", { method: "POST" });
  if (!response.ok) throw new Error("Failed to fetch insights");
  return response.json();
}

export function AIInsightsCard() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["ai-insights"],
    queryFn: fetchInsights,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const bullets = data?.bullets ?? [];

  return (
    <div className="relative overflow-hidden rounded-[1.5rem] bg-white border border-border/40 p-5 shadow-sm group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon icon="solar:stars-minimalistic-bold-duotone" className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xs text-slate-900 tracking-tight">Ejima Insights</h3>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">powered by ejima</p>
          </div>
        </div>
        <button 
          onClick={() => refetch()} 
          disabled={isFetching}
          className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground"
        >
          <Icon icon="solar:restart-bold-duotone" className={cn("w-4 h-4", isFetching && "animate-spin")} />
        </button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-3 w-3 rounded-full bg-secondary animate-pulse mt-1 shrink-0" />
              <div className="h-3 bg-secondary rounded w-full animate-pulse" />
            </div>
          ))
        ) : (
          bullets.map((bullet: string, i: number) => (
            <div key={i} className="flex gap-3 items-start group/item">
              <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 group-hover/item:bg-primary transition-colors">
                <Icon icon="solar:check-circle-bold-duotone" className="h-2.5 w-2.5 text-primary group-hover/item:text-white" />
              </div>
              <p className="text-[11px] font-medium leading-relaxed text-slate-700">
                {bullet}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="absolute top-0 right-0 w-32 h-32 bg-primary opacity-5 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl" />
    </div>
  );
}
