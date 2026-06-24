// components/landing/planning-tools-demo.tsx
// "Herramientas de planeación" para la demo de la landing: las tres pestañas reales
// del dashboard — Simulador what-if (versión demo interactiva), Mapa de contagio y
// Pronóstico de salidas (componentes reales, con datos de muestra). El clic en el
// pronóstico no navega a refs falsos: va al dashboard.
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { EmployeePrediction } from "@/types";
import { RetentionSimulatorDemo } from "./retention-simulator-demo";
import { ContagionMap } from "@/components/dashboard/contagion-map";
import { DepartureForecast } from "@/components/dashboard/departure-forecast";

const TABS = ["simulator", "contagion", "forecast"] as const;
type Tab = (typeof TABS)[number];

export function PlanningToolsDemo({ employees }: { employees: EmployeePrediction[] }) {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("simulator");
  const label: Record<Tab, string> = {
    simulator: t("tabSimulator"),
    contagion: t("tabContagion"),
    forecast: t("tabForecast"),
  };

  return (
    <div>
      <div role="tablist" aria-label={t("insightsTitle")} className="mb-4 inline-flex flex-wrap gap-1 rounded-full bg-surface-bg p-1">
        {TABS.map((tb) => {
          const active = tab === tb;
          return (
            <button
              key={tb}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(tb)}
              className={`rounded-full px-3 py-1.5 text-meta transition-colors ${
                active ? "bg-surface font-medium text-ink-1 shadow-sm" : "text-ink-2 hover:text-ink-1"
              }`}
            >
              {label[tb]}
            </button>
          );
        })}
      </div>

      {tab === "simulator" && <RetentionSimulatorDemo />}
      {tab !== "simulator" && (
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-[0_24px_64px_-24px_rgba(43,45,66,0.3)]">
          {tab === "contagion" && <ContagionMap rows={employees} />}
          {tab === "forecast" && <DepartureForecast rows={employees} onSelect={() => router.push("/dashboard")} />}
        </div>
      )}
    </div>
  );
}
