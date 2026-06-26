// components/landing/market-section.tsx
// "La oportunidad": el tamaño del problema a escala de industria, con cifras REALES
// y con fuente (INEGI + reportes/investigación). Es la sección que un inversionista
// busca — por qué esto es grande — sin inventar tracción ni un TAM falso.
import { getTranslations } from "next-intl/server";
import { Reveal } from "./reveal";

const SOURCES = [
  { key: "srcInegi", href: "https://en.www.inegi.org.mx/programas/immex/" },
  { key: "srcTurnover", href: "https://www.tecma.com/turnover-of-maquiladora-industry-workers-mexico/" },
  { key: "srcCost", href: "https://www.qualtrics.com/articles/employee-experience/cost-of-employee-turnover/" },
] as const;

export async function MarketSection() {
  const t = await getTranslations("market");

  const stats = [
    { value: t("s1Value"), label: t("s1Label"), color: "#5B6EF5" },
    { value: t("s2Value"), label: t("s2Label"), color: "#8476FF" },
    { value: t("s3Value"), label: t("s3Label"), color: "#E59BB0" },
    { value: t("s4Value"), label: t("s4Label"), color: "#EB4F6C" },
  ];

  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-[1120px] px-5 py-16 sm:px-6">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-copy font-semibold uppercase tracking-wide text-risk-est">{t("eyebrow")}</span>
            <h2 className="mt-2 text-title font-semibold tracking-tight text-ink-1">{t("title")}</h2>
            <p className="mt-2 text-body leading-relaxed text-ink-2">{t("subtitle")}</p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-line bg-surface-bg/60 p-6 text-center sm:text-left">
                <div className="font-sans text-display font-bold tracking-tight" style={{ color: s.color }}>
                  {s.value}
                </div>
                <div className="mt-1.5 text-copy leading-relaxed text-ink-2">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={150}>
          <p className="mx-auto mt-8 max-w-3xl text-center text-body leading-relaxed text-ink-1">{t("closing")}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-meta text-ink-3">
            <span className="font-medium uppercase tracking-wide">{t("sources")}:</span>
            {SOURCES.map((s) => (
              <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" className="underline decoration-line-2 underline-offset-2 transition-colors hover:text-risk-sol">
                {t(s.key)}
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
