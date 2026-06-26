// components/landing/about-section.tsx
// Sección "Quiénes somos": la tesis fundacional + una tarjeta de marca/misión
// genérica (sin nombre ni correo personal) — apropiada para un demo público.
import { getTranslations } from "next-intl/server";
import { Reveal } from "./reveal";
import { BrandMark } from "@/components/brand-mark";

export async function AboutSection() {
  const t = await getTranslations("about");

  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-[1120px] px-5 py-16 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:gap-12">
          <Reveal>
            <div>
              <span className="text-copy font-semibold uppercase tracking-wide text-risk-est">{t("eyebrow")}</span>
              <h2 className="mt-2 text-title font-semibold tracking-tight text-ink-1">{t("title")}</h2>
              <div className="mt-4 space-y-3 text-body leading-relaxed text-ink-2">
                <p>{t("p1")}</p>
                <p>{t("p2")}</p>
                <p className="font-medium text-ink-1">{t("p3")}</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="rounded-2xl border border-line bg-surface-bg/60 p-6">
              <div className="flex items-center gap-3">
                <BrandMark size={36} className="shrink-0" />
                <div className="text-body font-semibold text-ink-1">{t("team")}</div>
              </div>
              <p className="mt-4 text-copy leading-relaxed text-ink-2">{t("founderLine")}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
