// components/landing/landing-nav.tsx
"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { LanguageSwitcher } from "@/components/shell/language-switcher";
import { BrandMark } from "@/components/brand-mark";

export function LandingNav() {
  const t = useTranslations("landing");

  return (
    <header className="sticky top-0 z-30 border-b border-line/60 bg-surface/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center px-5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 text-[17px] font-semibold tracking-tight">
          <BrandMark size={26} className="shrink-0" />
          Soral
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher />
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full bg-risk-sol px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-risk-sol/90"
          >
            {t("navCta")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
