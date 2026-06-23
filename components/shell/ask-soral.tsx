// components/shell/ask-soral.tsx
// "Ask Soral": asistente conversacional disponible desde el header en toda la
// app. Reusa el Dialog (focus-trap + Escape) y el mismo seam LLM/reglas vía
// /api/ai/ask. Anclado en los datos reales de la planta.
"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles, Send } from "lucide-react";
import { Dialog, DialogClose } from "@/components/ui/dialog";
import { useAskSoral } from "@/lib/queries";

type Msg = { role: "user" | "assistant"; content: string };

export function AskSoral() {
  const t = useTranslations("ask");
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [source, setSource] = useState<"llm" | "rules" | null>(null);
  const ask = useAskSoral();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, ask.isPending]);

  function send(text: string) {
    const q = text.trim();
    if (!q || ask.isPending) return;
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    ask.mutate(next, {
      onSuccess: (res) => {
        setMessages((m) => [...m, { role: "assistant", content: res.answer }]);
        setSource(res.source);
      },
      onError: () => {
        setMessages((m) => [...m, { role: "assistant", content: t("error") }]);
      },
    });
  }

  const suggestions = [t("s1"), t("s2"), t("s3"), t("s4")];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full border border-line-2 bg-surface px-3 py-1.5 text-[12.5px] font-medium text-ink-1 transition-colors hover:border-risk-sol hover:text-risk-sol"
      >
        <Sparkles className="h-4 w-4 text-risk-sol" />
        <span className="hidden sm:inline">{t("trigger")}</span>
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} label={t("title")}>
        <div className="flex h-[70vh] max-h-[640px] flex-col">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-risk-sol text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-[15px] font-semibold">{t("title")}</span>
            {source && (
              <span className="rounded-full border border-line-2 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-3">
                {source === "llm" ? t("live") : t("sample")}
              </span>
            )}
            <span className="ml-auto">
              <DialogClose onClose={() => setOpen(false)} />
            </span>
          </div>

          <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
            {messages.length === 0 ? (
              <div className="pt-2">
                <p className="text-[13px] text-ink-2">{t("empty")}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {suggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => send(sug)}
                      className="rounded-full border border-line bg-surface-2 px-3 py-1.5 text-[12px] text-ink-1 transition-colors hover:border-risk-sol hover:text-risk-sol"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed ${
                      m.role === "user" ? "bg-risk-sol text-white" : "bg-surface-2 text-ink-1"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))
            )}
            {ask.isPending && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-surface-2 px-3.5 py-2 text-[15px] text-ink-3">…</div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="mt-3 flex items-center gap-2 border-t border-line pt-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("placeholder")}
              aria-label={t("placeholder")}
              className="min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-[13px] outline-none focus:border-risk-sol"
            />
            <button
              type="submit"
              aria-label={t("send")}
              disabled={!input.trim() || ask.isPending}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-risk-sol text-white transition-opacity disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </Dialog>
    </>
  );
}
