// components/landing/dashboard-preview.tsx
// Simulación del producto para la landing: un "marco de app" con la barra lateral
// y el dashboard real (briefing IA + KPIs + mapa de riesgo + tabla) con datos de
// ejemplo. Es DECORATIVO — pointer-events-none + aria-hidden — para mostrar las
// herramientas sin navegar ni duplicar contenido para lectores de pantalla.
"use client";

import { useTranslations, useLocale } from "next-intl";
import {
  LayoutDashboard, BarChart3, Plug, Settings,
  Sparkles, AlertTriangle, Eye, ShieldCheck, Banknote,
} from "lucide-react";
import { DotField } from "@/components/dashboard/dot-field";
import { bandOf, riskColor } from "@/lib/risk";
import type { EmployeePrediction } from "@/types";
import { BrandMark } from "@/components/brand-mark";

function emp(ref: string, score: number, line: string): EmployeePrediction {
  return {
    ref, score, band: bandOf(score), driver: "", line,
    shift: "", tenure: 0, evidence: "", drivers: [], radar: [], trend: [], reco: "",
  };
}

const PREVIEW_TOTAL = 1240;
const REPLACEMENT_COST_MXN = 36_800;
const PREVIEW_HIGH_RISK = 38;

const PREVIEW_EMPLOYEES: EmployeePrediction[] = [
  emp("#A3F9-4471", 96, "L3"), emp("#B7C2-1180", 92, "L7"), emp("#C1D8-3320", 89, "L2"),
  emp("#D4E1-5567", 86, "L5"), emp("#E2A0-7781", 84, "L3"), emp("#F3B1-2290", 82, "L1"),
  emp("#A8C4-6612", 80, "L7"), emp("#B0D5-9943", 78, "L4"), emp("#C9E6-3375", 76, "L2"),
  emp("#D1F7-8806", 74, "L6"), emp("#E5A8-1129", 72, "L3"), emp("#F6B9-4452", 71, "L5"),
  emp("#A1C0-7763", 70, "L1"), emp("#B3D1-2284", 68, "L7"), emp("#C5E2-5590", 66, "L4"),
  emp("#D7F3-8817", 64, "L2"),
];

const NAV = [
  { icon: LayoutDashboard, key: "dashboard", active: true },
  { icon: BarChart3, key: "reports", active: false },
  { icon: Plug, key: "integrations", active: false },
  { icon: Settings, key: "admin", active: false },
] as const;

