// components/landing/landing-nav.tsx
// Nav público de la landing. En móvil los enlaces se colapsan en un menú
// (hamburguesa) — la mayoría del tráfico de un post de LinkedIn es móvil.
"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Menu, X } from "lucide-react";
import { LanguageSwitcher } from "@/components/shell/language-switcher";
import { BrandMark } from "@/components/brand-mark";

export function LandingNav() {
  const t = useTranslations("landing");
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/#features", label: t("navFeatures") },
    { href: "/casos", label: t("navCases") },
    { href: "/docs", label: t("navDocs") },
    { href: "/precios", label: t("navPricing") },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-line/60 bg-surface/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center px-5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 text-subhead font-semibold tracking-tight">
          <BrandMark size={26} className="shrink-0" />
          Soral
        </Link>
        <nav className="ml-9 hidden items-center gap-6 text-copy text-ink-2 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-ink-1">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher />
          <Link
            href="/dashboard"
            className="hidden items-center gap-1.5 rounded-full bg-risk-sol px-4 py-1.5 text-copy font-medium text-white transition-colors hover:bg-risk-sol/90 sm:inline-flex"
          >
            {t("navCta")}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            aria-label={t("navMenu")}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="-mr-1 flex h-9 w-9 items-center justify-center rounded-lg text-ink-2 hover:bg-surface-2 md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-surface md:hidden">
          <nav className="mx-auto flex max-w-[1120px] flex-col gap-0.5 px-3 py-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-body font-medium text-ink-1 transition-colors hover:bg-surface-2"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-risk-sol px-4 py-2.5 text-body font-medium text-white"
            >
              {t("navCta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
