// app/privacidad/page.tsx
// Aviso de privacidad (estructura LFPDPPP México). Página pública de marketing.
// Honesto sobre el demo: el sitio no recopila datos de visitantes; el aviso describe
// cómo Soral trata los datos al desplegarse con un cliente.
import { getTranslations } from "next-intl/server";
import { Info } from "lucide-react";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Reveal } from "@/components/landing/reveal";

export default async function PrivacyPage() {
  const t = await getTranslations("privacy");
  const sections = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ title: t(`s${n}Title`), body: t(`s${n}Body`) }));

  return (
    <div className="min-h-screen bg-surface-bg">
      <LandingNav />

      <section className="mx-auto max-w-[760px] px-5 pb-6 pt-14 sm:px-6">
        <Reveal>
          <h1 className="text-title font-semibold tracking-tight text-ink-1 sm:text-display">{t("title")}</h1>
          <p className="mt-3 text-body leading-relaxed text-ink-2">{t("subtitle")}</p>
          <p className="mt-2 text-meta text-ink-3">{t("updated")}</p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-[760px] px-5 pb-20 sm:px-6">
        <Reveal>
          <div className="flex items-start gap-2.5 rounded-xl border border-risk-est/25 bg-risk-est/5 px-4 py-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-risk-est" />
            <p className="text-copy leading-relaxed text-ink-2">{t("demoNote")}</p>
          </div>
        </Reveal>

        <div className="mt-8 space-y-8">
          {sections.map((s) => (
            <Reveal key={s.title}>
              <div>
                <h2 className="text-subhead font-semibold tracking-tight text-ink-1">{s.title}</h2>
                <p className="mt-2 text-body leading-relaxed text-ink-2">{s.body}</p>
              </div>
            </Reveal>
          ))}

          <Reveal>
            <div className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-subhead font-semibold tracking-tight text-ink-1">{t("contactTitle")}</h2>
              <p className="mt-2 text-body leading-relaxed text-ink-2">{t("contactBody")}</p>
            </div>
          </Reveal>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
