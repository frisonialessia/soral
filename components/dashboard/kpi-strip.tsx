// components/dashboard/kpi-strip.tsx
// Banda densa de KPIs (estilo panel de analítica): 6 métricas de planta con
// mini-sparkline donde hay serie semanal. Reemplaza las 3 stat-cards sueltas.
"use client";

import { useFormatter, useLocale, useTranslations } from "next-intl";
import { AlertTriangle, Eye, ShieldCheck, Users, Activity, Banknote } from "lucide-react";
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
  const total = data.highRisk + data.watch + data.stable;
  const atRisk = data.highRisk + data.watch;
  const cur = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
    notation: "compact",
  });

  const items = [
    { icon: AlertTriangle, label: t("statHighRisk"), value: f.number(data.highRisk), series: data.trend.highRisk, color: "#EB4F6C" },
    { icon: Eye, label: t("statWatch"), value: f.number(data.watch), series: data.trend.watch, color: "#B49AED" },
    { icon: ShieldCheck, label: t("statStable"), value: f.number(data.stable), series: data.trend.stable, color: "#5B6EF5" },
    { icon: Users, label: t("kpiHeadcount"), value: f.number(total), series: null, color: "#6B7088" },
    { icon: Activity, label: t("kpiAtRisk"), value: f.number(atRisk), series: null, color: "#8476FF" },
    { icon: Banknote, label: t("simCostAtRisk"), value: cur.format(data.savingMxn), series: null, color: "#EB4F6C" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <div key={it.label} className="rounded-xl border border-line bg-surface px-3.5 py-3">
            <div className="flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5 text-ink-3" />
              <span className="text-[11px] text-ink-2">{it.label}</span>
            </div>
            <div className="mt-1 font-mono text-[20px] font-bold leading-tight" style={{ color: it.color }}>
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
