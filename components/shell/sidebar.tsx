// components/shell/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BarChart3, Plug, Settings } from "lucide-react";
import { Can } from "@/components/auth/can";
import type { Permission } from "@/lib/auth/roles";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission: Permission;
  exact?: boolean;
}

const NAV: NavItem[] = [
  { href: "/", label: "Panel", icon: LayoutDashboard, permission: "dashboard.view", exact: true },
  { href: "/reportes", label: "Reportes", icon: BarChart3, permission: "reports.view" },
  { href: "/integraciones", label: "Integraciones", icon: Plug, permission: "integrations.view" },
  { href: "/admin", label: "Administración", icon: Settings, permission: "admin.view" },
];

export function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          aria-hidden="true"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 transform flex-col border-r border-line bg-surface transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 px-5 py-[18px] text-[16px] font-semibold tracking-tight"
        >
          <span
            className="h-[30px] w-[30px] shrink-0 rounded-full"
            style={{
              background: "conic-gradient(from 180deg,#5B6EF5,#8476FF,#E59BB0,#EB4F6C,#5B6EF5)",
            }}
          />
          Soral
        </Link>

        <nav className="flex flex-1 flex-col gap-0.5 px-3 py-2" aria-label="Navegación principal">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Can key={item.href} permission={item.permission}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] transition-colors ${
                    active
                      ? "bg-surface-2 font-medium text-ink-1"
                      : "text-ink-2 hover:bg-surface-2 hover:text-ink-1"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {item.label}
                </Link>
              </Can>
            );
          })}
        </nav>

        <div className="px-5 py-4 text-[11px] text-ink-3">Soral · v0.1</div>
      </aside>
    </>
  );
}
