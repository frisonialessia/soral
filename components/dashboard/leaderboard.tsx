// components/dashboard/leaderboard.tsx
// Leaderboard de líneas por riesgo: rankea las líneas por nº de trabajadores
// marcados (barra) con su score promedio (color = severidad).
"use client";

import { riskColor } from "@/lib/risk";
import type { EmployeePrediction } from "@/types";

export function Leaderboard({ rows }: { rows: EmployeePrediction[] }) {
  const agg = new Map<string, { count: number; sum: number }>();
  for (const r of rows) {
    const m = agg.get(r.line) ?? { count: 0, sum: 0 };
    m.count += 1;
    m.sum += r.score;
    agg.set(r.line, m);
  }
  const lines = [...agg.entries()]
    .map(([line, m]) => ({ line, count: m.count, avg: Math.round(m.sum / m.count) }))
    .sort((a, b) => b.count - a.count || b.avg - a.avg);
  const max = Math.max(1, ...lines.map((l) => l.count));

  return (
    <ol className="space-y-2.5">
      {lines.map((l, i) => (
        <li key={l.line} className="flex items-center gap-3">
          <span className="w-5 shrink-0 text-center font-mono text-[12px] font-bold text-ink-3">{i + 1}</span>
          <span className="w-8 shrink-0 font-mono text-[13px] text-ink-1">{l.line}</span>
          <div className="h-2 flex-1 overflow-hidden rounded bg-surface-bg">
            <div className="h-full rounded" style={{ width: `${(l.count / max) * 100}%`, background: riskColor(l.avg) }} />
          </div>
          <span className="w-[72px] shrink-0 text-right font-mono text-[11.5px] text-ink-2">
            {l.count} · {l.avg}%
          </span>
        </li>
      ))}
    </ol>
  );
}
