// components/dashboard/departure-forecast.tsx
// Pronóstico de salidas: no solo QUIÉN, sino CUÁNDO. Estima la ventana de salida
// de cada trabajador en riesgo a partir de su score (mayor score → antes) y la
// coloca en un calendario a 4 semanas con la urgencia de "actuar ya".
"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { riskColor } from "@/lib/risk";
import type { EmployeePrediction } from "@/types";

const bucketOf = (score: number) => Math.min(4, Math.max(0, Math.floor((100 - score) / 7)));

export function DepartureForecast({
  rows,
  onSelect,
}: {
  rows: EmployeePrediction[];
  // Override del click — la landing lo usa para no navegar a refs de muestra.
  onSelect?: (ref: string) => void;
}) {
  const t = useTranslations("dashboard");

  const buckets: EmployeePrediction[][] = [[], [], [], [], []];
  for (const e of rows) buckets[bucketOf(e.score)].push(e);
  for (const b of buckets) b.sort((a, c) => c.score - a.score);
  const within4 = rows.filter((e) => bucketOf(e.score) <= 3).length;
  const labels = [t("fcW0"), t("fcW1"), t("fcW2"), t("fcW3"), t("fcW4plus")];

  return (
    <div>
      <p className="text-copy font-medium text-ink-1">{t("fcLead", { n: within4 })}</p>

      <ul className="mt-4 space-y-1">
        {buckets.map((b, i) => (
          <li key={i} className="flex items-start gap-3 border-b border-line py-2.5 last:border-0">
            <span className="flex w-[104px] shrink-0 flex-col items-start gap-1 pt-1 text-meta text-ink-2">
              <span>{labels[i]}</span>
              {i === 0 && b.length > 0 && (
                <span className="whitespace-nowrap rounded-full bg-risk-cri/10 px-2 py-0.5 text-micro font-semibold uppercase tracking-wide text-risk-cri">
                  {t("fcActNow")}
                </span>
              )}
            </span>
            <div className="flex flex-1 flex-wrap gap-1.5">
              {b.length === 0 ? (
                <span className="pt-1 text-meta text-ink-3">—</span>
              ) : (
                b.map((e) => {
                  const chip = (
                    <>
                      <span className="h-2 w-2 rounded-full" style={{ background: riskColor(e.score) }} />
                      <span className="font-mono text-ink-1">{e.ref}</span>
                      <span className="font-mono text-ink-3">{e.score}</span>
                    </>
                  );
                  const cls =
                    "inline-flex items-center gap-1.5 rounded-full border border-line px-2 py-1 text-meta transition-colors hover:border-risk-sol hover:bg-surface-2";
                  return onSelect ? (
                    <button key={e.ref} type="button" onClick={() => onSelect(e.ref)} className={cls}>
                      {chip}
                    </button>
                  ) : (
                    <Link key={e.ref} href={`/empleado/${encodeURIComponent(e.ref)}`} className={cls}>
                      {chip}
                    </Link>
                  );
                })
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
