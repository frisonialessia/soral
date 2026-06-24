// components/landing/before-after.tsx
// Sección "Antes vs Después" de la landing — reemplaza al simulador what-if (que ya
// vive dentro de la demo del dashboard). Dos columnas contrastadas: la misma semana
// SIN Soral (renuncia sorpresa, costo) vs CON Soral (alerta, plan, retención). Es
// 100% diseño: no requiere foto ni video. Componente de servidor.
import { getTranslations } from "next-intl/server";
import { X, Check, ArrowRight } from "lucide-react";
import { Reveal } from "./reveal";

export async function BeforeAfter() {
  const t = await getTranslations("landing");
  const before = [t("baBefore1"), t("baBefore2"), t("baBefore3"), t("baBefore4")];
  const after = [t("baAfter1"), t("baAfter2"), t("baAfter3"), t("baAfter4")];

  return (
    <section className="mx-auto max-w-[1120px] px-5 py-16 sm:px-6">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-copy font-semibold uppercase tracking-wide text-risk-cri">{t("baEyebrow")}</span>
          <h2 className="mt-2 text-title font-semibold tracking-tight text-ink-1">{t("baTitle")}</h2>
          <p className="mt-2 text-body text-ink-2">{t("baSubtitle")}</p>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <div className="mt-9 grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
          {/* Sin Soral — el costo de no ver venir la salida */}
          <div className="rounded-2xl border border-line bg-surface p-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-risk-cri/10 text-risk-cri">
                <X className="h-4 w-4" />
              </span>
              <span className="text-body font-semibold text-ink-1">{t("baBeforeTitle")}</span>
            </div>
            <ul className="mt-4 space-y-3">
              {before.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-copy leading-relaxed text-ink-2">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-risk-cri" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Conector */}
          <div className="flex items-center justify-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink-3 shadow-sm">
              <ArrowRight className="h-4 w-4 rotate-90 md:rotate-0" />
            </span>
          </div>

          {/* Con Soral — la misma semana, otro final */}
          <div className="rounded-2xl border border-risk-sol/30 bg-gradient-to-br from-risk-sol-soft/60 via-surface to-surface p-6 shadow-[0_24px_64px_-32px_rgba(91,110,245,0.45)]">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-risk-sol text-white">
                <Check className="h-4 w-4" />
              </span>
              <span className="text-body font-semibold text-ink-1">{t("baAfterTitle")}</span>
            </div>
            <ul className="mt-4 space-y-3">
              {after.map((a) => (
                <li key={a} className="flex items-start gap-2.5 text-copy leading-relaxed text-ink-1">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-risk-sol" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
