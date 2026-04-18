"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, ChevronDown } from "lucide-react";

type Message = { id: string; role: "user" | "assistant"; content: string };

const SUGGESTED = [
  "What's my biggest payment this month?",
  "How much is pending settlement?",
  "Which payment link performs best?",
  "Write me a payment link for brand consulting",
];

export function AICopilot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || streaming) return;
      const userMsg: Message = { id: `u${Date.now()}`, role: "user", content: text.trim() };
      const asstMsg: Message = { id: `a${Date.now()}`, role: "assistant", content: "" };
      setMessages((p) => [...p, userMsg, asstMsg]);
      setInput("");
      setStreaming(true);

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMsg].map(({ role, content }) => ({ role, content })),
          }),
        });
        if (!res.body) throw new Error("No stream");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          for (const line of decoder.decode(value, { stream: true }).split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const d = line.slice(6).trim();
            if (d === "[DONE]") break;
            try {
              const delta = (JSON.parse(d) as { choices?: { delta?: { content?: string } }[] })
                .choices?.[0]?.delta?.content;
              if (delta)
                setMessages((p) => {
                  const last = p[p.length - 1];
                  return last?.role === "assistant"
                    ? [...p.slice(0, -1), { ...last, content: last.content + delta }]
                    : p;
                });
            } catch { /* ignore */ }
          }
        }
      } catch {
        setMessages((p) => {
          const last = p[p.length - 1];
          return last?.role === "assistant" && !last.content
            ? [...p.slice(0, -1), { ...last, content: "Sorry, I couldn't connect. Please try again." }]
            : p;
        });
      } finally {
        setStreaming(false);
      }
    },
    [messages, streaming]
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex w-[360px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-slate-300/40"
            style={{ height: 500 }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 bg-[#0d1b2a] px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Fluent AI</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                  <p className="text-[11px] text-white/45">Your financial copilot</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 pb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold">Ask me anything</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      I know your balance, transactions, links & more.
                    </p>
                  </div>
                  <div className="w-full space-y-2">
                    {SUGGESTED.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="w-full rounded-xl border border-border bg-secondary/60 px-3 py-2.5 text-left text-xs font-medium transition-colors hover:bg-secondary"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      {msg.role === "assistant" && (
                        <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-primary/15">
                          <Sparkles className="h-3 w-3 text-primary" />
                        </div>
                      )}
                      <div
                        className={`max-w-[82%] rounded-2xl px-3 py-2.5 text-sm leading-6 ${
                          msg.role === "user"
                            ? "rounded-tr-sm bg-[#0d1b2a] text-white"
                            : "rounded-tl-sm bg-secondary text-foreground"
                        }`}
                      >
                        {msg.content || (
                          <span className="flex gap-1">
                            {[0, 150, 300].map((d) => (
                              <span key={d} className="animate-bounce text-muted-foreground" style={{ animationDelay: `${d}ms` }}>•</span>
                            ))}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border p-3">
              <div className="flex items-end gap-2 rounded-xl border border-border bg-background px-3 py-2 transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                  placeholder="Ask about your payments..."
                  rows={1}
                  className="flex-1 resize-none bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
                  style={{ maxHeight: 80 }}
                />
                <button
                  onClick={() => send(input)}
                  disabled={!input.trim() || streaming}
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-white transition-opacity disabled:opacity-40"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
                Powered by OpenRouter · Enter to send
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0d1b2a] shadow-lg shadow-slate-400/30 hover:bg-[#162436]"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="c" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <ChevronDown className="h-5 w-5 text-white" />
            </motion.span>
          ) : (
            <motion.span key="o" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Sparkles className="h-5 w-5 text-primary" />
            </motion.span>
          )}
        </AnimatePresence>
        {!open && messages.length > 0 && (
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-card bg-primary" />
        )}
      </motion.button>
    </div>
  );
}
