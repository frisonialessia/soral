// app/page.tsx
"use client";

import { useState } from "react";
import { useTranslations, useFormatter } from "next-intl";
import { usePlantSummary } from "@/lib/queries";
import { DotField } from "@/components/dashboard/dot-field";
import { ActionQueue } from "@/components/dashboard/action-queue";
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

      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-stretch">
        <Card className="min-w-0 flex-1 rounded-xl p-[22px]">
          <div className="mb-4">
            <h2 className="text-[17px] font-semibold">{t("mapTitle")}</h2>
            <p className="mt-0.5 text-[12.5px] text-ink-2">{t("mapSubtitle")}</p>
          </div>
          <DotField employees={data.topRisk} total={total} />
        </Card>

        <div className="flex w-full flex-col gap-3 md:w-[200px] md:flex-shrink-0">
          <StatCard label={t("statHighRisk")} value={data.highRisk} hint={t("statHighRiskDelta")} series={data.trend.highRisk} color="#EB4F6C" />
          <StatCard label={t("statWatch")} value={data.watch} hint={t("statWatchDelta")} series={data.trend.watch} color="#B49AED" />
          <StatCard
            label={t("statStable")}
            value={format.number(data.stable)}
            hint={t("statStableDelta", { pct: Math.round((data.stable / total) * 100) })}
            series={data.trend.stable}
            color="#5B6EF5"
          />
        </div>
      </div>

      <div className="mt-8 mb-3 flex items-center justify-between">
        <h2 className="text-[17px] font-semibold">{t("actTitle")}</h2>
        <span className="text-[12.5px] text-ink-3">{t("actHint")}</span>
      </div>
      <ActionQueue rows={data.topRisk} />
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  series,
  color,
}: {
  label: string;
  value: number | string;
  hint: string;
  series: number[];
  color: string;
}) {
  const td = useTranslations("dashboard");
  const last = series.length ? series[series.length - 1] : 0;
  const prev = series.length > 1 ? series[series.length - 2] : last;
  const d = last - prev;
  const arrow = d > 0 ? "▲" : d < 0 ? "▼" : "→";
  return (
    <Card className="px-[17px] py-[15px]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11.5px] text-ink-2">{label}</span>
        <span className="font-mono text-[11px] text-ink-3" title={td("vsWeek")}>
          {arrow} {Math.abs(d)}
        </span>
      </div>
      <div className="mt-0.5 font-mono text-[25px] font-semibold leading-tight" style={{ color }}>
        {value}
      </div>
      <Sparkline data={series} color={color} />
      <div className="mt-1 text-[11px] text-ink-3">{hint}</div>
    </Card>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return <div className="mt-2 h-7" />;
  const w = 100;
  const h = 28;
  const pad = 3;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const px = (i: number) => (i / (data.length - 1)) * w;
  const py = (v: number) => h - pad - ((v - min) / span) * (h - pad * 2);
  const line = data.map((v, i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="mt-2 block h-7 w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polygon points={`0,${h} ${line} ${w},${h}`} fill={color} opacity="0.1" />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
