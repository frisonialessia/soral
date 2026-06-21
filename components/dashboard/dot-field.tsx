// components/dashboard/dot-field.tsx
"use client";

import { memo, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { riskColor } from "@/lib/risk";
import { buildField, CELL, type Cell } from "@/lib/dot-field-model";
import type { EmployeePrediction, RiskBand } from "@/types";

interface HoverInfo {
  ref: string;
  score: number;
  band: RiskBand;
  driver: string;
}

// Capa de fondo: la mayoría estable. Memoizada → NO se re-renderiza al mover el
// cursor (antes el campo entero se reconciliaba en cada hover).
const CalmLayer = memo(function CalmLayer({ cells }: { cells: Cell[] }) {
  return (
    <g aria-hidden="true">
      {cells.map((d, i) => {
        const lr = Math.min(1, Math.max(0, d.score / 100));
        return (
          <circle
            key={i}
            cx={d.c * CELL + CELL / 2}
            cy={d.r * CELL + CELL / 2}
            r={CELL * 0.16 + CELL * 0.3 * lr}
            fill={riskColor(d.score)}
            opacity={0.4 + 0.35 * lr}
          />
        );
      })}
    </g>
  );
});

export function DotField({
  employees,
  total,
}: {
  employees: EmployeePrediction[];
  total: number;
}) {
  const router = useRouter();
  const t = useTranslations("dotField");
  const tb = useTranslations("bands");
  const [hover, setHover] = useState<HoverInfo | null>(null);

  const { real, anon, width, height } = useMemo(
    () => buildField(employees, total),
    [employees, total]
  );

  const go = (ref: string) => router.push(`/empleado/${encodeURIComponent(ref)}`);

  return (
    <div className="relative pl-11">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        role="img"
        aria-label={t("mapAria", { total, known: real.length })}
        style={{ display: "block", overflow: "visible" }}
      >
        <CalmLayer cells={anon} />
        {real.map((d) => {
          const lr = Math.min(1, Math.max(0, d.score / 100));
          const info: HoverInfo = {
            ref: d.ref!,
            score: d.score,
            band: d.band,
            driver: d.driver ?? "",
          };
          return (
            <circle
              key={d.ref}
              cx={d.c * CELL + CELL / 2}
              cy={d.r * CELL + CELL / 2}
              r={CELL * 0.18 + CELL * 0.34 * lr}
              fill={riskColor(d.score)}
              opacity={0.96}
              stroke="#fff"
              strokeWidth={1.25}
              tabIndex={0}
              role="button"
              aria-label={t("dotAria", { ref: d.ref!, score: d.score, band: tb(d.band) })}
              style={{ cursor: "pointer", transition: "r .15s" }}
              onMouseEnter={() => setHover(info)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(info)}
              onBlur={() => setHover(null)}
              onClick={() => go(d.ref!)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  go(d.ref!);
                }
              }}
            >
              <title>{`${d.ref} · ${d.score}% · ${tb(d.band)}`}</title>
            </circle>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute left-0 top-2 flex h-[calc(100%-32px)] w-10 flex-col items-end justify-between pr-2 font-mono text-[9px] uppercase tracking-wide text-ink-3">
        <span>{t("critical")}</span>
        <span>{t("medium")}</span>
        <span>{t("stable")}</span>
      </div>

      {hover && (
        <div className="pointer-events-none absolute right-2 top-2 rounded-md border border-line-2 bg-surface px-4 py-3">
          <div className="font-mono text-[12px] text-ink-2">{hover.ref}</div>
          <div
            className="font-mono text-[20px] font-bold leading-tight"
            style={{ color: riskColor(hover.score) }}
          >
            {hover.score}%
          </div>
          <div className="text-[11.5px] text-ink-2">
            {tb(hover.band)}
            {hover.driver ? ` · ${hover.driver}` : ""}
          </div>
        </div>
      )}
    </div>
  );
}
