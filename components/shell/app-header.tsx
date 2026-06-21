// components/shell/app-header.tsx
"use client";

import { useState } from "react";
import { Menu, LogOut, User } from "lucide-react";
import { useSession, signOut } from "@/lib/auth/session";
import { ROLE_LABEL } from "@/lib/auth/roles";

export function AppHeader({ onMenu }: { onMenu: () => void }) {
  const user = useSession();
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
        aria-label="Abrir navegación"
        className="-ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-ink-2 hover:bg-surface-2 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-ink-1">{user.tenantName}</div>
        <div className="text-[11.5px] text-ink-3">Semana 24 · 2026</div>
      </div>

      <div className="relative ml-auto">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={open}
          className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 hover:bg-surface-2"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-risk-sol text-[12px] font-bold text-white">
            {initials}
          </span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-[13px] font-medium text-ink-1">{user.name}</span>
            <span className="block text-[11px] text-ink-3">{ROLE_LABEL[user.role]}</span>
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
                <div className="text-[13px] font-medium text-ink-1">{user.name}</div>
                <div className="text-[11px] text-ink-3">{ROLE_LABEL[user.role]}</div>
              </div>
              <button
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[13px] text-ink-1 hover:bg-surface-2"
              >
                <User className="h-4 w-4 text-ink-3" /> Perfil
              </button>
              <button
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  signOut();
                }}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[13px] text-ink-1 hover:bg-surface-2"
              >
                <LogOut className="h-4 w-4 text-ink-3" /> Cerrar sesión
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
