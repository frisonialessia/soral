// app/casos/page.tsx
// Casos de uso públicos de Soral. Página de marketing (fuera del grupo (app)):
// nav + grid de casos + footer compartido. Cada caso mapea a una capacidad real
// del producto (operación, pre-contratación, voz, evidencia, gobernanza).
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, HardHat, UserPlus, MessageSquareText, FlaskConical, Scale } from "lucide-react";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Reveal } from "@/components/landing/reveal";

// Cada caso toma un color del ramp de riesgo (acentos multicolor).
const CASES = [
  { n: 1, icon: HardHat, color: "#5B6EF5" },
  { n: 2, icon: UserPlus, color: "#8476FF" },
  { n: 3, icon: MessageSquareText, color: "#B49AED" },
  { n: 4, icon: FlaskConical, color: "#E59BB0" },
  { n: 5, icon: Scale, color: "#EB4F6C" },
] as const;

export default async function CasesPage() {
  const t = await getTranslations("cases");
  const tl = await getTranslations("landing");

  return (
    <div className="min-h-screen bg-surface-bg">
      <LandingNav />

      <section className="mx-auto max-w-[1120px] px-5 pb-8 pt-14 sm:px-6">
        <Reveal>
          <span className="text-copy font-semibold uppercase tracking-wide text-risk-sol">{tl("navCases")}</span>
          <h1 className="mt-2 text-title font-semibold tracking-tight text-ink-1 sm:text-display">{t("title")}</h1>
          <p className="mt-3 max-w-2xl text-body leading-relaxed text-ink-2">{t("subtitle")}</p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-[1120px] px-5 pb-16 sm:px-6">
        <div className="grid gap-5 md:grid-cols-2">
          {CASES.map(({ n, icon: Icon, color }, i) => (
            <Reveal key={n} delay={i * 70}>
              <div className="h-full rounded-2xl border border-line bg-surface p-6 transition-shadow hover:shadow-[0_16px_40px_-20px_rgba(43,45,66,0.3)]">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ color, background: `${color}1A` }}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="rounded-full bg-surface-bg px-2.5 py-1 text-micro font-semibold uppercase tracking-wide text-ink-3">
                    {t(`c${n}Tag`)}
                  </span>
                </div>
                <h3 className="mt-4 text-subhead font-semibold tracking-tight text-ink-1">{t(`c${n}Title`)}</h3>
                <p className="mt-2 text-body leading-relaxed text-ink-2">{t(`c${n}Body`)}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full bg-risk-sol px-6 py-3 text-body font-medium text-white transition-colors hover:bg-risk-sol/90"
            >
              {tl("ctaButton")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-1.5 rounded-full border border-line-2 bg-surface px-6 py-3 text-body font-medium text-ink-1 transition-colors hover:border-risk-sol hover:text-risk-sol"
            >
              {tl("ctaExplain")}
            </Link>
          </div>
        </Reveal>
      </section>

      <LandingFooter />
    </div>
  );
}
