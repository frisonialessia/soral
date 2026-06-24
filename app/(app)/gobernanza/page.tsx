// app/(app)/gobernanza/page.tsx
// Gobernanza y equidad: el lente de responsabilidad sobre el modelo. Complementa
// la model card (/modelo, qué tan preciso es) con tres preguntas que exige un
// comité de ética, Legal o el sindicato: ¿trata distinto a unos grupos? ¿alguna
// señal es proxy de un atributo protegido? ¿quién decidió qué, por qué y con qué
// resultado? Todo se computa en el data-service; aquí solo se pinta.
"use client";

import { useTranslations, useFormatter } from "next-intl";
import { Scale, AlertTriangle, ClipboardList, CheckCircle2 } from "lucide-react";
import { useGovernance } from "@/lib/queries";
import { Fairness } from "@/components/governance/fairness";
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

  const review = data.parityStatus === "review";
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

      <div className="mt-8 mb-3">
        <h2 className="text-subhead font-semibold">{t("proxyTitle")}</h2>
        <p className="mt-0.5 max-w-3xl text-meta text-ink-2">{t("proxySub")}</p>
      </div>
      <ProxySignals proxies={data.proxies} />

      <div className="mt-8 mb-3">
        <h2 className="text-subhead font-semibold">{t("logTitle")}</h2>
        <p className="mt-0.5 max-w-3xl text-meta text-ink-2">{t("logSub")}</p>
      </div>
      <DecisionLog log={data.log} />
    </div>
  );
}
