// components/dashboard/risk-heatmap.tsx
// Heatmap línea × turno: dónde se concentra el riesgo. Cada celda = nº de
// trabajadores marcados en esa línea+turno; el color = severidad (score máximo).
// Honesto: celdas vacías quedan claras (no hay marcados ahí).
"use client";

import { useTranslations } from "next-intl";
import { riskColor } from "@/lib/risk";
import type { EmployeePrediction } from "@/types";

const SHIFTS = ["matutino", "vespertino", "nocturno", "mixto"] as const;

export function RiskHeatmap({ rows }: { rows: EmployeePrediction[] }) {
  const t = useTranslations("dashboard");
  const lines = [...new Set(rows.map((r) => r.line))].sort();
  const cells = new Map<string, { count: number; max: number }>();
  for (const r of rows) {
    const k = `${r.line}|${r.shift}`;
    const c = cells.get(k) ?? { count: 0, max: 0 };
    c.count += 1;
    c.max = Math.max(c.max, r.score);
    cells.set(k, c);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate" style={{ borderSpacing: "5px" }}>
        <thead>
          <tr>
            <th />
            {SHIFTS.map((s) => (
              <th key={s} className="pb-1 text-[10.5px] font-medium text-ink-3">
                {t(`shift_${s}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line}>
              <td className="pr-2 text-right font-mono text-[12px] text-ink-2">{line}</td>
              {SHIFTS.map((s) => {
                const c = cells.get(`${line}|${s}`);
                return (
                  <td key={s} className="p-0">
                    <div
                      className="flex h-9 items-center justify-center rounded-md text-[12px] font-semibold"
                      style={{ background: c ? riskColor(c.max) : "#EEF1F8", color: c ? "#fff" : "#C7CCDC" }}
                      title={c ? `${line} · ${t(`shift_${s}`)}: ${c.count}` : undefined}
                    >
                      {c ? c.count : "·"}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
