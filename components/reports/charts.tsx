// components/reports/charts.tsx
// Charts del módulo de reportes: área (rotación mensual) + barras horizontales
// (por línea / por causa). SVG puro, sin dependencias.
"use client";

export function AreaChart({
  data,
  labels,
  ariaLabel,
  color = "#5B6EF5",
}: {
  data: number[];
  labels: string[];
  ariaLabel: string;
  color?: string;
}) {
  const W = 900;
  const H = 200;
  const padX = 10;
  const padTop = 14;
  const padBottom = 24;
  const innerH = H - padTop - padBottom;
  const max = Math.max(5, Math.ceil(Math.max(...data) / 5) * 5);
  const x = (i: number) => padX + (i / (data.length - 1)) * (W - padX * 2);
  const y = (v: number) => padTop + innerH - (v / max) * innerH;
  const line = data.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const baseline = (padTop + innerH).toFixed(1);
  const area = `${line} L ${x(data.length - 1).toFixed(1)} ${baseline} L ${x(0).toFixed(1)} ${baseline} Z`;
  const grid = [0, max / 2, max];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      role="img"
      aria-label={ariaLabel}
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="reportArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {grid.map((v) => (
        <g key={v}>
          <line x1={padX} x2={W - padX} y1={y(v).toFixed(1)} y2={y(v).toFixed(1)} stroke="#E8EAF2" strokeWidth={1} />
          <text x={padX} y={(y(v) - 4).toFixed(1)} fontSize="11" fontFamily="monospace" fill="#A9AEC2">
            {v}%
          </text>
        </g>
      ))}
      <path d={area} fill="url(#reportArea)" />
      <path d={line} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" />
      {data.map((v, i) => (
        <circle key={i} cx={x(i).toFixed(1)} cy={y(v).toFixed(1)} r={i === data.length - 1 ? 4.5 : 0} fill={color} />
      ))}
      {labels.map((lb, i) =>
        i % 2 === 0 ? (
          <text key={i} x={x(i).toFixed(1)} y={H - 6} fontSize="11" textAnchor="middle" fill="#A9AEC2">
            {lb}
          </text>
        ) : null
      )}
    </svg>
  );
}

export function BarList({
  items,
}: {
  items: { label: string; value: number; caption?: string; color?: string }[];
}) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="space-y-3.5">
      {items.map((it) => (
        <li key={it.label}>
          <div className="mb-1.5 flex items-center justify-between gap-3 text-copy">
            <span className="min-w-0 truncate text-ink-1">{it.label}</span>
            <span className="shrink-0">
              <span className="font-mono font-semibold text-ink-1">{it.value}%</span>
              {it.caption ? <span className="ml-1.5 text-micro text-ink-3">{it.caption}</span> : null}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded bg-surface-bg">
            <div
              className="h-full rounded"
              style={{ width: `${(it.value / max) * 100}%`, background: it.color ?? "#5B6EF5" }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
