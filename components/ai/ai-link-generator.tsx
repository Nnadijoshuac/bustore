"use client";

import { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import type { UseFormSetValue } from "react-hook-form";
import type { CreatePaymentLinkInput } from "@/lib/validations";

interface Props {
  setValue: UseFormSetValue<CreatePaymentLinkInput>;
}

export function AILinkGenerator({ setValue }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);

  const generate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    setGenerated(false);
    try {
      const res = await fetch("/api/ai/generate-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = (await res.json()) as { title?: string; description?: string; error?: string };
      if (!res.ok || !data.title || !data.description) {
        throw new Error(data.error ?? "Failed to generate");
      }
      setValue("title", data.title, { shouldValidate: true });
      setValue("description", data.description, { shouldValidate: true });
      setGenerated(true);
      setExpanded(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-primary/25 bg-primary/5">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-3.5 py-2.5 transition-colors hover:bg-primary/10"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          {generated ? "✓ Fields filled — edit freely above" : "Generate content with AI"}
        </span>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-primary" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-primary" />
        )}
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-primary/15 px-3.5 pb-3.5 pt-3">
          <p className="text-xs text-muted-foreground">
            Describe what you&apos;re being paid for — AI will write a polished title and description.
          </p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate(); }}
            placeholder="e.g. mobile app UI, 5 screens, 2 rounds of revisions"
            rows={2}
            className="input-base resize-none text-sm"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="button"
            onClick={generate}
            disabled={!prompt.trim() || loading}
            className="btn-primary w-full justify-center py-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…</>
            ) : (
              <><Sparkles className="h-3.5 w-3.5" /> Generate</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
