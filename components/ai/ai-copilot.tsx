"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store/app.store";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_PROMPTS = [
  "How much did I earn this month?",
  "Analyze my recent transactions",
  "Help me draft a payment link",
];

export function AICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm Fluent. I have live access to your transactions and balance. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { sidebarOpen } = useAppStore();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!response.ok) throw new Error("AI request failed");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      let assistantContent = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices[0]?.delta?.content || "";
              assistantContent += delta;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1].content = assistantContent;
                return updated;
              });
            } catch {
              // Ignore parse errors for partial chunks
            }
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I've encountered an error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="mb-4 flex h-[500px] w-[360px] flex-col overflow-hidden rounded-[2rem] bg-card shadow-2xl border border-border/40 animate-slide-in">
          {/* Header */}
          <div className="flex items-center justify-between bg-slate-900 px-5 py-4 text-white">
            <div className="flex items-center gap-2.5">
              <Image
                src="/logo_fluent_ai.png"
                alt="Fluent AI logo"
                width={44}
                height={44}
                priority
                sizes="44px"
                className="h-11 w-auto object-contain"
              />
              <div>
                <p className="text-xs font-bold tracking-tight">Fluent AI</p>
                <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest leading-none">live assistant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="rounded-lg p-1.5">
              <Icon icon="solar:close-circle-bold-duotone" className="h-5 w-5 text-white/60" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-secondary/10">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed font-medium shadow-sm border",
                    msg.role === "user"
                      ? "bg-slate-900 text-white border-slate-800"
                      : "bg-white text-slate-800 border-border/40"
                  )}
                >
                  {msg.content || (
                    <div className="flex gap-1 py-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:0.2s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:0.4s]" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Suggested Prompts */}
          {messages.length === 1 && (
            <div className="px-5 py-3 bg-secondary/10 space-y-2">
               <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-1">Try asking</p>
               <div className="flex flex-wrap gap-2">
                 {SUGGESTED_PROMPTS.map(p => (
                   <button 
                    key={p} 
                    onClick={() => handleSend(p)}
                    className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-white border border-border/60 text-slate-700 shadow-sm"
                   >
                     {p}
                   </button>
                 ))}
               </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border/40 p-4 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Fluent AI..."
                className="input-base flex-1 h-10 border-none bg-secondary/40 font-bold"
              />
              <button disabled={!input.trim() || isLoading} className="btn-primary h-10 w-10 flex items-center justify-center p-0 rounded-xl">
                <Icon icon="solar:plain-bold-duotone" className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-2xl active:scale-95 relative",
            !sidebarOpen && "md:translate-x-[-12px]"
          )}
        >
          <Icon icon="solar:magic-stick-3-bold-duotone" className="h-6 w-6 text-primary" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
             <span className="relative inline-flex rounded-full h-4 w-4 bg-primary text-[8px] font-bold text-slate-900 items-center justify-center">1</span>
          </span>
        </button>
      )}
    </div>
  );
}
