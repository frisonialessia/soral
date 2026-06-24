// app/docs/page.tsx
// Documentación pública de Soral. Página de marketing/explicación (fuera del grupo
// (app), sin shell): nav + secciones con TOC fijo + footer compartido.
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Reveal } from "@/components/landing/reveal";

export default async function DocsPage() {
  const t = await getTranslations("docs");
  const tl = await getTranslations("landing");

  const sections = [1, 2, 3, 4, 5, 6].map((n) => ({
    id: `s${n}`,
    title: t(`sec${n}Title`),
    body: t(`sec${n}Body`),
  }));

  return (
    <div className="min-h-screen bg-surface-bg">
      <LandingNav />

      <section className="mx-auto max-w-[1120px] px-5 pb-8 pt-14 sm:px-6">
        <Reveal>
          <span className="text-copy font-semibold uppercase tracking-wide text-risk-sol">{tl("navDocs")}</span>
          <h1 className="mt-2 text-title font-semibold tracking-tight text-ink-1 sm:text-display">{t("title")}</h1>
          <p className="mt-3 max-w-2xl text-body leading-relaxed text-ink-2">{t("subtitle")}</p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-[1120px] px-5 pb-20 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[210px_1fr]">
          {/* Índice fijo */}
          <nav aria-label={t("toc")} className="hidden lg:block">
            <div className="sticky top-24">
              <div className="text-micro font-semibold uppercase tracking-wide text-ink-3">{t("toc")}</div>
              <ul className="mt-3 space-y-2 text-copy text-ink-2">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="transition-colors hover:text-risk-sol">{s.title}</a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Contenido */}
          <div className="max-w-2xl">
            <div className="space-y-10">
              {sections.map((s) => (
                <Reveal key={s.id}>
                  <div id={s.id} className="scroll-mt-24">
                    <h2 className="text-heading font-semibold tracking-tight text-ink-1">{s.title}</h2>
                    <p className="mt-2 text-body leading-relaxed text-ink-2">{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <div
                className="mt-12 rounded-2xl border border-line px-6 py-8"
                style={{ background: "linear-gradient(120deg, rgba(91,110,245,0.10), rgba(229,155,176,0.12))" }}
              >
                <h3 className="text-subhead font-semibold tracking-tight text-ink-1">{t("ctaTitle")}</h3>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 rounded-full bg-risk-sol px-5 py-2.5 text-body font-medium text-white transition-colors hover:bg-risk-sol/90"
                  >
                    {tl("ctaButton")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/casos"
                    className="inline-flex items-center gap-1.5 rounded-full border border-line-2 bg-surface px-5 py-2.5 text-body font-medium text-ink-1 transition-colors hover:border-risk-sol hover:text-risk-sol"
                  >
                    {tl("navCases")}
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
