// app/(app)/integraciones/page.tsx
"use client";

import { useState } from "react";
import { useTranslations, useFormatter } from "next-intl";
import { Plug, Database, AlertTriangle, Layers, type LucideIcon } from "lucide-react";
import { useIntegrations } from "@/lib/queries";
import { Card } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/ui/states";
import { ConnectorModal } from "@/components/integrations/connector-modal";
import { STATUS_COLOR, CAT_ICON } from "@/components/integrations/util";
import type { IntegrationConnector } from "@/types";

export default function IntegrationsPage() {
  const { data, isLoading, isError, refetch, isFetching } = useIntegrations();
  const t = useTranslations("integrations");
  const tc = useTranslations("common");
  const format = useFormatter();
  const [selected, setSelected] = useState<IntegrationConnector | null>(null);

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

  const cs = data.connectors;
  const connected = cs.filter((c) => c.status === "connected" || c.status === "syncing").length;
  const errors = cs.filter((c) => c.status === "error").length;
  const records = cs.reduce((s, c) => s + c.records, 0);
  const rel = (min: number | null) =>
    min == null ? t("neverSynced") : format.relativeTime(new Date(Date.now() - min * 60000));

  return (
    <div className="animate-fade pb-12">
      <div className="py-5">
        <h1 className="text-[27px] font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-ink-2">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon={Plug} label={t("kpiConnected")} value={`${connected}/${cs.length}`} color="#5B6EF5" />
        <Kpi icon={Database} label={t("kpiRecords")} value={format.number(records)} color="#8476FF" />
        <Kpi icon={AlertTriangle} label={t("kpiErrors")} value={String(errors)} color={errors ? "#EB4F6C" : "#A9AEC2"} />
        <Kpi icon={Layers} label={t("kpiSources")} value={String(cs.length)} color="#6B7088" />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cs.map((c) => {
          const Icon = CAT_ICON[c.category];
          const color = STATUS_COLOR[c.status];
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelected(c)}
              className="rounded-xl border border-line bg-surface p-4 text-left transition-colors hover:border-risk-sol"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-bg text-ink-2">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
                  style={{ background: `${color}1A`, color }}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${c.status === "syncing" ? "animate-pulse" : ""}`}
                    style={{ background: color }}
                  />
                  {t(`status_${c.status}`)}
                </span>
              </div>
              <div className="mt-3 text-[14px] font-semibold text-ink-1">{c.name}</div>
              <div className="text-[12px] text-ink-3">
                {t(`cat_${c.category}`)} · {t(`freq_${c.frequency}`)}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5 text-[11.5px] text-ink-3">
                <span>
                  {t("lastSync")}: {rel(c.lastSyncMin)}
                </span>
                <span className="font-mono">{format.number(c.records)}</span>
              </div>
            </button>
          );
        })}
      </div>

      <ConnectorModal connector={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function Kpi({ icon: Icon, label, value, color }: { icon: LucideIcon; label: string; value: string; color: string }) {
  return (
    <Card className="px-[17px] py-[15px]">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-ink-3" />
        <span className="text-[11.5px] text-ink-2">{label}</span>
      </div>
      <div className="mt-1 font-mono text-[23px] font-bold leading-tight" style={{ color }}>
        {value}
      </div>
    </Card>
  );
}
