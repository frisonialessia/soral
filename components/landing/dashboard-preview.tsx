// components/landing/dashboard-preview.tsx
// Simulación del producto para la landing: un "marco de app" con la barra lateral
// y el dashboard real (mapa de riesgo + stats + tabla) usando datos de ejemplo.
// Es DECORATIVO — pointer-events-none + aria-hidden — para mostrar las herramientas
// sin navegar ni duplicar contenido para lectores de pantalla.
"use client";

import { useTranslations } from "next-intl";
import { LayoutDashboard, BarChart3, Plug, Settings } from "lucide-react";
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
const PREVIEW_EMPLOYEES: EmployeePrediction[] = [
  emp("#A3F9-4471", 96, "L3"), emp("#B7C2-1180", 92, "L7"), emp("#C1D8-3320", 89, "L2"),
  emp("#D4E1-5567", 86, "L5"), emp("#E2A0-7781", 84, "L3"), emp("#F3B1-2290", 82, "L1"),
  emp("#A8C4-6612", 80, "L7"), emp("#B0D5-9943", 78, "L4"), emp("#C9E6-3375", 76, "L2"),
  emp("#D1F7-8806", 74, "L6"), emp("#E5A8-1129", 72, "L3"), emp("#F6B9-4452", 71, "L5"),
  emp("#A1C0-7763", 70, "L1"), emp("#B3D1-2284", 68, "L7"), emp("#C5E2-5590", 66, "L4"),
  emp("#D7F3-8817", 64, "L2"),
];

const STATS = [
  { key: "statHighRisk", value: 38, color: "#EB4F6C" },
  { key: "statWatch", value: 211, color: "#B49AED" },
  { key: "statStable", value: "991", color: "#5B6EF5" },
] as const;

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
      {/* Barra de título estilo ventana */}
      <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#EB4F6C]/70" />
        <span className="h-3 w-3 rounded-full bg-[#E5C07B]/80" />
        <span className="h-3 w-3 rounded-full bg-[#5B6EF5]/60" />
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
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-copy ${
                  n.active ? "bg-surface-2 font-medium text-ink-1" : "text-ink-2"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tn(n.key)}
              </div>
            );
          })}
        </aside>

        {/* Contenido */}
        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <h3 className="text-subhead font-semibold tracking-tight">{td("title")}</h3>
          <p className="mt-0.5 line-clamp-1 text-meta text-ink-2">
            {td("subtitle", { count: PREVIEW_TOTAL })}
          </p>

          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-stretch">
            <div className="min-w-0 flex-1 rounded-xl border border-line p-3.5">
              <div className="mb-2 text-copy font-semibold">{td("mapTitle")}</div>
              <div className="pointer-events-none">
                <DotField employees={PREVIEW_EMPLOYEES} total={PREVIEW_TOTAL} />
              </div>
            </div>
            <div className="flex gap-3 lg:w-[150px] lg:flex-col">
              {STATS.map((s) => (
                <div key={s.key} className="flex-1 rounded-xl border border-line px-3.5 py-2.5">
                  <div className="text-micro text-ink-2">{td(s.key)}</div>
                  <div className="mt-0.5 font-mono text-heading font-semibold leading-tight" style={{ color: s.color }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mini tabla top en riesgo */}
          <div className="mt-4 overflow-hidden rounded-xl border border-line">
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
