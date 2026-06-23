// app/(app)/dashboard/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Download, ListChecks, SlidersHorizontal, ChevronRight } from "lucide-react";
import { usePlantSummary } from "@/lib/queries";
import { DotField } from "@/components/dashboard/dot-field";
import { AiBriefing } from "@/components/dashboard/ai-briefing";
import { KpiStrip } from "@/components/dashboard/kpi-strip";
import { Gauge } from "@/components/dashboard/gauge";
import { RiskHeatmap } from "@/components/dashboard/risk-heatmap";
import { Leaderboard } from "@/components/dashboard/leaderboard";
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

  function exportCsv() {
    if (!data) return;
    const rows: string[][] = [
      ["ref", "score", "band", "line", "shift", "driver"],
      ...data.topRisk.map((e) => [e.ref, String(e.score), e.band, e.line, e.shift, e.driver]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "soral-workforce.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="animate-fade pb-12">
      <div className="flex flex-wrap items-end justify-between gap-3.5 py-5">
        <div>
          <h1 className="text-title font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-body text-ink-2">{t("subtitle", { count: total })}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line-2 bg-surface px-3 py-2 text-copy font-medium text-ink-1 transition-colors hover:border-risk-sol hover:text-risk-sol"
          >
            <Download className="h-4 w-4" />
            {t("export")}
          </button>
          <div role="group" aria-label={t("rangeGroup")} className="flex gap-1 rounded-full bg-surface-bg p-1">
            {(["3M", "1A", "Todo"] as const).map((s) => {
              const active = range === s;
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setRange(s)}
                  className={`rounded-full px-4 py-1.5 text-copy transition-colors ${
                    active ? "bg-surface font-medium text-ink-1 shadow-sm" : "text-ink-2 hover:text-ink-1"
                  }`}
                >
                  {rangeLabel[s]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <AiBriefing />

      <div className="mt-4">
        <KpiStrip data={data} />
      </div>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <Card className="min-w-0 flex-1 rounded-xl p-[22px]">
          <div className="mb-4">
            <h2 className="text-subhead font-semibold">{t("mapTitle")}</h2>
            <p className="mt-0.5 text-copy text-ink-2">{t("mapSubtitle")}</p>
          </div>
          <DotField employees={data.topRisk} total={total} />
        </Card>

        <Card className="flex w-full flex-col rounded-xl p-[22px] lg:w-[248px] lg:shrink-0">
          <div className="flex flex-1 flex-col items-center justify-center">
            <Gauge value={stability} label={t("gaugeStability")} color="#5B6EF5" />
            <div className="mt-1 text-center text-meta text-ink-3">
              {t("gaugeStabilitySub", { stable: data.stable, total })}
            </div>
          </div>
          <div className="mt-5 space-y-2.5 border-t border-line pt-4">
            {[
              { label: t("statHighRisk"), value: data.highRisk, color: "#EB4F6C" },
              { label: t("statWatch"), value: data.watch, color: "#B49AED" },
              { label: t("statStable"), value: data.stable, color: "#5B6EF5" },
            ].map((b) => (
              <div key={b.label} className="flex items-center justify-between text-copy">
                <span className="flex items-center gap-2 text-ink-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: b.color }} />
                  {b.label}
                </span>
                <span className="font-medium text-ink-1">{b.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card className="rounded-xl p-[22px]">
          <div className="mb-4">
            <h2 className="text-subhead font-semibold">{t("heatTitle")}</h2>
            <p className="mt-0.5 text-copy text-ink-2">{t("heatSub")}</p>
          </div>
          <RiskHeatmap rows={data.topRisk} />
        </Card>
        <Card className="rounded-xl p-[22px]">
          <div className="mb-4">
            <h2 className="text-subhead font-semibold">{t("lbTitle")}</h2>
            <p className="mt-0.5 text-copy text-ink-2">{t("lbSub")}</p>
          </div>
          <Leaderboard rows={data.topRisk} />
        </Card>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[
          { href: "/plan-de-accion", icon: ListChecks, title: t("actTitle"), sub: t("actHint") },
          { href: "/simulador", icon: SlidersHorizontal, title: t("insightsTitle"), sub: t("insightsSubtitle") },
        ].map(({ href, icon: Icon, title, sub }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 rounded-xl border border-line bg-surface p-[18px] transition-colors hover:border-risk-sol"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-risk-sol-soft text-risk-sol">
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-body font-semibold text-ink-1">{title}</span>
              <span className="block truncate text-meta text-ink-3">{sub}</span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5 group-hover:text-risk-sol" />
          </Link>
        ))}
      </div>
    </div>
  );
}
