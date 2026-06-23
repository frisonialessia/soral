// app/linea/[id]/page.tsx
"use client";

import { use } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLineDetail } from "@/lib/queries";
import { RiskTable } from "@/components/risk-table";
import { Card } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/ui/states";

export default function LinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, isError, refetch, isFetching } = useLineDetail(id);
  const t = useTranslations("line");
  const tc = useTranslations("common");

  if (isLoading) return <LoadingState label={t("loading", { id })} />;
  if (isError || !data) {
    return (
      <ErrorState
        title={t("errorTitle", { id })}
        detail={tc("checkConnection")}
        onRetry={() => refetch()}
        retrying={isFetching}
      />
    );
  }

  return (
    <div className="animate-fade pb-12">
      <div className="flex items-center gap-2 pt-5 pb-0.5 text-copy text-ink-3">
        <Link href="/dashboard" className="text-ink-2 hover:text-risk-sol">
          {t("crumbPlant")}
        </Link>
        <span>/</span>
        <span>{t("crumbLine", { id: data.id })}</span>
      </div>

      <div className="py-4">
        <h1 className="text-title font-semibold tracking-tight">{t("title", { id: data.id })}</h1>
        <p className="mt-1 text-body text-ink-2">
          {t("subtitle", { count: data.employees.length, shift: data.shift })}
        </p>
      </div>

      <div className="mb-7 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <DetStat label={t("statTurnover")} value={data.turnover90d} note={t("statTurnoverNote")} color="#EB4F6C" />
        <DetStat label={t("statProductivity")} value={data.productivity} note={t("statProductivityNote")} color="#E59BB0" />
        <DetStat label={t("statSupervisor")} value={data.supervisorEffect} note={t("statSupervisorNote")} color="#F56C89" />
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-subhead font-semibold">{t("employeesTitle")}</h2>
        <span className="text-copy text-ink-3">{t("employeesHint")}</span>
      </div>
      <RiskTable rows={data.employees} showLine={false} emptyLabel={t("emptyLine")} />
    </div>
  );
}

function DetStat({
  label,
  value,
  note,
  color,
}: {
  label: string;
  value: string;
  note: string;
  color: string;
}) {
  return (
    <Card className="px-5 py-[18px]">
      <div className="text-meta font-semibold uppercase tracking-wide text-ink-3">{label}</div>
      <div className="mt-1.5 font-mono text-title font-semibold tracking-tight" style={{ color }}>
        {value}
      </div>
      <div className="mt-0.5 text-meta text-ink-3">{note}</div>
    </Card>
  );
}
