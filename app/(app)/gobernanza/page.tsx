// app/(app)/gobernanza/page.tsx
// Gobernanza y equidad: el lente de responsabilidad sobre el modelo. Complementa
// la model card (/modelo, qué tan preciso es) con tres preguntas que exige un
// comité de ética, Legal o el sindicato: ¿trata distinto a unos grupos? ¿alguna
// señal es proxy de un atributo protegido? ¿quién decidió qué, por qué y con qué
// resultado? Todo se computa en el data-service; aquí solo se pinta.
"use client";

import { useTranslations, useFormatter } from "next-intl";
import { Scale, AlertTriangle, ClipboardList, CheckCircle2, Download } from "lucide-react";
import { useGovernance } from "@/lib/queries";
import { Fairness } from "@/components/governance/fairness";
import { Calibration } from "@/components/governance/calibration";
import { ProxySignals } from "@/components/governance/proxy-signals";
import { DecisionLog } from "@/components/governance/decision-log";
import { LoadingState, ErrorState } from "@/components/ui/states";

export default function GovernancePage() {
  const { data, isLoading, isError, refetch, isFetching } = useGovernance();
  const t = useTranslations("governance");
  const tc = useTranslations("common");
  const f = useFormatter();

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

  // Exporta el registro de decisiones a CSV — el entregable que se le pasa a una
  // auditoría o a Legal. Mismo patrón que el export del dashboard.
  function exportCsv() {
    const rows: string[][] = [
      ["ref", "band", "driver", "play", "assigned_by", "assigned_at", "status", "outcome"],
      ...data!.log.map((d) => [d.ref, d.band, d.driver, d.play, d.by, d.at, d.status, d.outcome]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "soral-registro-decisiones.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const review = data.parityStatus === "review";
  const calReview = data.calibrationStatus === "review";
  const kpis = [
    {
      icon: Scale,
      label: t("kpiParity"),
      value: data.parityRatio.toFixed(2),
      tag: t(data.parityStatus),
      color: review ? "#EB4F6C" : "#5B6EF5",
    },
    { icon: AlertTriangle, label: t("kpiProxy"), value: f.number(data.proxyCount), color: "#E59BB0" },
    { icon: ClipboardList, label: t("kpiDecisions"), value: f.number(data.decisionCount), color: "#8476FF" },
    { icon: CheckCircle2, label: t("kpiMeasured"), value: `${data.measuredPct}%`, color: "#5B6EF5" },
  ];

  return (
    <div className="animate-fade pb-12">
      <div className="py-5">
        <h1 className="text-title font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1 max-w-3xl text-body text-ink-2">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-xl border border-line bg-surface px-3.5 py-3">
              <div className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-ink-3" />
                <span className="text-micro text-ink-2">{k.label}</span>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-heading font-bold tabular-nums" style={{ color: k.color }}>
                  {k.value}
                </span>
                {k.tag && (
                  <span
                    className="rounded-full px-2 py-0.5 text-micro font-semibold"
                    style={{ color: k.color, backgroundColor: review ? "#FBE9ED" : "#EAEDFE" }}
                  >
                    {k.tag}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 mb-3">
        <h2 className="text-subhead font-semibold">{t("fairnessTitle")}</h2>
        <p className="mt-0.5 max-w-3xl text-meta text-ink-2">{t("fairnessSub")}</p>
      </div>
      <Fairness fairness={data.fairness} />

      <div className="mt-8 mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-subhead font-semibold">{t("calTitle")}</h2>
          <p className="mt-0.5 max-w-3xl text-meta text-ink-2">{t("calSub")}</p>
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-micro font-semibold tabular-nums"
          style={{ color: calReview ? "#EB4F6C" : "#5B6EF5", backgroundColor: calReview ? "#FBE9ED" : "#EAEDFE" }}
        >
          {data.calibrationGap} {t("gapUnit")} · {t(data.calibrationStatus)}
        </span>
      </div>
      <Calibration calibration={data.calibration} />

      <div className="mt-8 mb-3">
        <h2 className="text-subhead font-semibold">{t("proxyTitle")}</h2>
        <p className="mt-0.5 max-w-3xl text-meta text-ink-2">{t("proxySub")}</p>
      </div>
      <ProxySignals proxies={data.proxies} />

      <div className="mt-8 mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-subhead font-semibold">{t("logTitle")}</h2>
          <p className="mt-0.5 max-w-3xl text-meta text-ink-2">{t("logSub")}</p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line-2 bg-surface px-3 py-2 text-meta font-medium text-ink-1 transition-colors hover:border-risk-sol hover:text-risk-sol"
        >
          <Download className="h-4 w-4" />
          {t("exportLog")}
        </button>
      </div>
      <DecisionLog log={data.log} />

      <div className="mt-8 rounded-xl border border-line bg-surface-2 p-4">
        <div className="text-meta font-semibold text-ink-2">{t("methodTitle")}</div>
        <p className="mt-1 max-w-3xl text-meta text-ink-3">{t("method")}</p>
      </div>
    </div>
  );
}
