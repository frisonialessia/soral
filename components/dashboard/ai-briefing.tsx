// components/dashboard/ai-briefing.tsx
// Briefing semanal con IA en el dashboard. Pide /api/ai/briefing (Claude en vivo
// si hay key, o reglas deterministas si no) y lo muestra arriba del todo. Si
// falla, se oculta — nunca rompe el dashboard.
"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { useBriefing } from "@/lib/queries";

export function AiBriefing() {
  const t = useTranslations("dashboard");
  const { data, isLoading, isError } = useBriefing();

  if (isError) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-gradient-to-br from-risk-sol-soft/70 via-surface to-surface p-5">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-risk-sol text-white">
          <Sparkles className="h-4 w-4" />
        </span>
        <span className="text-copy font-semibold text-ink-1">{t("aiBriefingTitle")}</span>
        {data && (
          <span className="rounded-full border border-line-2 bg-surface px-2 py-0.5 text-micro font-medium uppercase tracking-wide text-ink-3">
            {data.source === "llm" ? t("aiBriefingLive") : t("aiBriefingSample")}
          </span>
        )}
      </div>

      {isLoading || !data ? (
        <div className="space-y-2">
          <div className="h-4 w-2/3 animate-pulse rounded bg-surface-bg" />
          <div className="h-3 w-full animate-pulse rounded bg-surface-bg" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-surface-bg" />
        </div>
      ) : (
        <>
          <h3 className="text-subhead font-semibold tracking-tight text-ink-1">{data.headline}</h3>
          <p className="mt-1 max-w-3xl text-copy leading-relaxed text-ink-2">{data.summary}</p>
          {data.points.length > 0 && (
            <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
              {data.points.map((p, i) => (
                <li key={i} className="flex gap-2 text-copy text-ink-1">
                  <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-risk-sol" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
