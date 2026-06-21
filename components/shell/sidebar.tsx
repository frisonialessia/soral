// components/shell/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { LayoutDashboard, BarChart3, Plug, Settings } from "lucide-react";
import { Can } from "@/components/auth/can";
import { BrandMark } from "@/components/brand-mark";
import type { Permission } from "@/lib/auth/roles";

interface NavItem {
  href: string;
  labelKey: "dashboard" | "reports" | "integrations" | "admin";
  icon: typeof LayoutDashboard;
  permission: Permission;
  exact?: boolean;
}

const NAV: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard, permission: "dashboard.view", exact: true },
  { href: "/reportes", labelKey: "reports", icon: BarChart3, permission: "reports.view" },
  { href: "/integraciones", labelKey: "integrations", icon: Plug, permission: "integrations.view" },
  { href: "/admin", labelKey: "admin", icon: Settings, permission: "admin.view" },
];

export function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const t = useTranslations("nav");

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
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-3 px-5 py-[18px] text-[16px] font-semibold tracking-tight"
        >
          <BrandMark size={28} className="shrink-0" />
          Soral
        </Link>

        <nav className="flex flex-1 flex-col gap-0.5 px-3 py-2" aria-label={t("primary")}>
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
                  {t(item.labelKey)}
                </Link>
              </Can>
            );
          })}
        </nav>

        <div className="px-5 py-4 text-[11px] text-ink-3">{t("version")}</div>
      </aside>
    </>
  );
}
