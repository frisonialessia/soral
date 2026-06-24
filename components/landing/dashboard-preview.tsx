// components/landing/dashboard-preview.tsx
// Simulación INTERACTIVA del producto para la landing: marco de app con la barra
// lateral agrupada real + el dashboard (briefing IA + KPIs + mapa de riesgo + tabla)
// con datos de ejemplo. El mapa es el DotField real: al pasar el cursor muestra la
// ficha del trabajador; al hacer clic lleva al dashboard real (sus refs son demo).
"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, ListChecks, SlidersHorizontal, HardHat, ClipboardCheck, UserPlus,
  BarChart3, FlaskConical, MessageSquareText, ShieldCheck, Scale, Plug, Settings,
  Sparkles, AlertTriangle, Eye, Banknote,
} from "lucide-react";
import { DotField } from "@/components/dashboard/dot-field";
import { bandOf, riskColor } from "@/lib/risk";
import type { EmployeePrediction } from "@/types";
import { BrandMark } from "@/components/brand-mark";

function emp(ref: string, score: number, line: string, driver: string): EmployeePrediction {
  return {
    ref, score, band: bandOf(score), driver, line,
    shift: "", tenure: 0, evidence: "", drivers: [], radar: [], trend: [], reco: "",
  };
}

const PREVIEW_TOTAL = 1240;
const REPLACEMENT_COST_MXN = 36_800;
const PREVIEW_HIGH_RISK = 38;

const PREVIEW_BASE: { ref: string; score: number; line: string }[] = [
  { ref: "#A3F9-4471", score: 96, line: "L3" }, { ref: "#B7C2-1180", score: 92, line: "L7" },
  { ref: "#C1D8-3320", score: 89, line: "L2" }, { ref: "#D4E1-5567", score: 86, line: "L5" },
  { ref: "#E2A0-7781", score: 84, line: "L3" }, { ref: "#F3B1-2290", score: 82, line: "L1" },
  { ref: "#A8C4-6612", score: 80, line: "L7" }, { ref: "#B0D5-9943", score: 78, line: "L4" },
  { ref: "#C9E6-3375", score: 76, line: "L2" }, { ref: "#D1F7-8806", score: 74, line: "L6" },
  { ref: "#E5A8-1129", score: 72, line: "L3" }, { ref: "#F6B9-4452", score: 71, line: "L5" },
  { ref: "#A1C0-7763", score: 70, line: "L1" }, { ref: "#B3D1-2284", score: 68, line: "L7" },
  { ref: "#C5E2-5590", score: 66, line: "L4" }, { ref: "#D7F3-8817", score: 64, line: "L2" },
];

// Barra lateral agrupada — espejo de la IA real de la app.
interface PreviewNavItem { icon: typeof LayoutDashboard; key: string; active?: boolean }
interface PreviewNavGroup { titleKey?: string; items: PreviewNavItem[] }
const NAV_GROUPS: PreviewNavGroup[] = [
  { items: [{ icon: LayoutDashboard, key: "dashboard", active: true }] },
  { titleKey: "groupPlanning", items: [{ icon: ListChecks, key: "actionPlan" }, { icon: SlidersHorizontal, key: "simulator" }] },
  { titleKey: "groupOperations", items: [{ icon: HardHat, key: "floor" }, { icon: ClipboardCheck, key: "interventions" }, { icon: UserPlus, key: "hiring" }] },
  { titleKey: "groupIntelligence", items: [{ icon: BarChart3, key: "reports" }, { icon: FlaskConical, key: "evidence" }, { icon: MessageSquareText, key: "voice" }, { icon: ShieldCheck, key: "model" }, { icon: Scale, key: "governance" }] },
  { titleKey: "groupSystem", items: [{ icon: Plug, key: "integrations" }, { icon: Settings, key: "admin" }] },
];

export function DashboardPreview() {
  const t = useTranslations("landing");
  const td = useTranslations("dashboard");
  const tt = useTranslations("table");
  const tn = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();

  const driverPool = [t("previewDriver1"), t("previewDriver2"), t("previewDriver3"), t("previewDriver4")];
  const employees: EmployeePrediction[] = PREVIEW_BASE.map((e, i) =>
    emp(e.ref, e.score, e.line, driverPool[i % driverPool.length])
  );

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
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_30px_80px_-20px_rgba(43,45,66,0.35)]">
      {/* Barra de título estilo ventana — semáforo macOS auténtico */}
      <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
        <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
        <span className="h-3 w-3 rounded-full bg-[#28C840]" />
        <span className="mx-auto rounded-md bg-surface px-3 py-1 text-micro text-ink-3">{t("windowTitle")}</span>
      </div>

      <div className="flex">
        {/* Barra lateral agrupada */}
        <aside className="hidden w-48 shrink-0 flex-col border-r border-line p-3 sm:flex">
          <div className="flex items-center gap-2 px-2 pb-3 text-body font-semibold">
            <BrandMark size={20} className="shrink-0" />
            Soral
          </div>
          <div className="flex flex-1 flex-col gap-2">
            {NAV_GROUPS.map((g, gi) => (
              <div key={g.titleKey ?? `g${gi}`} className="flex flex-col gap-0.5">
                {g.titleKey && (
                  <div className="px-2.5 pb-0.5 pt-1 text-[9px] font-semibold uppercase tracking-wider text-ink-3">
                    {tn(g.titleKey)}
                  </div>
                )}
                {g.items.map((it) => {
                  const Icon = it.icon;
                  const active = it.active;
                  return (
                    <div
                      key={it.key}
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1 text-meta font-medium ${
                        active ? "bg-risk-sol-soft text-risk-sol" : "text-ink-1"
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? "text-risk-sol" : "text-ink-3"}`} />
                      <span className="truncate">{tn(it.key)}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2 border-t border-line px-2.5 pt-3 text-micro text-ink-2">
            <span className="h-1.5 w-1.5 rounded-full bg-risk-sol" />
            {tn("modelStatus")}
          </div>
        </aside>

        {/* Contenido */}
        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <h3 className="text-subhead font-semibold tracking-tight">{td("title")}</h3>
          <p className="mt-0.5 line-clamp-1 text-meta text-ink-2">{td("subtitle", { count: PREVIEW_TOTAL })}</p>

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

          {/* Mapa de riesgo — interactivo (hover = ficha, clic = dashboard real) */}
          <div className="mt-3 rounded-xl border border-line p-3.5">
            <div className="mb-2 text-copy font-semibold">{td("mapTitle")}</div>
            <DotField employees={employees} total={PREVIEW_TOTAL} onSelect={() => router.push("/dashboard")} />
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
