// components/employee/charts.tsx
"use client";

import { useTranslations } from "next-intl";
import type { RadarAxis } from "@/types";

export function RiskRadar({ axes, color }: { axes: RadarAxis[]; color: string }) {
  const t = useTranslations("employee");
  const R = 82;
  const cx = 125;
  const cy = 120;
  const n = axes.length;

  const rings = [0.25, 0.5, 0.75, 1].map((g) =>
    axes
      .map((_, i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        return `${(cx + Math.cos(a) * R * g).toFixed(1)},${(cy + Math.sin(a) * R * g).toFixed(1)}`;
      })
      .join(" ")
  );

  const dataPoly = axes
    .map((ax, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      return `${(cx + Math.cos(a) * R * ax[1]).toFixed(1)},${(cy + Math.sin(a) * R * ax[1]).toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 250 240" width="220" role="img" aria-label={t("radarAria")}>
      {rings.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="#E8EAF2" strokeWidth={1} />
      ))}
      {axes.map((ax, i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        const lx = cx + Math.cos(a) * (R + 16);
        const ly = cy + Math.sin(a) * (R + 12);
        const anchor =
          Math.abs(Math.cos(a)) < 0.3 ? "middle" : Math.cos(a) > 0 ? "start" : "end";
        return (
          <g key={i}>
            <line
              x1={cx}
              y1={cy}
              x2={(cx + Math.cos(a) * R).toFixed(1)}
              y2={(cy + Math.sin(a) * R).toFixed(1)}
              stroke="#E8EAF2"
              strokeWidth={1}
            />
            <text x={lx.toFixed(1)} y={ly.toFixed(1)} textAnchor={anchor} fontSize="8.5" fill="#6B7088">
              {ax[0]}
            </text>
          </g>
        );
      })}
      <polygon points={dataPoly} fill={color} fillOpacity={0.16} stroke={color} strokeWidth={2} />
      {axes.map((ax, i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        return (
          <circle
            key={i}
            cx={(cx + Math.cos(a) * R * ax[1]).toFixed(1)}
            cy={(cy + Math.sin(a) * R * ax[1]).toFixed(1)}
            r={2.5}
            fill={color}
          />
        );
      })}
    </svg>
  );
}

export function TrendChart({ data, color }: { data: number[]; color: string }) {
  const W = 940;
  const H = 180;
  const pad = 10;
  const max = 100;
  const min = 20;
  const step = W / (data.length - 1);
  const pts = data.map((v, i) => [i * step, H - pad - ((v - min) / (max - min)) * (H - pad * 2)]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L ${W} ${H} L 0 ${H} Z`;
  const grid = [20, 40, 60, 80, 100];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: 180, overflow: "visible" }}>
      <defs>
        <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.16} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {grid.map((v) => {
        const y = H - pad - ((v - min) / (max - min)) * (H - pad * 2);
        return (
          <g key={v}>
            <line x1={0} y1={y.toFixed(1)} x2={W} y2={y.toFixed(1)} stroke="#E8EAF2" strokeWidth={1} />
            <text x={0} y={(y - 4).toFixed(1)} fill="#A9AEC2" fontSize="11" fontFamily="monospace">
              {v}%
            </text>
          </g>
        );
      })}
      <path d={area} fill="url(#tg)" />
      <path d={line} fill="none" stroke={color} strokeWidth={2.5} />
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p[0].toFixed(1)}
          cy={p[1].toFixed(1)}
          r={i === pts.length - 1 ? 5 : 3}
          fill={i === pts.length - 1 ? color : "#B4B2A9"}
        />
      ))}
    </svg>
  );
}
