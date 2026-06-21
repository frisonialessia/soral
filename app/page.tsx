// app/page.tsx
"use client";

import { useState } from "react";
import { useTranslations, useFormatter } from "next-intl";
import { usePlantSummary } from "@/lib/queries";
import { DotField } from "@/components/dashboard/dot-field";
import { RiskTable } from "@/components/risk-table";
import { Card } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/ui/states";

type Range = "3M" | "1A" | "Todo";

export default function HomePage() {
  const { data, isLoading, isError, refetch, isFetching } = usePlantSummary();
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const format = useFormatter();
  // Ventana de análisis (control de UI). TODO: filtrar por histórico con Supabase.
  const [range, setRange] = useState<Range>("3M");

  if (isLoading) return <LoadingState label={t("loading")} />;
  if (isError || !data) {
    return (
      <ErrorState
        title={t("errorTitle")}
        detail={tc("checkConnection")}
        onRetry={() => refetch()}
        retrying={isFetching}
      />
    );
  }

  const total = data.highRisk + data.watch + data.stable;
  const rangeLabel: Record<Range, string> = {
    "3M": t("range3m"),
    "1A": t("range1y"),
    Todo: t("rangeAll"),
  };

  return (
    <div className="animate-fade pb-12">
      <div className="flex flex-wrap items-end justify-between gap-3.5 py-5">
        <div>
          <h1 className="text-[27px] font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-sm text-ink-2">{t("subtitle", { count: total })}</p>
        </div>
        <div
          role="group"
          aria-label={t("rangeGroup")}
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
                {rangeLabel[s]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4 flex items-stretch gap-4">
        <Card className="min-w-0 flex-1 rounded-xl p-[22px]">
          <div className="mb-4">
            <h2 className="text-[17px] font-semibold">{t("mapTitle")}</h2>
            <p className="mt-0.5 text-[12.5px] text-ink-2">{t("mapSubtitle")}</p>
          </div>
          <DotField employees={data.topRisk} total={total} />
        </Card>

        <div className="flex w-[200px] flex-shrink-0 flex-col gap-3">
          <StatCard label={t("statHighRisk")} value={data.highRisk} delta={t("statHighRiskDelta")} color="#EB4F6C" />
          <StatCard label={t("statWatch")} value={data.watch} delta={t("statWatchDelta")} color="#B49AED" />
          <StatCard
            label={t("statStable")}
            value={format.number(data.stable)}
            delta={t("statStableDelta", { pct: Math.round((data.stable / total) * 100) })}
            color="#5B6EF5"
          />
        </div>
      </div>

      <div className="mt-8 mb-3 flex items-center justify-between">
        <h2 className="text-[17px] font-semibold">{t("topTitle")}</h2>
        <span className="text-[12.5px] text-ink-3">{t("topHint")}</span>
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
