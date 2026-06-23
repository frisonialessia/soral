// app/(app)/seguimiento/page.tsx
// Loop de resultados: cada play asignada se rastrea de "asignada" → "en curso" →
// "hecha" con resultado (retenido / se fue). Los resultados medidos aquí son las
// etiquetas con las que el modelo (el "cerebro") aprenderá y se prueba el ROI.
"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { useTranslations, useFormatter } from "next-intl";
import { useInterventions, useUpdateIntervention } from "@/lib/queries";
import { Card } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/ui/states";
import type { InterventionStatus, InterventionOutcome } from "@/types";

const STATUS_COLOR: Record<InterventionStatus, string> = {
  assigned: "#A9AEC2",
  in_progress: "#B49AED",
  done: "#5B6EF5",
};
const OUTCOME_COLOR: Record<InterventionOutcome, string> = {
  pending: "#A9AEC2",
  retained: "#5B6EF5",
  left: "#EB4F6C",
};

export default function InterventionsPage() {
  const { data, isLoading, isError, refetch, isFetching } = useInterventions();
  const update = useUpdateIntervention();
  const t = useTranslations("interventions");
  const tc = useTranslations("common");
  const format = useFormatter();

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

  const iv = data.interventions;
  const active = iv.filter((i) => i.status !== "done").length;
  const done = iv.filter((i) => i.status === "done").length;
  const retained = iv.filter((i) => i.outcome === "retained").length;
  const left = iv.filter((i) => i.outcome === "left").length;
  const resolved = retained + left;
  const success = resolved ? Math.round((retained / resolved) * 100) : null;

  const set = (id: string, patch: { status?: InterventionStatus; outcome?: InterventionOutcome }) =>
    update.mutate({ id, patch });

  return (
    <div className="animate-fade pb-12">
      <div className="py-5">
        <h1 className="text-title font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-body text-ink-2">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label={t("kpiActive")} value={String(active)} color="#8476FF" />
        <Kpi label={t("kpiDone")} value={String(done)} color="#6B7088" />
        <Kpi label={t("kpiRetained")} value={String(retained)} color="#5B6EF5" />
        <Kpi
          label={t("kpiSuccess")}
          value={success == null ? "—" : `${success}%`}
          color={success != null && success >= 50 ? "#5B6EF5" : "#EB4F6C"}
        />
      </div>

      <ul className="mt-4 space-y-2.5">
        {iv.length === 0 && (
          <li className="rounded-xl border border-line bg-surface p-8 text-center text-copy text-ink-3">
            {t("empty")}
          </li>
        )}
        {iv.map((i) => (
          <li
            key={i.id}
            className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 sm:flex-row sm:items-center"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  href={`/empleado/${encodeURIComponent(i.ref)}`}
                  className="font-mono text-copy text-ink-1 hover:text-risk-sol"
                >
                  {i.ref}
                </Link>
                <span className="text-micro text-ink-3">{i.line}</span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-micro font-medium"
                  style={{ background: `${STATUS_COLOR[i.status]}1A`, color: STATUS_COLOR[i.status] }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_COLOR[i.status] }} />
                  {t(`status_${i.status}`)}
                </span>
                {i.status === "done" && (
                  <span className="text-micro font-semibold" style={{ color: OUTCOME_COLOR[i.outcome] }}>
                    · {t(`outcome_${i.outcome}`)}
                  </span>
                )}
              </div>
              <p className="mt-1 text-copy text-ink-2">{i.play}</p>
              <p className="mt-0.5 text-micro text-ink-3">
                {t("assignedBy", { name: i.assignedBy })} · {format.relativeTime(new Date(i.assignedAt))}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              {i.status === "assigned" && (
                <Btn onClick={() => set(i.id, { status: "in_progress" })} disabled={update.isPending}>
                  {t("start")}
                </Btn>
              )}
              {i.status === "in_progress" && (
                <>
                  <Btn primary onClick={() => set(i.id, { status: "done", outcome: "retained" })} disabled={update.isPending}>
                    {t("markRetained")}
                  </Btn>
                  <Btn onClick={() => set(i.id, { status: "done", outcome: "left" })} disabled={update.isPending}>
                    {t("markLeft")}
                  </Btn>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Kpi({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Card className="px-[17px] py-[15px]">
      <div className="text-meta text-ink-2">{label}</div>
      <div className="mt-1 font-mono text-heading font-bold leading-tight" style={{ color }}>
        {value}
      </div>
    </Card>
  );
}

function Btn({
  children,
  onClick,
  disabled,
  primary,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-3 py-1.5 text-meta font-medium transition-colors disabled:opacity-40 ${
        primary
          ? "bg-risk-sol text-white hover:bg-risk-sol/90"
          : "border border-line-2 text-ink-1 hover:border-risk-sol hover:text-risk-sol"
      }`}
    >
      {children}
    </button>
  );
}