export function DashboardPreview() {
  const t = useTranslations("landing");
  const td = useTranslations("dashboard");
  const tt = useTranslations("table");
  const tn = useTranslations("nav");
  const locale = useLocale();

  const cur = new Intl.NumberFormat(locale, {
    style: "currency", currency: "MXN", maximumFractionDigits: 1, notation: "compact",
  });
  const kpis = [
    { icon: AlertTriangle, label: td("statHighRisk"), value: String(PREVIEW_HIGH_RISK), color: "#EB4F6C" },
    { icon: Eye, label: td("statWatch"), value: "211", color: "#B49AED" },
    { icon: ShieldCheck, label: td("statStable"), value: "991", color: "#5B6EF5" },
    { icon: Banknote, label: td("simCostAtRisk"), value: cur.format(PREVIEW_HIGH_RISK * REPLACEMENT_COST_MXN), color: "#EB4F6C" },
  ];

  const rows = [
    { ref: "#A3F9-4471", score: 96, driver: t("previewDriver1"), line: "L3" },
    { ref: "#B7C2-1180", score: 92, driver: t("previewDriver2"), line: "L7" },
    { ref: "#C1D8-3320", score: 89, driver: t("previewDriver3"), line: "L2" },
    { ref: "#D4E1-5567", score: 86, driver: t("previewDriver4"), line: "L5" },
  ];

  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_30px_80px_-20px_rgba(43,45,66,0.35)]"
    >
      {/* Barra de título estilo ventana — semáforo macOS auténtico */}
      <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
        <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
        <span className="h-3 w-3 rounded-full bg-[#28C840]" />
        <span className="mx-auto rounded-md bg-surface px-3 py-1 text-micro text-ink-3">
          {t("windowTitle")}
        </span>
      </div>

      <div className="flex">
        {/* Barra lateral */}
        <aside className="hidden w-44 shrink-0 flex-col gap-0.5 border-r border-line p-3 sm:flex">
          <div className="flex items-center gap-2 px-2 pb-3 text-body font-semibold">
            <BrandMark size={20} className="shrink-0" />
            Soral
          </div>
          {NAV.map((n) => {
            const Icon = n.icon;
            return (
              <div
                key={n.key}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-copy font-medium ${
                  n.active ? "bg-risk-sol-soft text-risk-sol" : "text-ink-1"
                }`}
              >
                <Icon className={`h-4 w-4 ${n.active ? "text-risk-sol" : "text-ink-3"}`} />
                {tn(n.key)}
              </div>
            );
          })}
          <div className="mt-3 flex items-center gap-2 border-t border-line px-2.5 pt-3 text-micro text-ink-2">
            <span className="h-1.5 w-1.5 rounded-full bg-risk-sol" />
            {tn("modelStatus")}
          </div>
        </aside>

        {/* Contenido */}
        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <h3 className="text-subhead font-semibold tracking-tight">{td("title")}</h3>
          <p className="mt-0.5 line-clamp-1 text-meta text-ink-2">
            {td("subtitle", { count: PREVIEW_TOTAL })}
          </p>

          {/* Briefing semanal con IA */}
          <div className="mt-3 rounded-xl border border-line bg-gradient-to-br from-risk-sol-soft/70 via-surface to-surface p-3.5">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-risk-sol text-white">
                <Sparkles className="h-3 w-3" />
              </span>
              <span className="text-meta font-semibold text-ink-1">{td("aiBriefingTitle")}</span>
              <span className="rounded-full border border-line-2 bg-surface px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-ink-3">
                {td("aiBriefingSample")}
              </span>
            </div>
            <p className="mt-1.5 line-clamp-2 text-meta leading-relaxed text-ink-2">{t("previewBriefing")}</p>
          </div>

          {/* KPIs */}
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {kpis.map((k) => {
              const Icon = k.icon;
              return (
                <div key={k.label} className="rounded-xl border border-line px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-3 w-3 text-ink-3" />
                    <span className="truncate text-micro text-ink-2">{k.label}</span>
                  </div>
                  <div className="mt-0.5 text-subhead font-bold leading-tight" style={{ color: k.color }}>
                    {k.value}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mapa de riesgo */}
          <div className="mt-3 rounded-xl border border-line p-3.5">
            <div className="mb-2 text-copy font-semibold">{td("mapTitle")}</div>
            <div className="pointer-events-none">
              <DotField employees={PREVIEW_EMPLOYEES} total={PREVIEW_TOTAL} />
            </div>
          </div>

          {/* Mini tabla top en riesgo */}
          <div className="mt-3 overflow-hidden rounded-xl border border-line">
            <div className="grid grid-cols-[1fr_auto] gap-2 border-b border-line bg-surface-2 px-4 py-2 text-micro font-semibold uppercase tracking-wide text-ink-3">
              <span>{tt("driver")}</span>
              <span>{tt("score")}</span>
            </div>
            {rows.map((r) => {
              const c = riskColor(r.score);
              return (
                <div key={r.ref} className="grid grid-cols-[1fr_auto] items-center gap-2 border-b border-line px-4 py-2.5 last:border-b-0">
                  <div className="min-w-0">
                    <span className="font-mono text-meta text-ink-1">{r.ref}</span>
                    <span className="ml-2 truncate text-meta text-ink-2">· {r.driver}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden font-mono text-micro text-ink-3 sm:inline">{r.line}</span>
                    <span className="min-w-[34px] text-right font-mono text-copy font-bold" style={{ color: c }}>
                      {r.score}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
