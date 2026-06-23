// app/(app)/simulador/page.tsx
// "Herramientas de planeación" como página propia (categoría Planeación): las
// vistas prescriptivas (simulador what-if, contagio, pronóstico). Vivían en el
// dashboard; movidas aquí para separar "ver" (dashboard) de "planear".
"use client";

import { useTranslations } from "next-intl";
import { usePlantSummary } from "@/lib/queries";
import { InsightTabs } from "@/components/dashboard/insight-tabs";
import { Card } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/ui/states";

export default function PlanningToolsPage() {
  const { data, isLoading, isError, refetch, isFetching } = usePlantSummary();
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");

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

  return (
    <div className="animate-fade pb-12">
      <div className="py-5">
        <h1 className="text-title font-semibold tracking-tight">{t("insightsTitle")}</h1>
        <p className="mt-1 max-w-3xl text-body text-ink-2">{t("insightsSubtitle")}</p>
      </div>
      <Card className="rounded-xl p-[22px]">
        <InsightTabs rows={data.topRisk} />
      </Card>
    </div>
  );
}
