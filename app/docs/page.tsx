// app/docs/page.tsx
// Documentación pública de Soral. Profunda a propósito (para revisión técnica de un
// inversionista o su asesor): metodología, el catálogo REAL de señales y fuentes
// (lib/model), un ejemplo de la API, y seguridad/compliance. TOC fijo + footer.
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Check } from "lucide-react";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Reveal } from "@/components/landing/reveal";
import { FEATURES, signalsOf } from "@/lib/model";

const API_EXAMPLE = `GET /api/plant/summary
{
  "highRisk": 86, "watch": 138, "stable": 956,
  "savingMxn": 3164800, "costEstimated": true,
  "topRisk": [
    { "ref": "#E7D9-6515", "score": 100, "band": "critico",
      "driver": "Retardos en aceleración", "line": "L3" }
  ]
}

GET /api/employees?line=L3&minScore=80&limit=20
{ "rows": [ /* … */ ], "total": 153, "limit": 20, "offset": 0 }`;

export default async function DocsPage() {
  const t = await getTranslations("docs");
  const tm = await getTranslations("model");
  const tl = await getTranslations("landing");

  const toc = [
    { id: "s1", title: t("sec1Title") },
    { id: "pipe", title: t("pipeTitle") },
    { id: "s2", title: t("sec2Title") },
    { id: "s3", title: t("sec3Title") },
    { id: "signals", title: t("sigTitle") },
    { id: "api", title: t("apiTitle") },
    { id: "s4", title: t("sec4Title") },
    { id: "s5", title: t("sec5Title") },
    { id: "s6", title: t("sec6Title") },
  ];

  const pipe = [t("pipe1"), t("pipe2"), t("pipe3"), t("pipe4"), t("pipe5"), t("pipe6")];
  const bullets = [t("sb1"), t("sb2"), t("sb3"), t("sb4"), t("sb5")];

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
          <nav aria-label={t("toc")} className="hidden lg:block">
            <div className="sticky top-24">
              <div className="text-micro font-semibold uppercase tracking-wide text-ink-3">{t("toc")}</div>
              <ul className="mt-3 space-y-2 text-copy text-ink-2">
                {toc.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="transition-colors hover:text-risk-sol">{s.title}</a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="max-w-2xl space-y-12">
            {/* 1 · Qué es */}
            <Reveal>
              <div id="s1" className="scroll-mt-24">
                <h2 className="text-heading font-semibold tracking-tight text-ink-1">{t("sec1Title")}</h2>
                <p className="mt-2 text-body leading-relaxed text-ink-2">{t("sec1Body")}</p>
              </div>
            </Reveal>

            {/* Pipeline */}
            <Reveal>
              <div id="pipe" className="scroll-mt-24">
                <h2 className="text-heading font-semibold tracking-tight text-ink-1">{t("pipeTitle")}</h2>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {pipe.map((step, i) => (
                    <div key={step} className="flex items-center gap-2">
                      <span className="rounded-lg border border-line bg-surface px-3 py-1.5 text-meta font-medium text-ink-1">{step}</span>
                      {i < pipe.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-ink-3" />}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* 2 · Cómo funciona */}
            <Reveal>
              <div id="s2" className="scroll-mt-24">
                <h2 className="text-heading font-semibold tracking-tight text-ink-1">{t("sec2Title")}</h2>
                <p className="mt-2 text-body leading-relaxed text-ink-2">{t("sec2Body")}</p>
              </div>
            </Reveal>

            {/* 3 · Modelo + SHAP */}
            <Reveal>
              <div id="s3" className="scroll-mt-24">
                <h2 className="text-heading font-semibold tracking-tight text-ink-1">{t("sec3Title")}</h2>
                <p className="mt-2 text-body leading-relaxed text-ink-2">{t("sec3Body")}</p>
                <pre className="mt-4 overflow-x-auto rounded-xl border border-line bg-surface p-4 font-mono text-meta text-ink-1">
{`p(salida 30d) = σ(β₀ + Σ βᵢ·xᵢ)
φᵢ = βᵢ · (xᵢ − baselineᵢ)        (SHAP exacto)
Σφᵢ = logit(final) − logit(base)`}
                </pre>
              </div>
            </Reveal>

            {/* Señales y fuentes (catálogo real) */}
            <Reveal>
              <div id="signals" className="scroll-mt-24">
                <h2 className="text-heading font-semibold tracking-tight text-ink-1">{t("sigTitle")}</h2>
                <p className="mt-2 text-body leading-relaxed text-ink-2">{t("sigIntro")}</p>
                <div className="mt-5 space-y-3">
                  {FEATURES.map((f) => (
                    <div key={f.id} className="rounded-xl border border-line bg-surface p-4">
                      <div className="text-copy font-semibold text-ink-1">{tm(`feat_${f.id}`)}</div>
                      <ul className="mt-1 divide-y divide-line">
                        {signalsOf(f.id).map((s) => (
                          <li key={s.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2 text-copy">
                            <span className="text-ink-1">{tm(`sig_${s.id}`)}</span>
                            <span className="flex items-center gap-2.5">
                              <span className="text-meta text-ink-3">{s.source}</span>
                              <span
                                className="rounded-full px-2 py-0.5 text-micro font-medium"
                                style={
                                  s.direction === "up"
                                    ? { color: "#EB4F6C", background: "#EB4F6C1a" }
                                    : { color: "#5B6EF5", background: "#5B6EF51a" }
                                }
                              >
                                {s.direction === "up" ? t("dirUp") : t("dirDown")}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* API */}
            <Reveal>
              <div id="api" className="scroll-mt-24">
                <h2 className="text-heading font-semibold tracking-tight text-ink-1">{t("apiTitle")}</h2>
                <p className="mt-2 text-body leading-relaxed text-ink-2">{t("apiIntro")}</p>
                <pre className="mt-4 overflow-x-auto rounded-xl border border-line bg-surface p-4 font-mono text-meta leading-relaxed text-ink-1">
{API_EXAMPLE}
                </pre>
              </div>
            </Reveal>

            {/* 4 · Planeación y evidencia */}
            <Reveal>
              <div id="s4" className="scroll-mt-24">
                <h2 className="text-heading font-semibold tracking-tight text-ink-1">{t("sec4Title")}</h2>
                <p className="mt-2 text-body leading-relaxed text-ink-2">{t("sec4Body")}</p>
              </div>
            </Reveal>

            {/* 5 · Gobernanza */}
            <Reveal>
              <div id="s5" className="scroll-mt-24">
                <h2 className="text-heading font-semibold tracking-tight text-ink-1">{t("sec5Title")}</h2>
                <p className="mt-2 text-body leading-relaxed text-ink-2">{t("sec5Body")}</p>
              </div>
            </Reveal>

            {/* 6 · Datos, integraciones y seguridad */}
            <Reveal>
              <div id="s6" className="scroll-mt-24">
                <h2 className="text-heading font-semibold tracking-tight text-ink-1">{t("sec6Title")}</h2>
                <p className="mt-2 text-body leading-relaxed text-ink-2">{t("sec6Body")}</p>
                <div className="mt-4 text-copy font-semibold text-ink-1">{t("secBulletsTitle")}</div>
                <ul className="mt-2 space-y-2">
                  {bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-body leading-relaxed text-ink-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-risk-sol" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal>
              <div
                className="mt-2 rounded-2xl border border-line px-6 py-8"
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
                    href="/precios"
                    className="inline-flex items-center gap-1.5 rounded-full border border-line-2 bg-surface px-5 py-2.5 text-body font-medium text-ink-1 transition-colors hover:border-risk-sol hover:text-risk-sol"
                  >
                    {tl("navPricing")}
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
