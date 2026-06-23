// components/model/confidence-tag.tsx
// Chip de confianza del modelo para un score. Reutilizable (perfil, modal).
"use client";

import { useTranslations } from "next-intl";
import { confidenceOf, type ConfidenceLevel } from "@/lib/model";

const COLOR: Record<ConfidenceLevel, string> = {
  high: "#5B6EF5",
  medium: "#B49AED",
  low: "#E59BB0",
};

export function ConfidenceTag({ score }: { score: number }) {
  const t = useTranslations("model");
  const { level, pct } = confidenceOf(score);
  const color = COLOR[level];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ background: `${color}1A`, color }}
      title={t("confTitle")}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {t(`conf_${level}`)} · {pct}%
    </span>
  );
}
