// components/dashboard/estimate-badge.tsx
// Chip "estimación" para cualquier monto que dependa del costo de rotación cuando
// RH aún NO lo ha configurado. Con `link`, ofrece el atajo para ir a calcularlo.
// Así un peso en pantalla nunca se presenta como un hecho mientras sea estimación.
"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function EstimateBadge({ link = true, className = "" }: { link?: boolean; className?: string }) {
  const t = useTranslations("costModel");
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-surface-bg px-2 py-0.5 text-micro font-medium text-ink-3 ${className}`}
      title={t("estimateNote")}
    >
      {t("estBadge")}
      {link && (
        <>
          <span aria-hidden="true">·</span>
          <Link href="/admin" className="text-risk-sol hover:underline">
            {t("estAdjust")}
          </Link>
        </>
      )}
    </span>
  );
}
