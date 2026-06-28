// components/dashboard/estimate-badge.tsx
// Chip "estimación" para cualquier monto que dependa del costo de rotación cuando
// RH aún NO lo ha configurado. Con `link`, ofrece el atajo para ir a calcularlo.
// Así un peso en pantalla nunca se presenta como un hecho mientras sea estimación.
"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCan } from "@/components/auth/can";

export function EstimateBadge({ link = true, className = "" }: { link?: boolean; className?: string }) {
  const t = useTranslations("costModel");
  // El atajo a /admin solo si el rol actual puede entrar ahí; si no, sería un enlace
  // a una página prohibida. El chip "estimación" en sí siempre se muestra.
  const canAdmin = useCan("admin.view");
  const showLink = link && canAdmin;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-surface-bg px-2 py-0.5 text-micro font-medium text-ink-3 ${className}`}
      title={t("estimateNote")}
    >
      {t("estBadge")}
      {showLink && (
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
