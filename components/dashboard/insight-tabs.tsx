// components/dashboard/insight-tabs.tsx
// Panel "Planning tools": agrupa las tres herramientas prescriptivas del
// dashboard (simulador what-if, mapa de contagio, pronóstico de salidas) en
// tabs, todas operando sobre los trabajadores en riesgo.
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { EmployeePrediction } from "@/types";
import { RetentionSimulator } from "./retention-simulator";
import { ContagionMap } from "./contagion-map";
import { DepartureForecast } from "./departure-forecast";

const TABS = ["simulator", "contagion", "forecast"] as const;
type Tab = (typeof TABS)[number];

export function InsightTabs({
  rows,
  costPerReplacement,
  costEstimated,
}: {
  rows: EmployeePrediction[];
  costPerReplacement: number;
  costEstimated: boolean;
}) {
  const t = useTranslations("dashboard");
  const [tab, setTab] = useState<Tab>("simulator");
  const label: Record<Tab, string> = {
    simulator: t("tabSimulator"),
    contagion: t("tabContagion"),
    forecast: t("tabForecast"),
  };

  return (
    <div>
      <div role="tablist" aria-label={t("insightsTitle")} className="mb-5 inline-flex flex-wrap gap-1 rounded-full bg-surface-bg p-1">
        {TABS.map((tb) => {
          const active = tab === tb;
          return (
            <button
              key={tb}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(tb)}
              className={`rounded-full px-3.5 py-1.5 text-copy transition-colors ${
                active ? "bg-surface font-medium text-ink-1 shadow-sm" : "text-ink-2 hover:text-ink-1"
              }`}
            >
              {label[tb]}
            </button>
          );
        })}
      </div>

      {tab === "simulator" && (
        <RetentionSimulator rows={rows} costPerReplacement={costPerReplacement} costEstimated={costEstimated} />
      )}
      {tab === "contagion" && <ContagionMap rows={rows} />}
      {tab === "forecast" && <DepartureForecast rows={rows} />}
    </div>
  );
}
