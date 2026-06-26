// components/landing/about-section.tsx
// Sección "Quiénes somos": la tesis fundacional (honesta, sin credenciales
// inventadas) + crédito de la fundadora con nombre y contacto reales. Da el ángulo
// humano/misión que un inversionista busca.
import { getTranslations } from "next-intl/server";
import { Mail } from "lucide-react";
import { Reveal } from "./reveal";

const FOUNDER = { name: "Demo Admin", email: "admin@soral.app", initials: "AF" };

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
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-risk-sol text-subhead font-bold text-white">
                  {FOUNDER.initials}
                </span>
                <div>
                  <div className="text-body font-semibold text-ink-1">{FOUNDER.name}</div>
                  <div className="text-copy text-ink-3">{t("founderRole")}</div>
                </div>
              </div>
              <p className="mt-4 text-copy leading-relaxed text-ink-2">{t("founderLine")}</p>
              <a
                href={`mailto:${FOUNDER.email}`}
                className="mt-4 inline-flex items-center gap-1.5 text-copy font-medium text-risk-sol transition-colors hover:text-risk-sol/80"
              >
                <Mail className="h-4 w-4" />
                {t("contact")}
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
