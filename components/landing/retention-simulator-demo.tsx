// components/landing/retention-simulator-demo.tsx
// Simulador what-if INTERACTIVO para la landing — demo autocontenida (solo cliente,
// sin datos reales ni persistencia). Mueves las palancas de intervención y el alto
// riesgo + el costo en riesgo se recalculan en vivo. En la app real (/simulador) el
// efecto de cada palanca se deriva del SHAP de cada trabajador; aquí es ilustrativo.
"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { RotateCcw } from "lucide-react";

const COST_MXN = 36_800; // costo de reemplazo por salida (mismo que la app)
const BASELINE_HIGH_RISK = 38;
const EFFECT = 0.7; // efectividad máxima de una palanca

// Cada palanca puede evitar hasta `max` salidas de alto riesgo (∑ ≈ baseline).
const LEVERS = [
  { key: "overtime", max: 11 },
  { key: "supervisor", max: 12 },
  { key: "transport", max: 8 },
  { key: "pay", max: 7 },
] as const;

type LeverKey = (typeof LEVERS)[number]["key"];
const ZERO: Record<LeverKey, number> = { overtime: 0, supervisor: 0, transport: 0, pay: 0 };

export function RetentionSimulatorDemo() {
  const t = useTranslations("landing");
  const locale = useLocale();
  const [levers, setLevers] = useState<Record<LeverKey, number>>(ZERO);

  const averted = Math.min(
    BASELINE_HIGH_RISK,
    Math.round(LEVERS.reduce((sum, l) => sum + l.max * (levers[l.key] / 100) * EFFECT, 0))
  );
  const remaining = BASELINE_HIGH_RISK - averted;
  const pct = Math.round((remaining / BASELINE_HIGH_RISK) * 100);
  const cur = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 1,
    notation: "compact",
  });
  const acting = averted > 0;

  return (
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-[0_24px_64px_-24px_rgba(43,45,66,0.3)] sm:p-7">
      <div className="grid gap-7 lg:grid-cols-2 lg:items-center">
        {/* Palancas */}
        <div className="space-y-4">
          {LEVERS.map((l) => (
            <div key={l.key}>
              <div className="mb-1.5 flex items-center justify-between text-copy">
                <span className="font-medium text-ink-1">{t(`lever_${l.key}`)}</span>
                <span className="tabular-nums text-ink-3">{levers[l.key]}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={levers[l.key]}
                onChange={(e) => setLevers((p) => ({ ...p, [l.key]: Number(e.target.value) }))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-bg accent-risk-sol"
                aria-label={t(`lever_${l.key}`)}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setLevers(ZERO)}
            className="inline-flex items-center gap-1.5 pt-1 text-meta text-ink-3 transition-colors hover:text-risk-sol"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t("simReset")}
          </button>
        </div>

        {/* Resultado en vivo */}
        <div className="rounded-xl border border-line bg-surface-bg p-5">
          <div className="text-meta text-ink-2">{t("simHighRiskLabel")}</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className="text-display font-bold tabular-nums transition-colors duration-300"
              style={{ color: acting ? "#5B6EF5" : "#EB4F6C" }}
            >
              {remaining}
            </span>
            <span className="text-meta text-ink-3">{t("simBaselineNote", { n: BASELINE_HIGH_RISK })}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-risk-sol transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-4">
            <div>
              <div className="text-meta text-ink-2">{t("simCostLabel")}</div>
              <div className="mt-0.5 text-subhead font-bold tabular-nums text-ink-1">
                {cur.format(remaining * COST_MXN)}
              </div>
            </div>
            <div>
              <div className="text-meta text-ink-2">{t("simRetainLabel")}</div>
              <div
                className="mt-0.5 text-subhead font-bold tabular-nums transition-colors"
                style={{ color: acting ? "#5B6EF5" : "#A9AEC2" }}
              >
                +{averted}
              </div>
              <div className="text-micro text-ink-3">{t("simRetainNote", { cost: cur.format(averted * COST_MXN) })}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
