// components/dashboard/kpi-strip.tsx
// Banda de KPIs (estilo panel de analítica): 4 métricas de planta con
// mini-sparkline donde hay serie semanal. Plantilla y "En riesgo" se quitaron
// por ser sumas derivables de las otras — diluían el foco.
"use client";

import { useFormatter, useLocale, useTranslations } from "next-intl";
import { AlertTriangle, Eye, ShieldCheck, Banknote } from "lucide-react";
import type { PlantSummary } from "@/types";

function Spark({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return <div className="h-5" />;
  const w = 80;
  const h = 22;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data
    .map((v, i) => `${((i / (data.length - 1)) * w).toFixed(1)},${(h - 2 - ((v - min) / span) * (h - 4)).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-5 w-full" preserveAspectRatio="none" aria-hidden="true">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function KpiStrip({ data }: { data: PlantSummary }) {
  const t = useTranslations("dashboard");
  const f = useFormatter();
  const locale = useLocale();
  // Mismo formateador que el briefing (lib/server/ai-service.ts) — sin "compact",
  // para que el costo se vea idéntico en ambos sitios y no haya "221 mil" vs "220.800".
  const cur = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });

  const items = [
    { icon: AlertTriangle, label: t("statHighRisk"), value: f.number(data.highRisk), series: data.trend.highRisk, color: "#EB4F6C" },
    { icon: Eye, label: t("statWatch"), value: f.number(data.watch), series: data.trend.watch, color: "#B49AED" },
    { icon: ShieldCheck, label: t("statStable"), value: f.number(data.stable), series: data.trend.stable, color: "#5B6EF5" },
    { icon: Banknote, label: t("simCostAtRisk"), value: cur.format(data.savingMxn), series: null, color: "#EB4F6C" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <div key={it.label} className="rounded-xl border border-line bg-surface px-3.5 py-3">
            <div className="flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5 text-ink-3" />
              <span className="text-micro text-ink-2">{it.label}</span>
            </div>
            <div className="mt-1 text-heading font-bold leading-tight" style={{ color: it.color }}>
              {it.value}
            </div>
            <div className="mt-1">
              <Spark data={it.series ?? []} color={it.color} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
