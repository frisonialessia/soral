// app/(app)/dashboard/page.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePlantSummary } from "@/lib/queries";
import { DotField } from "@/components/dashboard/dot-field";
import { AiBriefing } from "@/components/dashboard/ai-briefing";
import { KpiStrip } from "@/components/dashboard/kpi-strip";
import { Gauge } from "@/components/dashboard/gauge";
import { ActionQueue } from "@/components/dashboard/action-queue";
import { InsightTabs } from "@/components/dashboard/insight-tabs";
import { Card } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/ui/states";

type Range = "3M" | "1A" | "Todo";

export default function DashboardPage() {
  const { data, isLoading, isError, refetch, isFetching } = usePlantSummary();
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
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
  const stability = Math.round((data.stable / total) * 100);
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
        <div role="group" aria-label={t("rangeGroup")} className="flex gap-1 rounded-full bg-surface-bg p-1">
          {(["3M", "1A", "Todo"] as const).map((s) => {
            const active = range === s;
            return (
              <button
                key={s}
                type="button"
                aria-pressed={active}
                onClick={() => setRange(s)}
                className={`rounded-full px-4 py-1.5 text-[12.5px] transition-colors ${
                  active ? "bg-surface font-medium text-ink-1 shadow-sm" : "text-ink-2 hover:text-ink-1"
                }`}
              >
                {rangeLabel[s]}
              </button>
            );
          })}
        </div>
      </div>

      <AiBriefing />

      <div className="mt-4">
        <KpiStrip data={data} />
      </div>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <Card className="min-w-0 flex-1 rounded-xl p-[22px]">
          <div className="mb-4">
            <h2 className="text-[17px] font-semibold">{t("mapTitle")}</h2>
            <p className="mt-0.5 text-[12.5px] text-ink-2">{t("mapSubtitle")}</p>
          </div>
          <DotField employees={data.topRisk} total={total} />
        </Card>

        <Card className="flex w-full flex-col items-center justify-center rounded-xl p-[22px] lg:w-[240px] lg:shrink-0">
          <Gauge value={stability} label={t("gaugeStability")} color="#5B6EF5" />
          <div className="mt-1 text-center text-[11.5px] text-ink-3">
            {t("gaugeStabilitySub", { stable: data.stable, total })}
          </div>
        </Card>
      </div>

      <div className="mt-8 mb-3 flex items-center justify-between">
        <h2 className="text-[17px] font-semibold">{t("actTitle")}</h2>
        <span className="text-[12.5px] text-ink-3">{t("actHint")}</span>
      </div>
      <ActionQueue rows={data.topRisk} />

      <div className="mt-8 mb-3">
        <h2 className="text-[17px] font-semibold">{t("insightsTitle")}</h2>
        <p className="mt-0.5 text-[12.5px] text-ink-2">{t("insightsSubtitle")}</p>
      </div>
      <Card className="rounded-xl p-[22px]">
        <InsightTabs rows={data.topRisk} />
      </Card>
    </div>
  );
}
