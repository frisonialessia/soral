// components/governance/decision-log.tsx
// Registro de decisiones: la traza auditable del loop de intervención. Cada fila
// es una decisión REAL (quién asignó qué a quién), unida a la banda y el driver
// del trabajador — el "por qué" — y al resultado medido. Es lo que pide una
// auditoría: no solo qué predijo el modelo, sino qué se HIZO y con qué efecto.
"use client";

import Link from "next/link";
import { useTranslations, useFormatter } from "next-intl";
import { Card } from "@/components/ui/card";
import { riskColor } from "@/lib/risk";
import type { GovernanceDecision } from "@/types";

function OutcomeChip({ d }: { d: GovernanceDecision }) {
  const t = useTranslations("governance");
  if (d.outcome === "retained")
    return <span className="rounded-full bg-risk-sol-soft px-2 py-0.5 text-micro font-semibold text-risk-sol">{t("out_retained")}</span>;
  if (d.outcome === "left")
    return <span className="rounded-full bg-[#FBE9ED] px-2 py-0.5 text-micro font-semibold text-risk-cri">{t("out_left")}</span>;
  return <span className="rounded-full bg-surface-bg px-2 py-0.5 text-micro font-semibold text-ink-3">{t("out_pending")}</span>;
}

export function DecisionLog({ log }: { log: GovernanceDecision[] }) {
  const t = useTranslations("governance");
  const tb = useTranslations("bands");
  const f = useFormatter();

  return (
    <Card className="overflow-hidden rounded-xl p-0">
      <ul>
        {log.map((d) => (
          <li key={d.id} className="flex flex-col gap-3 border-b border-line px-5 py-4 last:border-0 sm:flex-row sm:items-center">
            <div className="min-w-0 sm:w-[230px] sm:shrink-0">
              <Link
                href={`/empleado/${encodeURIComponent(d.ref)}`}
                className="font-mono text-copy text-ink-1 hover:text-risk-sol"
              >
                {d.ref}
              </Link>
              <div className="mt-0.5 flex items-center gap-1.5 text-micro text-ink-3">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: riskColor(d.band === "critico" ? 95 : d.band === "alto" ? 85 : 60) }} />
                <span className="font-medium text-ink-2">{tb(d.band)}</span>
                <span className="text-ink-3">· {t("whyLabel")} {d.driver}</span>
              </div>
            </div>

            <p className="min-w-0 flex-1 text-copy text-ink-2">{d.play}</p>

            <div className="flex items-center gap-3 sm:shrink-0">
              <span className="text-micro text-ink-3">{f.dateTime(new Date(d.at), { day: "2-digit", month: "short" })}</span>
              <span className="hidden text-micro text-ink-3 sm:inline">· {d.by}</span>
              <OutcomeChip d={d} />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
