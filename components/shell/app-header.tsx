// components/shell/app-header.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, LogOut, User } from "lucide-react";
import { useSession, signOut } from "@/lib/auth/session";
import { usePlantProfile } from "@/lib/queries";
import { LanguageSwitcher } from "./language-switcher";
import { AskSoral } from "./ask-soral";
import { DemoBadge } from "@/components/demo-indicator";

export function AppHeader({ onMenu }: { onMenu: () => void }) {
  const user = useSession();
  const { data: plant } = usePlantProfile();
  const t = useTranslations("header");
  const tr = useTranslations("roles");
  const [open, setOpen] = useState(false);

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface px-4 sm:px-6">
      <button
        onClick={onMenu}
        aria-label={t("openNav")}
        className="-ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-ink-2 hover:bg-surface-2 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate text-body font-semibold text-ink-1">{plant?.name ?? user.tenantName}</span>
          <DemoBadge />
        </div>
        <div className="text-meta text-ink-3">{t("week", { week: 24, year: 2026 })}</div>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <AskSoral />
        <LanguageSwitcher />

        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={open}
            className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 hover:bg-surface-2"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-risk-sol text-meta font-bold text-white">
              {initials}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-copy font-medium text-ink-1">{user.name}</span>
              <span className="block text-micro text-ink-3">{tr(user.role)}</span>
            </span>
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-40" aria-hidden="true" onClick={() => setOpen(false)} />
              <div
                role="menu"
                className="absolute right-0 z-50 mt-2 w-52 rounded-lg border border-line bg-surface p-1 shadow-lg"
              >
                <div className="px-3 py-2 sm:hidden">
                  <div className="text-copy font-medium text-ink-1">{user.name}</div>
                  <div className="text-micro text-ink-3">{tr(user.role)}</div>
                </div>
                <button
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-copy text-ink-1 hover:bg-surface-2"
                >
                  <User className="h-4 w-4 text-ink-3" /> {t("profile")}
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    signOut();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-copy text-ink-1 hover:bg-surface-2"
                >
                  <LogOut className="h-4 w-4 text-ink-3" /> {t("signOut")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
