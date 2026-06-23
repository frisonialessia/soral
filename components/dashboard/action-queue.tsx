// components/dashboard/action-queue.tsx
// Cola "actuar esta semana": convierte la lista de mayor riesgo en un worklist
// accionable — cada fila muestra el play recomendado y permite asignarlo (reusa
// el RecommendationModal existente).
"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { riskColor } from "@/lib/risk";
import { RecommendationModal } from "@/components/recommendation-modal";
import type { EmployeePrediction } from "@/types";

// De la reco multilínea sacamos la JUGADA recomendada (primer paso numerado) y la
// ventana de acción. Antes se mostraba la línea "Diagnóstico: …", que sólo repetía
// el driver — ya visible en el subtítulo — sin decir qué hacer.
function nextPlay(text: string): { action: string; window: string | null } {
  const lines = text.split("\n").map((s) => s.trim()).filter(Boolean);
  const step = lines.find((l) => /^\d+[.)]/.test(l));
  const fallback = lines.find((l) => !/^diagn[óo]stico/i.test(l)) ?? lines[0] ?? "";
  const action = (step ?? fallback).replace(/^\d+[.)]\s*/, "");
  const win = lines.find((l) => /ventana de acci[óo]n/i.test(l));
  const window = win ? (win.split(/:/)[1]?.trim().replace(/[.\s]+$/, "") ?? null) : null;
  return { action, window };
}

export function ActionQueue({ rows }: { rows: EmployeePrediction[] }) {
  const [modalEmp, setModalEmp] = useState<EmployeePrediction | null>(null);
  const t = useTranslations("dashboard");
  const tb = useTranslations("bands");

  return (
    <>
      <ul className="overflow-hidden rounded-xl border border-line bg-surface">
        {rows.map((e) => {
          const c = riskColor(e.score);
          return (
            <li
              key={e.ref}
              className="flex flex-col gap-3 border-b border-line px-4 py-3.5 last:border-0 sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-3 sm:w-[250px] sm:shrink-0">
                <Badge color={c}>{e.score}%</Badge>
                <div className="min-w-0">
                  <Link
                    href={`/empleado/${encodeURIComponent(e.ref)}`}
                    className="font-mono text-[13px] text-ink-1 hover:text-risk-sol"
                  >
                    {e.ref}
                  </Link>
                  <div className="truncate text-[11px] text-ink-3">
                    {tb(e.band)} · {e.line} · {e.driver}
                  </div>
                </div>
              </div>
              {(() => {
                const { action, window } = nextPlay(e.reco);
                return (
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[12.5px] leading-relaxed text-ink-2">{action}</p>
                    {window && (
                      <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-ink-3">
                        <Clock className="h-3 w-3" />
                        {window}
                      </span>
                    )}
                  </div>
                );
              })()}
              <button
                type="button"
                onClick={() => setModalEmp(e)}
                className="shrink-0 self-start whitespace-nowrap rounded-lg bg-risk-sol px-3.5 py-[7px] text-[12.5px] font-medium text-white transition-colors hover:bg-risk-sol/90 sm:self-auto"
              >
                {t("assign")}
              </button>
            </li>
          );
        })}
      </ul>
      <RecommendationModal employee={modalEmp} onClose={() => setModalEmp(null)} />
    </>
  );
}
