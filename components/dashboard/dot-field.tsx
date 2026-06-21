// components/dashboard/dot-field.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { riskColor, bandLabel, bandOf } from "@/lib/risk";
import type { RiskBand } from "@/types";

interface HoverInfo {
  ref: string;
  score: number;
  band: RiskBand;
  driver: string;
}

const COLS = 44;
const ROWS = 22;

export function DotField({ topRef }: { topRef: string }) {
  const router = useRouter();
  const [hover, setHover] = useState<HoverInfo | null>(null);

  // Genera el campo de puntos de forma determinista (mismo patrón siempre)
  const dots = useMemo(() => {
    const out: { cx: number; cy: number; r: number; score: number; op: number }[] = [];
    let idx = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const rowT = r / (ROWS - 1);
        const risk = Math.pow(rowT, 1.4);
        let j = (Math.sin(idx * 12.9898) * 43758.5) % 1;
        j = j - Math.floor(j);
        const lr = Math.min(1, Math.max(0, risk + (j - 0.5) * 0.14));
        out.push({
          cx: c / (COLS - 1),
          cy: (ROWS - 1 - r) / (ROWS - 1),
          r: 0.3 + 0.7 * lr,
          score: Math.round(lr * 100),
          op: 0.45 + 0.55 * lr,
        });
        idx++;
      }
    }
    return out;
  }, []);

  const W = 880;
  const H = 440;
  const cell = W / COLS;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label="Campo de puntos de empleados por riesgo de rotación"
        style={{ display: "block", overflow: "visible" }}
      >
        {dots.map((d, i) => {
          const cx = d.cx * (W - cell) + cell / 2;
          const cy = d.cy * (H - cell) + cell / 2;
          const rad = cell * 0.16 + cell * 0.34 * d.r;
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={rad}
              fill={riskColor(d.score)}
              opacity={d.op}
              style={{ cursor: "pointer", transition: "r .15s" }}
              onMouseEnter={() =>
                setHover({
                  ref: `#${1000 + d.score * 7}`,
                  score: d.score,
                  band: bandOf(d.score),
                  driver:
                    d.score >= 80
                      ? "Retardos en aceleración"
                      : d.score >= 70
                      ? "Bono no alcanzado"
                      : d.score >= 55
                      ? "Solicitudes de turno"
                      : "Sin señales",
                })
              }
              onMouseLeave={() => setHover(null)}
              onClick={() => router.push(`/empleado/${encodeURIComponent(topRef)}`)}
            />
          );
        })}
      </svg>

      <div className="pointer-events-none absolute left-1 top-2 flex h-[calc(100%-32px)] flex-col justify-between font-mono text-[10px] text-ink-3">
        <span>crítico</span>
        <span>medio</span>
        <span>estable</span>
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
            {bandLabel(hover.band)} · {hover.driver}
          </div>
        </div>
      )}
    </div>
  );
}
