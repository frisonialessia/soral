// app/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePlantSummary } from "@/lib/queries";
import { DotField } from "@/components/dashboard/dot-field";
import { RiskTable } from "@/components/risk-table";
import { Card } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/ui/states";

export default function HomePage() {
  const { data, isLoading, isError, refetch, isFetching } = usePlantSummary();
  // Ventana de análisis (control de UI). TODO: filtrar por histórico con Supabase.
  const [range, setRange] = useState<"3M" | "1A" | "Todo">("3M");

  if (isLoading) return <LoadingState label="Cargando estado de la planta…" />;
  if (isError || !data) {
    return (
      <ErrorState
        title="No pudimos cargar el estado de la planta"
        detail="Revisa tu conexión e inténtalo de nuevo."
        onRetry={() => refetch()}
        retrying={isFetching}
      />
    );
  }

  const total = data.highRisk + data.watch + data.stable;

  return (
    <div className="animate-fade pb-12">
      <div className="flex flex-wrap items-end justify-between gap-3.5 py-5">
        <div>
          <h1 className="text-[27px] font-semibold tracking-tight">Fuerza laboral</h1>
          <p className="mt-1 text-sm text-ink-2">
            {total.toLocaleString("es-MX")} empleados · cada punto es una persona ·
            ordenados por riesgo de rotación a 30 días
          </p>
        </div>
        <div
          role="group"
          aria-label="Ventana de análisis"
          className="flex gap-1 rounded-full bg-surface-bg p-1"
        >
          {(["3M", "1A", "Todo"] as const).map((s) => {
            const active = range === s;
            return (
              <button
                key={s}
                type="button"
                aria-pressed={active}
                onClick={() => setRange(s)}
                className={`rounded-full px-4 py-1.5 text-[12.5px] transition-colors ${
                  active
                    ? "bg-surface font-medium text-ink-1 shadow-sm"
                    : "text-ink-2 hover:text-ink-1"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4 flex items-stretch gap-4">
        <Card className="min-w-0 flex-1 rounded-xl p-[22px]">
          <div className="mb-4">
            <h2 className="text-[17px] font-semibold">Mapa de riesgo</h2>
            <p className="mt-0.5 text-[12.5px] text-ink-2">
              Cada punto es un empleado. Los de mayor riesgo (arriba) resaltan en cálido;
              pasa el cursor o haz clic para abrir su ficha.
            </p>
          </div>
          <DotField employees={data.topRisk} total={total} />
        </Card>

        <div className="flex w-[200px] flex-shrink-0 flex-col gap-3">
          <StatCard label="Alto riesgo" value={data.highRisk} delta="score ≥ 80 · acción esta semana" color="#EB4F6C" />
          <StatCard label="En vigilancia" value={data.watch} delta="score 55–79 · seguimiento" color="#B49AED" />
          <StatCard
            label="Estable"
            value={data.stable.toLocaleString("es-MX")}
            delta={`${Math.round((data.stable / total) * 100)}% de la planta`}
            color="#5B6EF5"
          />
        </div>
      </div>

      <div className="mt-8 mb-3 flex items-center justify-between">
        <h2 className="text-[17px] font-semibold">Top 10 empleados en riesgo</h2>
        <span className="text-[12.5px] text-ink-3">Clic en el ID para ver su tendencia</span>
      </div>
      <RiskTable rows={data.topRisk} showLine />
    </div>
  );
}

function StatCard({
  label,
  value,
  delta,
  color,
}: {
  label: string;
  value: number | string;
  delta: string;
  color: string;
}) {
  return (
    <Card className="px-[17px] py-[15px]">
      <div className="text-[11.5px] text-ink-2">{label}</div>
      <div className="mt-0.5 font-mono text-[25px] font-semibold leading-tight" style={{ color }}>
        {value}
      </div>
      <div className="mt-0.5 text-[11px] text-ink-3">{delta}</div>
    </Card>
  );
}
