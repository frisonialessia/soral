// components/dashboard/contagion-map.tsx
// Mapa de contagio: la rotación no es individual, se propaga. Agrupamos a los
// trabajadores en riesgo por línea (cada línea con su "pieza clave" = el de mayor
// score, proxy del supervisor) y estimamos el efecto cascada si esa pieza se va.
// Vista de red (hub-and-spoke) + ranking por potencial de contagio.
"use client";

import { useTranslations } from "next-intl";
import { riskColor } from "@/lib/risk";
import type { EmployeePrediction } from "@/types";

export function ContagionMap({ rows }: { rows: EmployeePrediction[] }) {
  const t = useTranslations("dashboard");

  const byLine = new Map<string, EmployeePrediction[]>();
  for (const e of rows) {
    const arr = byLine.get(e.line) ?? [];
    arr.push(e);
    byLine.set(e.line, arr);
  }
  const clusters = [...byLine.entries()]
    .map(([line, members]) => {
      const avg = Math.round(members.reduce((s, m) => s + m.score, 0) / members.length);
      const cascade = Math.min(28, Math.max(6, Math.round(6 + members.length * 3 + (avg - 70) * 0.25)));
      return { line, members, avg, cascade, potential: members.length * (avg / 100) };
    })
    .sort((a, b) => b.potential - a.potential);

  const n = clusters.length;
  const W = 760;
  const H = 230;
  const hubY = 96;
  const top = clusters[0];

  return (
    <div>
      <p className="text-[12.5px] text-ink-2">{t("conLead")}</p>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label={t("conLead")} className="mt-2">
        {clusters.map((c, i) => {
          const hubX = ((i + 0.5) * W) / n;
          const ring = 30 + Math.min(c.members.length, 6) * 2.5;
          const hubR = 9 + Math.min(c.members.length, 8) * 1.6;
          const isTop = i === 0;
          return (
            <g key={c.line}>
              {c.members.map((m, j) => {
                const a = -Math.PI / 2 + (j * 2 * Math.PI) / c.members.length;
                const mx = hubX + Math.cos(a) * ring;
                const my = hubY + Math.sin(a) * ring;
                return (
                  <g key={m.ref}>
                    <line x1={hubX} y1={hubY} x2={mx} y2={my} stroke="#E8EAF2" strokeWidth={1} />
                    <circle cx={mx} cy={my} r={5} fill={riskColor(m.score)} opacity={0.9} />
                  </g>
                );
              })}
              {isTop && <circle cx={hubX} cy={hubY} r={hubR + 6} fill="none" stroke={riskColor(c.avg)} strokeWidth={1.5} strokeDasharray="3 3" />}
              <circle cx={hubX} cy={hubY} r={hubR} fill={riskColor(c.avg)} stroke="#fff" strokeWidth={2} />
              <text x={hubX} y={hubY + 3.5} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">
                {c.line}
              </text>
              <text x={hubX} y={hubY + ring + 22} textAnchor="middle" fontSize="10.5" fill="#A9AEC2">
                +{c.cascade}%
              </text>
            </g>
          );
        })}
      </svg>

      {top && (
        <div className="mt-1 rounded-lg border border-risk-cri/25 bg-risk-cri/5 px-3.5 py-2.5 text-[12.5px]">
          <span className="font-mono font-semibold text-ink-1">{top.line}</span>{" "}
          <span className="text-ink-2">· {t("conKeystone")} · </span>
          <span className="font-medium text-risk-cri">
            {t("conCascade", { n: top.members.length, pct: top.cascade })}
          </span>
        </div>
      )}

      <div className="mt-3">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-3">{t("conRankTitle")}</div>
        <ul className="space-y-2">
          {clusters.map((c) => {
            const max = clusters[0].cascade || 1;
            return (
              <li key={c.line} className="flex items-center gap-3 text-[12.5px]">
                <span className="w-8 shrink-0 font-mono text-ink-1">{c.line}</span>
                <div className="h-2 flex-1 overflow-hidden rounded bg-surface-bg">
                  <div className="h-full rounded" style={{ width: `${(c.cascade / max) * 100}%`, background: riskColor(c.avg) }} />
                </div>
                <span className="w-24 shrink-0 text-right font-mono text-ink-2">
                  +{c.cascade}% · {c.members.length}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
