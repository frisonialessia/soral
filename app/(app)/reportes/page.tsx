// app/(app)/reportes/page.tsx
"use client";

import { useTranslations, useFormatter, useLocale } from "next-intl";
import { Download } from "lucide-react";
import { useReportSummary } from "@/lib/queries";
import { Card } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/ui/states";
import { AreaChart, BarList } from "@/components/reports/charts";

export default function ReportsPage() {
  const { data, isLoading, isError, refetch, isFetching } = useReportSummary();
  const t = useTranslations("reports");
  const tc = useTranslations("common");
  const format = useFormatter();
  const locale = useLocale();

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

  // Etiquetas de los últimos N meses, terminando en el mes actual.
  const months = data.attrition.map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (data.attrition.length - 1 - i), 1);
    return new Intl.DateTimeFormat(locale, { month: "short" }).format(d);
  });

  const currency = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });

  const kpis = [
    { label: t("kpiInterventions"), value: format.number(data.kpis.interventions), sub: t("kpiInterventionsSub"), color: "#5B6EF5" },
    { label: t("kpiRetained"), value: format.number(data.kpis.retained), sub: t("kpiRetainedSub"), color: "#8476FF" },
    { label: t("kpiCostAvoided"), value: currency.format(data.kpis.costAvoidedMxn), sub: t("kpiCostAvoidedSub"), color: "#5B6EF5" },
    { label: t("kpiPrecision"), value: `${data.kpis.precision}%`, sub: t("kpiPrecisionSub"), color: "#8476FF" },
  ];

  const sev = (r: number) => (r >= 18 ? "#EB4F6C" : r >= 12 ? "#E59BB0" : "#5B6EF5");
  const lineItems = data.byLine.map((l) => ({
    label: l.line,
    value: l.rate,
    caption: t("flagged", { n: l.count }),
    color: sev(l.rate),
  }));
  const driverItems = data.drivers.map((d) => ({ label: d.factor, value: d.weight, color: "#5B6EF5" }));

  function downloadCsv() {
    if (!data) return;
    const rows: string[][] = [
      ["section", "key", "value"],
      ["kpi", "interventions", String(data.kpis.interventions)],
      ["kpi", "retained_est", String(data.kpis.retained)],
      ["kpi", "cost_avoided_mxn", String(data.kpis.costAvoidedMxn)],
      ["kpi", "precision_pct", String(data.kpis.precision)],
      ...data.byLine.map((l) => ["line", l.line, `${l.rate}% (${l.count} flagged)`]),
      ...data.drivers.map((d) => ["driver", d.factor, `${d.weight}%`]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "soral-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="animate-fade pb-12">
      <div className="flex flex-wrap items-end justify-between gap-3.5 py-5">
        <div>
          <h1 className="text-[27px] font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-sm text-ink-2">{t("subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={downloadCsv}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line-2 bg-surface px-3.5 py-2 text-[12.5px] font-medium text-ink-1 transition-colors hover:border-risk-sol hover:text-risk-sol"
        >
          <Download className="h-4 w-4" />
          {t("exportCsv")}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="px-[17px] py-[15px]">
            <div className="text-[11.5px] text-ink-2">{k.label}</div>
            <div className="mt-1 font-mono text-[23px] font-semibold leading-tight" style={{ color: k.color }}>
              {k.value}
            </div>
            <div className="mt-0.5 text-[11px] text-ink-3">{k.sub}</div>
          </Card>
        ))}
      </div>

      <Card className="mt-4 rounded-xl p-[22px]">
        <div className="mb-4">
          <h2 className="text-[17px] font-semibold">{t("turnoverTitle")}</h2>
          <p className="mt-0.5 text-[12.5px] text-ink-2">{t("turnoverSub")}</p>
        </div>
        <AreaChart data={data.attrition} labels={months} ariaLabel={t("turnoverAria")} />
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="rounded-xl p-[22px]">
          <div className="mb-4">
            <h2 className="text-[17px] font-semibold">{t("byLineTitle")}</h2>
            <p className="mt-0.5 text-[12.5px] text-ink-2">{t("byLineSub")}</p>
          </div>
          <BarList items={lineItems} />
        </Card>
        <Card className="rounded-xl p-[22px]">
          <div className="mb-4">
            <h2 className="text-[17px] font-semibold">{t("driversTitle")}</h2>
            <p className="mt-0.5 text-[12.5px] text-ink-2">{t("driversSub")}</p>
          </div>
          <BarList items={driverItems} />
        </Card>
      </div>
    </div>
  );
}
