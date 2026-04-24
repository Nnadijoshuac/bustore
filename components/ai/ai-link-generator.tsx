"use client";

import Image from "next/image";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { UseFormSetValue } from "react-hook-form";
import type { CreatePaymentLinkInput } from "@/lib/validations";
import { cn } from "@/lib/utils";

interface AILinkGeneratorProps {
  setValue: UseFormSetValue<CreatePaymentLinkInput>;
}

export function AILinkGenerator({ setValue }: AILinkGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/generate-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? "Failed to generate content");
      }

      const data = await response.json() as { title?: string; description?: string };
      if (!data.title || !data.description) throw new Error("AI returned incomplete content");
      setValue("title", data.title, { shouldValidate: true });
      setValue("description", data.description, { shouldValidate: true });
      setGenerated(true);
    } catch {
      setError("AI was unable to generate content. Please try manual entry.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-2xl bg-slate-900 p-4 text-white shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary opacity-5 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl group-hover:opacity-10 transition-opacity" />
      
      <div className="flex items-center gap-2">
        <Image
          src="/logo_fluent_ai.png"
          alt="Fluent AI logo"
          width={40}
          height={40}
          priority
          sizes="40px"
          className="h-10 w-auto object-contain"
        />
        <div className="flex flex-col">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 leading-none">
            {generated ? "Draft Perfected" : "Fluent AI"}
          </p>
          <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mt-1">content studio</p>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your service (e.g. logo design for a tech startup)..."
          rows={2}
          className="w-full rounded-xl border-none bg-white/5 p-3 text-xs text-white placeholder:text-white/30 focus:ring-1 focus:ring-primary/50 resize-none font-medium leading-relaxed"
        />
      </div>

      {error && <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider">{error}</p>}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={!prompt.trim() || isGenerating}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-[0.1em] transition-all",
          generated 
            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
            : "bg-primary text-slate-900 hover:scale-[1.02] active:scale-[0.98]"
        )}
      >
        {isGenerating ? (
          <Icon icon="solar:restart-bold-duotone" className="h-4 w-4 animate-spin" />
        ) : (
          <Icon icon={generated ? "solar:check-circle-bold-duotone" : "solar:wand-magic-bold-duotone"} className="h-4 w-4" />
        )}
        {isGenerating ? "Polishing..." : generated ? "Fields Re-filled" : "Generate content"}
      </button>
      
      {!generated && (
        <p className="text-[9px] text-center text-white/40 font-medium">
          Our AI will draft a professional title and description for you.
        </p>
      )}
    </div>
  );
}
