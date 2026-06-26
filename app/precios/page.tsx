// app/precios/page.tsx
// Precios públicos (open-core): Core (gratis/OSS), Pro y Enterprise. Página de
// marketing fuera del grupo (app). Los precios van marcados como ILUSTRATIVOS —
// el modelo de negocio para inversionistas, sin afirmar tarifas como un hecho.
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Check, ArrowRight } from "lucide-react";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Reveal } from "@/components/landing/reveal";

export default async function PricingPage() {
  const t = await getTranslations("pricing");

  const tiers = [1, 2, 3].map((n) => ({
    n,
    featured: n === 2,
    name: t(`t${n}Name`),
    price: t(`t${n}Price`),
    unit: t(`t${n}Unit`),
    desc: t(`t${n}Desc`),
    cta: t(`t${n}Cta`),
    badge: n === 2 ? t("t2Badge") : null,
    features: [1, 2, 3, 4, 5].map((i) => t(`t${n}f${i}`)),
  }));

  return (
    <div className="min-h-screen bg-surface-bg">
      <LandingNav />

      <section className="mx-auto max-w-[1120px] px-5 pb-6 pt-14 text-center sm:px-6">
        <Reveal>
          <span className="text-copy font-semibold uppercase tracking-wide text-risk-sol">{t("eyebrow")}</span>
          <h1 className="mx-auto mt-2 max-w-2xl text-title font-semibold tracking-tight text-ink-1 sm:text-display">{t("title")}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-body leading-relaxed text-ink-2">{t("subtitle")}</p>
          <p className="mt-3 text-meta text-ink-3">{t("illustrative")}</p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-[1120px] px-5 pb-20 sm:px-6">
        <div className="grid items-start gap-5 lg:grid-cols-3">
          {tiers.map((tier, i) => (
            <Reveal key={tier.n} delay={i * 80}>
              <div
                className={`flex h-full flex-col rounded-2xl border bg-surface p-6 ${
                  tier.featured
                    ? "border-risk-sol/40 shadow-[0_24px_64px_-28px_rgba(91,110,245,0.5)]"
                    : "border-line"
                }`}
              >
                <div className="flex items-center gap-2">
                  <h2 className="text-subhead font-semibold tracking-tight text-ink-1">{tier.name}</h2>
                  {tier.badge && (
                    <span className="rounded-full bg-risk-sol px-2 py-0.5 text-micro font-semibold text-white">{tier.badge}</span>
                  )}
                </div>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-title font-bold tracking-tight text-ink-1">{tier.price}</span>
                  <span className="text-meta text-ink-3">{tier.unit}</span>
                </div>
                <p className="mt-2 text-copy leading-relaxed text-ink-2">{tier.desc}</p>

                <ul className="mt-5 flex-1 space-y-2.5">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-copy text-ink-1">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-risk-sol" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/dashboard"
                  className={`mt-6 inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-body font-medium transition-colors ${
                    tier.featured
                      ? "bg-risk-sol text-white hover:bg-risk-sol/90"
                      : "border border-line-2 bg-surface text-ink-1 hover:border-risk-sol hover:text-risk-sol"
                  }`}
                >
                  {tier.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
