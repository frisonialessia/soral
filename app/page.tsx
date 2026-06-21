// app/page.tsx
// Landing pública de Soral (estilo Linear, paleta clara con acentos de gradiente).
// Vive fuera del route group (app), así que NO lleva el shell de la app. Muestra
// el dashboard real en simulación para que se vean las herramientas.
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Map, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { LandingNav } from "@/components/landing/landing-nav";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { Reveal } from "@/components/landing/reveal";

export default async function LandingPage() {
  const t = await getTranslations("landing");

  const metrics = [
    { value: t("m1Value"), label: t("m1Label") },
    { value: t("m2Value"), label: t("m2Label") },
    { value: t("m3Value"), label: t("m3Label") },
    { value: t("m4Value"), label: t("m4Label") },
  ];
  const features = [
    { icon: Map, title: t("f1Title"), desc: t("f1Desc") },
    { icon: Sparkles, title: t("f2Title"), desc: t("f2Desc") },
    { icon: Zap, title: t("f3Title"), desc: t("f3Desc") },
    { icon: ShieldCheck, title: t("f4Title"), desc: t("f4Desc") },
  ];
  const steps = [
    { title: t("step1Title"), desc: t("step1Desc") },
    { title: t("step2Title"), desc: t("step2Desc") },
    { title: t("step3Title"), desc: t("step3Desc") },
  ];

  return (
    <div className="min-h-screen bg-surface-bg">
      <LandingNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[-120px] h-[620px] w-[1000px] max-w-none -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(closest-side, #8476FF, #E59BB0 55%, transparent)" }}
        />
        <div className="animate-fade relative mx-auto max-w-[1120px] px-5 pb-12 pt-16 text-center sm:px-6 sm:pt-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-surface px-3.5 py-1.5 text-[12.5px] text-ink-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: "conic-gradient(from 180deg,#5B6EF5,#E59BB0,#EB4F6C,#5B6EF5)" }}
            />
            {t("badge")}
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold leading-[1.06] tracking-tight text-ink-1 sm:text-5xl lg:text-[56px]">
            {t("title")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-ink-2 sm:text-lg">{t("subtitle")}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full bg-risk-sol px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-risk-sol/90"
            >
              {t("ctaPrimary")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-1.5 rounded-full border border-line-2 bg-surface px-5 py-2.5 text-[14px] font-medium text-ink-1 transition-colors hover:border-risk-sol hover:text-risk-sol"
            >
              {t("ctaSecondary")}
            </a>
          </div>
          <p className="mt-6 text-[12.5px] text-ink-3">{t("positioning")}</p>
        </div>

        {/* Simulación del producto */}
        <div className="relative mx-auto max-w-[980px] px-5 pb-16 sm:px-6">
          <Reveal>
            <DashboardPreview />
          </Reveal>
        </div>
      </section>

      {/* Banda de métricas (capacidades del producto) */}
      <Reveal>
        <section className="border-y border-line bg-surface">
          <div className="mx-auto grid max-w-[1120px] grid-cols-2 gap-6 px-5 py-10 sm:grid-cols-4 sm:px-6">
            {metrics.map((m) => (
              <div key={m.label} className="text-center sm:text-left">
                <div className="font-mono text-[26px] font-semibold tracking-tight text-ink-1 sm:text-[30px]">
                  {m.value}
                </div>
                <div className="mt-1 text-[12.5px] text-ink-2">{m.label}</div>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Features */}
      <section id="features" className="mx-auto max-w-[1120px] scroll-mt-20 px-5 py-16 sm:px-6">
        <Reveal>
          <div className="max-w-2xl">
            <h2 className="text-[28px] font-semibold tracking-tight text-ink-1">{t("featuresTitle")}</h2>
            <p className="mt-2 text-[15px] text-ink-2">{t("featuresSubtitle")}</p>
          </div>
        </Reveal>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal key={f.title} delay={i * 80}>
                <div className="h-full rounded-xl border border-line bg-surface p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-risk-sol-soft text-risk-sol">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <h3 className="mt-4 text-[15px] font-semibold text-ink-1">{f.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">{f.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[1120px] px-5 py-16 sm:px-6">
          <Reveal>
            <div className="max-w-2xl">
              <h2 className="text-[28px] font-semibold tracking-tight text-ink-1">{t("howTitle")}</h2>
              <p className="mt-2 text-[15px] text-ink-2">{t("howSubtitle")}</p>
            </div>
          </Reveal>
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 100}>
                <div className="h-full rounded-xl border border-line bg-surface-bg p-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-risk-sol font-mono text-[14px] font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 text-[15px] font-semibold text-ink-1">{s.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA de cierre */}
      <section className="mx-auto max-w-[1120px] px-5 py-16 sm:px-6">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-2xl border border-line px-6 py-12 text-center sm:py-14"
            style={{ background: "linear-gradient(120deg, rgba(91,110,245,0.10), rgba(229,155,176,0.12))" }}
          >
            <h2 className="text-[26px] font-semibold tracking-tight text-ink-1 sm:text-[30px]">{t("ctaTitle")}</h2>
            <p className="mx-auto mt-2 max-w-xl text-[15px] text-ink-2">{t("ctaSubtitle")}</p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-risk-sol px-6 py-3 text-[14px] font-medium text-white transition-colors hover:bg-risk-sol/90"
            >
              {t("ctaButton")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1120px] flex-col items-center justify-between gap-3 px-5 py-8 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight">
            <span
              className="h-6 w-6 rounded-full"
              style={{ background: "conic-gradient(from 180deg,#5B6EF5,#8476FF,#E59BB0,#EB4F6C,#5B6EF5)" }}
            />
            Soral
          </div>
          <p className="text-[12.5px] text-ink-3">{t("footerTagline")}</p>
          <p className="text-[12.5px] text-ink-3">{t("rights")}</p>
        </div>
      </footer>
    </div>
  );
}
