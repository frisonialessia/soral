// app/empleado/[ref]/page.tsx
"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEmployee } from "@/lib/queries";
import { RiskRadar, TrendChart } from "@/components/employee/charts";
import { RecommendationModal } from "@/components/recommendation-modal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState, ErrorState } from "@/components/ui/states";
import { riskColor } from "@/lib/risk";

export default function EmployeePage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = use(params);
  const { data: e, isLoading, isError, refetch, isFetching } = useEmployee(ref);
  const [modalOpen, setModalOpen] = useState(false);
  const t = useTranslations("employee");
  const tl = useTranslations("line");
  const tc = useTranslations("common");

  if (isLoading) return <LoadingState label={t("loading")} />;
  if (isError) {
    return (
      <ErrorState
        title={t("errorTitle")}
        detail={tc("checkConnection")}
        onRetry={() => refetch()}
        retrying={isFetching}
      />
    );
  }
  if (!e) {
    return (
      <div className="py-20 text-center text-ink-3">
        {t("notFound")}{" "}
        <Link href="/" className="text-risk-sol">
          {tc("back")}
        </Link>
      </div>
    );
  }

  const c = riskColor(e.score);

  return (
    <div className="animate-fade pb-12">
      <div className="flex items-center gap-2 pt-5 pb-0.5 text-[13px] text-ink-3">
        <Link href="/" className="text-ink-2 hover:text-risk-sol">
          {tl("crumbPlant")}
        </Link>
        <span>/</span>
        <Link href={`/linea/${e.line}`} className="text-ink-2 hover:text-risk-sol">
          {tl("crumbLine", { id: e.line })}
        </Link>
        <span>/</span>
        <span>{e.ref}</span>
      </div>

      <Card className="my-[22px] flex items-center gap-[18px] px-[26px] py-[22px]">
        <div
          className="flex h-[58px] w-[58px] items-center justify-center rounded-2xl font-mono text-sm font-bold text-white"
          style={{ background: c }}
        >
          {e.ref.slice(1, 3)}
        </div>
        <div>
          <h2 className="font-mono text-[19px] font-bold">{e.ref}</h2>
          <p className="mt-0.5 text-[13px] text-ink-2">
            {t("subtitle", { line: e.line, shift: e.shift, tenure: e.tenure })}
          </p>
        </div>
        <div className="ml-auto text-right">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">{t("scoreNow")}</div>
          <div className="font-mono text-[32px] font-bold leading-none" style={{ color: c }}>
            {e.score}%
          </div>
        </div>
      </Card>

      <div className="mb-[18px] grid grid-cols-2 gap-4">
        <Card className="px-[22px] py-5">
          <h3 className="text-[14px] font-semibold">{t("radarTitle")}</h3>
          <p className="mb-3.5 mt-0.5 text-[12px] text-ink-3">{t("radarSubtitle")}</p>
          <div className="flex min-h-[230px] items-center justify-center">
            <RiskRadar axes={e.radar} color={c} />
          </div>
        </Card>

        <Card className="px-[22px] py-5">
          <h3 className="text-[14px] font-semibold">{t("driversTitle")}</h3>
          <p className="mb-3.5 mt-0.5 text-[12px] text-ink-3">{t("driversSubtitle")}</p>
          <div className="pt-1.5">
            {e.drivers.map((d) => (
              <div key={d.factor} className="mb-3.5 last:mb-0">
                <div className="mb-1.5 flex justify-between">
                  <span className="text-[12.5px] text-ink-1">{d.factor}</span>
                  <span className="font-mono text-[12.5px] font-bold" style={{ color: c }}>
                    {d.contrib}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded bg-surface-bg">
                  <div className="h-full rounded" style={{ width: `${d.contrib * 2}%`, background: c }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mb-[18px] px-[22px] py-5">
        <h3 className="text-[14px] font-semibold">{t("trendTitle")}</h3>
        <p className="mb-3.5 mt-0.5 text-[12px] text-ink-3">{t("trendSubtitle")}</p>
        <TrendChart data={e.trend} color={c} />
      </Card>

      <div className="mb-10 flex justify-end gap-2.5">
        <Link href={`/linea/${e.line}`}>
          <Button variant="default">{t("backToLine")}</Button>
        </Link>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          {t("viewAction")}
        </Button>
      </div>

      <RecommendationModal employee={modalOpen ? e : null} onClose={() => setModalOpen(false)} />
    </div>
  );
}
