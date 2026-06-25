// components/demo-indicator.tsx
// Indicadores de "esto es una demo con datos de muestra". DemoBadge va en la
// cabecera (siempre visible); DemoNote es un aviso en línea para las páginas que
// muestran desempeño/causalidad (modelo, evidencia), para que nada sintético se
// lea como un hecho de producción.
"use client";

import { useTranslations } from "next-intl";
import { FlaskConical, Info } from "lucide-react";

export function DemoBadge() {
  const t = useTranslations("demo");
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-line-2 bg-surface-bg px-2 py-0.5 text-micro font-medium text-ink-2"
      title={t("badgeHint")}
    >
      <FlaskConical className="h-3 w-3 text-ink-3" />
      {t("badge")}
    </span>
  );
}

export function DemoNote({ text }: { text: string }) {
  return (
    <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-risk-est/25 bg-risk-est/5 px-4 py-3">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-risk-est" />
      <p className="text-copy leading-relaxed text-ink-2">{text}</p>
    </div>
  );
}
