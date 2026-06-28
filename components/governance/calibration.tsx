// components/governance/calibration.tsx
// Calibración por grupo: la otra mitad de la equidad. Por cada grupo sensible
// muestra el riesgo PREDICHO por el modelo y la rotación OBSERVADA. Si coinciden,
// el modelo acierta parejo (✓). Si hay brecha ≥ 3 pp, la marca: ahí sobre/infra-
// estima a ese grupo y conviene revisar.
"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { CalibrationDimension } from "@/types";

const GAP_THRESHOLD = 3;
// Grupos con etiqueta i18n (group_*); uno renombrado se muestra tal cual.
const LABELLED_GROUPS = new Set(["morning", "evening", "night", "rotating", "lt3m", "m3_12", "y1_3", "gt3y"]);

function DimensionCard({ d }: { d: CalibrationDimension }) {
  const t = useTranslations("governance");
  const label = (group: string) =>
    d.dimension === "line" || !LABELLED_GROUPS.has(group) ? group : t(`group_${group}`);

  return (
    <Card className="rounded-xl p-[22px]">
      <h3 className="mb-3 text-subhead font-semibold">{t(`dim_${d.dimension}`)}</h3>
      <div className="divide-y divide-line">
        {d.groups.map((g) => {
          const gap = g.predicted - g.observed;
          const flag = Math.abs(gap) >= GAP_THRESHOLD;
          return (
            <div key={g.group} className="flex items-center gap-3 py-2.5">
              <span className="w-[88px] shrink-0 text-copy text-ink-2">{label(g.group)}</span>
              <div className="flex flex-1 items-center gap-4">
                <span className="text-copy text-ink-3">
                  {t("predicted")} <span className="font-semibold text-ink-1 tabular-nums">{g.predicted}%</span>
                </span>
                <span className="text-copy text-ink-3">
                  {t("observed")} <span className="font-semibold text-ink-1 tabular-nums">{g.observed}%</span>
                </span>
              </div>
              {flag ? (
                <span className="shrink-0 rounded-full bg-[#FBE9ED] px-2 py-0.5 text-micro font-semibold text-risk-cri tabular-nums">
                  {gap > 0 ? "+" : ""}
                  {gap} {t("gapUnit")}
                </span>
              ) : (
                <Check className="h-4 w-4 shrink-0 text-risk-sol" aria-label="ok" />
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function Calibration({ calibration }: { calibration: CalibrationDimension[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {calibration.map((d) => (
        <DimensionCard key={d.dimension} d={d} />
      ))}
    </div>
  );
}
