// components/dashboard/action-queue.tsx
// Cola "actuar esta semana": convierte la lista de mayor riesgo en un worklist
// accionable — cada fila muestra el play recomendado y permite asignarlo (reusa
// el RecommendationModal existente).
"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { riskColor } from "@/lib/risk";
import { RecommendationModal } from "@/components/recommendation-modal";
import type { EmployeePrediction } from "@/types";

function firstLine(text: string): string {
  return text.split("\n").map((s) => s.trim()).find(Boolean) ?? "";
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
              <p className="line-clamp-2 min-w-0 flex-1 text-[12.5px] leading-relaxed text-ink-2">
                {firstLine(e.reco)}
              </p>
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
