// components/shell/app-shell.tsx
// Esqueleto de la app: barra lateral + cabecera + contenido. Responsive — en
// móvil la barra lateral es un drawer que abre la cabecera.
"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { AppHeader } from "./app-header";

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen md:flex">
      <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader onMenu={() => setMobileNavOpen(true)} />
        <main className="mx-auto w-full max-w-[1120px] flex-1 px-4 sm:px-6 lg:px-[30px]">
          {children}
        </main>
      </div>
    </div>
  );
}
