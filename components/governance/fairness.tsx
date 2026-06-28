// components/governance/fairness.tsx
// Equidad por grupo: una tarjeta por dimensión (línea / turno / antigüedad). Cada
// barra es la tasa de riesgo del grupo, escalada a la mayor para comparar de un
// vistazo; la razón de impacto (regla de 4/5) resume si hay diferencia a revisar.
"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import type { FairnessDimension } from "@/types";

// Grupos con etiqueta i18n (group_*). Turno/antigüedad por defecto la tienen; un
// turno renombrado por el usuario no — ese se muestra tal cual en vez de la clave.
const LABELLED_GROUPS = new Set(["morning", "evening", "night", "rotating", "lt3m", "m3_12", "y1_3", "gt3y"]);

function Chip({ tone, children }: { tone: "review" | "ok" | "sensitive" | "operational"; children: React.ReactNode }) {
  const map = {
    review: "bg-[#FBE9ED] text-risk-cri",
    ok: "bg-risk-sol-soft text-risk-sol",
    sensitive: "bg-[#F1ECFB] text-[#7C6BD0]",
    operational: "bg-surface-bg text-ink-3",
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-micro font-semibold ${map[tone]}`}>{children}</span>;
}

function DimensionCard({ d }: { d: FairnessDimension }) {
  const t = useTranslations("governance");
  const max = Math.max(...d.groups.map((g) => g.rate)) || 1;
  const label = (group: string) =>
    d.dimension === "line" || !LABELLED_GROUPS.has(group) ? group : t(`group_${group}`);

  return (
    <Card className="flex flex-col rounded-xl p-[22px]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-subhead font-semibold">{t(`dim_${d.dimension}`)}</h3>
          <div className="mt-1.5">
            <Chip tone={d.sensitive ? "sensitive" : "operational"}>
              {d.sensitive ? t("sensitiveTag") : t("operationalTag")}
            </Chip>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-micro uppercase tracking-wide text-ink-3">{t("impactRatio")}</div>
          {/* La línea es operativa: su brecha es esperada, no se marca como alarma.
              Solo las dimensiones sensibles muestran el chip de revisión en rojo. */}
          <div
            className="text-heading font-bold"
            style={{ color: d.sensitive && d.status === "review" ? "#EB4F6C" : "#2B2D42" }}
          >
            {d.ratio.toFixed(2)}
          </div>
          {d.sensitive ? (
            <Chip tone={d.status === "review" ? "review" : "ok"}>{t(d.status)}</Chip>
          ) : (
            <span className="text-micro text-ink-3">{t("expectedTag")}</span>
          )}
        </div>
      </div>

      <div className="mt-auto space-y-2.5">
        {d.groups.map((g) => {
          const isMax = g.rate === max;
          return (
            <div key={g.group} className="flex items-center gap-3">
              <div className="w-[68px] shrink-0 text-copy text-ink-2">{label(g.group)}</div>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-bg">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(g.rate / max) * 100}%`, backgroundColor: isMax && d.sensitive ? "#EB4F6C" : "#5B6EF5" }}
                />
              </div>
              <div className="w-9 shrink-0 text-right text-copy font-semibold tabular-nums">{g.rate}%</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function Fairness({ fairness }: { fairness: FairnessDimension[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {fairness.map((d) => (
        <DimensionCard key={d.dimension} d={d} />
      ))}
    </div>
  );
}
