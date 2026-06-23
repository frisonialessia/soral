// components/shell/language-switcher.tsx
// Cambia el locale escribiendo la cookie `locale` y refrescando los Server
// Components (el provider re-lee los mensajes). TODO(supabase): persistir además
// en el perfil del usuario.
"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Check, Globe } from "lucide-react";
import { locales, localeNames, type Locale } from "@/i18n/config";

export function LanguageSwitcher() {
  const t = useTranslations("header");
  const active = useLocale() as Locale;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function change(next: Locale) {
    setOpen(false);
    if (next === active) return;
    document.cookie = `locale=${next};path=/;max-age=31536000;samesite=lax`;
    startTransition(() => router.refresh());
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("language")}
        disabled={isPending}
        className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-copy text-ink-2 hover:bg-surface-2 hover:text-ink-1 disabled:opacity-50"
      >
        <Globe className="h-[18px] w-[18px]" />
        <span className="hidden uppercase sm:inline">{active}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" aria-hidden="true" onClick={() => setOpen(false)} />
          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 w-44 rounded-lg border border-line bg-surface p-1 shadow-lg"
          >
            {locales.map((loc) => (
              <button
                key={loc}
                role="menuitemradio"
                aria-checked={loc === active}
                onClick={() => change(loc)}
                className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-copy text-ink-1 hover:bg-surface-2"
              >
                {localeNames[loc]}
                {loc === active && <Check className="h-4 w-4 text-risk-sol" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
