// components/landing/explainability-preview.tsx
// Showcase de explicabilidad para la landing: reusa el RiskRadar real + barras
// SHAP con datos de ejemplo. Decorativo (aria-hidden) — muestra la herramienta
// de "por qué el modelo marca" sin navegar.
"use client";

import { useTranslations } from "next-intl";
import { RiskRadar } from "@/components/employee/charts";
import type { RadarAxis } from "@/types";

const COLOR = "#EB4F6C";

export function ExplainabilityPreview() {
  const t = useTranslations("landing");

  const axes: RadarAxis[] = [
    [t("axis1"), 0.9],
    [t("axis2"), 0.72],
    [t("axis3"), 0.35],
    [t("axis4"), 0.6],
    [t("axis5"), 0.82],
    [t("axis6"), 0.5],
  ];
  const shap = [
    { label: t("previewDriver1"), contrib: 34 },
    { label: t("previewDriver2"), contrib: 28 },
    { label: t("previewDriver3"), contrib: 19 },
  ];

  return (
    <div
      aria-hidden="true"
      className="rounded-2xl border border-line bg-surface p-5 shadow-[0_24px_64px_-24px_rgba(43,45,66,0.3)] sm:p-6"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-body font-bold text-ink-1">#A3F9-4471</span>
        <span className="font-mono text-heading font-bold leading-none" style={{ color: COLOR }}>
          94%
        </span>
      </div>

      <div className="mt-3 grid items-center gap-4 sm:grid-cols-2">
        <div className="flex justify-center">
          <RiskRadar axes={axes} color={COLOR} />
        </div>
        <div className="space-y-3">
          {shap.map((s) => (
            <div key={s.label}>
              <div className="mb-1 flex items-center justify-between text-meta">
                <span className="text-ink-1">{s.label}</span>
                <span className="font-mono font-bold" style={{ color: COLOR }}>
                  {s.contrib}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded bg-surface-bg">
                <div className="h-full rounded" style={{ width: `${s.contrib * 2}%`, background: COLOR }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
