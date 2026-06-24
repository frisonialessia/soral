// components/dashboard/retention-simulator.tsx
// Simulador what-if (prescriptivo): el supervisor mueve palancas de intervención
// y el riesgo alto + el costo-en-riesgo de la planta se recalculan en vivo. El
// efecto de cada palanca se deriva de la composición SHAP real de cada empleado
// (cuánto pesa el factor relacionado), no de un número inventado.
"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { riskColor } from "@/lib/risk";
import type { EmployeePrediction } from "@/types";
import { EstimateBadge } from "./estimate-badge";

const EFFECT = 0.7; // efectividad máxima de una palanca sobre su factor

const LEVERS = [
  { key: "overtime", match: /extra/i },
  { key: "supervisor", match: /supervisor/i },
  { key: "transport", match: /retardo/i },
  { key: "pay", match: /n[oó]mina|falta/i },
  { key: "climate", match: /productividad|clima|antig/i },
] as const;
type LeverKey = (typeof LEVERS)[number]["key"];

const LABEL_KEY: Record<LeverKey, string> = {
  overtime: "leverOvertime",
  supervisor: "leverSupervisor",
  transport: "leverTransport",
  pay: "leverPay",
  climate: "leverClimate",
};

export function RetentionSimulator({
  rows,
  costPerReplacement = 36_800,
  costEstimated = false,
}: {
  rows: EmployeePrediction[];
  costPerReplacement?: number;
  costEstimated?: boolean;
}) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const [lv, setLv] = useState<Record<LeverKey, number>>({
    overtime: 0,
    supervisor: 0,
    transport: 0,
    pay: 0,
    climate: 0,
  });

  const currency = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });

  const exposure = (emp: EmployeePrediction, key: LeverKey) => {
    const m = LEVERS.find((l) => l.key === key)!.match;
    return emp.drivers.filter((d) => m.test(d.factor)).reduce((s, d) => s + d.contrib, 0);
  };
  const adjusted = (emp: EmployeePrediction) => {
    let frac = 0;
    for (const l of LEVERS) frac += (lv[l.key] / 100) * (exposure(emp, l.key) / 100) * EFFECT;
    return Math.max(0, Math.round(emp.score * (1 - frac)));
  };

  const highRows = rows.filter((e) => e.score >= 80);
  const baseHigh = highRows.length;
  const simHigh = rows.filter((e) => adjusted(e) >= 80).length;
  const retained = baseHigh - simHigh;
  const dirty = Object.values(lv).some((v) => v > 0);

  return (
    <div>
      <p className="text-copy text-ink-2">{t("simHint")}</p>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        {/* Palancas */}
        <div className="space-y-3.5">
          {LEVERS.map((l) => (
            <div key={l.key}>
              <div className="mb-1 flex items-center justify-between text-copy">
                <span className="text-ink-1">{t(LABEL_KEY[l.key])}</span>
                <span className="font-mono text-ink-3">{lv[l.key]}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={lv[l.key]}
                aria-label={t(LABEL_KEY[l.key])}
                onChange={(e) => setLv((s) => ({ ...s, [l.key]: Number(e.target.value) }))}
                className="w-full accent-[#5B6EF5]"
              />
            </div>
          ))}
          {dirty && (
            <button
              type="button"
              onClick={() => setLv({ overtime: 0, supervisor: 0, transport: 0, pay: 0, climate: 0 })}
              className="text-meta font-medium text-risk-sol hover:underline"
            >
              {t("simReset")}
            </button>
          )}
        </div>

        {/* Resultado en vivo */}
        <div className="space-y-2.5">
          <ResultRow label={t("statHighRisk")} from={String(baseHigh)} to={String(simHigh)} good={simHigh < baseHigh} />
          <ResultRow
            label={t("simCostAtRisk")}
            from={currency.format(baseHigh * costPerReplacement)}
            to={currency.format(simHigh * costPerReplacement)}
            good={simHigh < baseHigh}
          />
          {costEstimated && (
            <div className="flex justify-end">
              <EstimateBadge />
            </div>
          )}
          <div className="flex items-center justify-between rounded-lg border border-line bg-surface-2 px-3.5 py-2.5">
            <span className="text-meta text-ink-2">{t("simRetained")}</span>
            <span className="font-mono text-subhead font-bold" style={{ color: retained > 0 ? "#5B6EF5" : "#A9AEC2" }}>
              {retained}
            </span>
          </div>

          <ul className="space-y-2 pt-1">
            {highRows.map((e) => {
              const a = adjusted(e);
              const kept = a < 80;
              return (
                <li key={e.ref} className="flex items-center gap-2.5 text-meta">
                  <span className="w-[74px] shrink-0 font-mono text-ink-2">{e.ref}</span>
                  <div className="relative h-2 flex-1 overflow-hidden rounded bg-surface-bg">
                    <div className="absolute inset-y-0 left-0 rounded bg-ink-3/25" style={{ width: `${e.score}%` }} />
                    <div className="absolute inset-y-0 left-0 rounded" style={{ width: `${a}%`, background: riskColor(a) }} />
                  </div>
                  <span className="w-[58px] shrink-0 text-right font-mono">
                    <span className="text-ink-3">{e.score}</span>
                    <span className="text-ink-3">→</span>
                    <span style={{ color: riskColor(a) }}>{a}</span>
                  </span>
                  <span className="w-3 shrink-0 text-risk-sol">{kept ? "✓" : ""}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ResultRow({ label, from, to, good }: { label: string; from: string; to: string; good: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-line bg-surface-2 px-3.5 py-2.5">
      <span className="text-meta text-ink-2">{label}</span>
      <span className="font-mono text-body font-bold">
        <span className="text-ink-3">{from}</span>
        <span className="mx-1.5 text-ink-3">→</span>
        <span style={{ color: good ? "#5B6EF5" : "#2B2D42" }}>{to}</span>
      </span>
    </div>
  );
}
