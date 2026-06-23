// app/(app)/plan-de-accion/page.tsx
// "Actuar esta semana" como página propia (categoría Planeación). Es el worklist
// plant-wide de mayor riesgo — convierte el score en acción y se asigna el plan.
// Vivía al fondo del dashboard; movido aquí para que el dashboard sea overview.
"use client";

import { useTranslations } from "next-intl";
import { usePlantSummary } from "@/lib/queries";
import { ActionQueue } from "@/components/dashboard/action-queue";
import { LoadingState, ErrorState } from "@/components/ui/states";

export default function ActionPlanPage() {
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
        <h1 className="text-title font-semibold tracking-tight">{t("actTitle")}</h1>
        <p className="mt-1 text-body text-ink-2">{t("actHint")}</p>
      </div>
      <ActionQueue rows={data.topRisk} />
    </div>
  );
}
