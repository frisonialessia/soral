// components/landing/landing-footer.tsx
// Footer público compartido por la landing, /docs y /casos. Mantiene consistencia
// y evita duplicar el markup en cada página de marketing.
"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { BrandMark } from "@/components/brand-mark";

export function LandingFooter() {
  const t = useTranslations("landing");
  const tn = useTranslations("nav");

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-[1120px] px-5 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5 text-subhead font-semibold tracking-tight text-ink-1">
              <BrandMark size={24} className="shrink-0" />
              Soral
            </div>
            <p className="mt-3 max-w-xs text-copy leading-relaxed text-ink-2">{t("footerTagline")}</p>
            <p className="mt-4 text-meta text-ink-3">{t("positioning")}</p>
          </div>
          <div>
            <h4 className="text-micro font-semibold uppercase tracking-wide text-ink-3">{t("footerProduct")}</h4>
            <ul className="mt-3 space-y-2 text-copy text-ink-2">
              <li><Link href="/dashboard" className="transition-colors hover:text-risk-sol">{tn("dashboard")}</Link></li>
              <li><Link href="/reportes" className="transition-colors hover:text-risk-sol">{tn("reports")}</Link></li>
              <li><Link href="/modelo" className="transition-colors hover:text-risk-sol">{tn("model")}</Link></li>
              <li><Link href="/gobernanza" className="transition-colors hover:text-risk-sol">{tn("governance")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-micro font-semibold uppercase tracking-wide text-ink-3">{t("footerGetStarted")}</h4>
            <ul className="mt-3 space-y-2 text-copy text-ink-2">
              <li><Link href="/docs" className="transition-colors hover:text-risk-sol">{t("navDocs")}</Link></li>
              <li><Link href="/casos" className="transition-colors hover:text-risk-sol">{t("navCases")}</Link></li>
              <li><Link href="/precios" className="transition-colors hover:text-risk-sol">{t("navPricing")}</Link></li>
              <li><Link href="/dashboard" className="transition-colors hover:text-risk-sol">{t("ctaPrimary")}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-line pt-6 sm:flex-row">
          <p className="text-meta text-ink-3">{t("rights")}</p>
          <div className="flex items-center gap-4">
            <Link href="/privacidad" className="text-meta text-ink-3 transition-colors hover:text-risk-sol">{t("navPrivacy")}</Link>
            <p className="text-meta text-ink-3">{t("badge")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
