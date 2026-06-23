// components/shell/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { LayoutDashboard, HardHat, ClipboardCheck, BarChart3, UserPlus, MessageSquareText, Plug, Settings, ShieldCheck, FlaskConical } from "lucide-react";
import { useSession } from "@/lib/auth/session";
import { can, type Permission } from "@/lib/auth/roles";
import { BrandMark } from "@/components/brand-mark";

type LabelKey =
  | "dashboard" | "floor" | "interventions" | "hiring"
  | "reports" | "evidence" | "voice" | "model"
  | "integrations" | "admin";

interface NavItem {
  href: string;
  labelKey: LabelKey;
  icon: typeof LayoutDashboard;
  permission: Permission;
  exact?: boolean;
}

// La navegación se agrupa por intención para que no sea una lista plana de 10:
// qué pasa (Dashboard) · qué hago (Operación) · qué aprendo (Inteligencia) ·
// cómo se configura (Sistema). Cada grupo se oculta entero si el rol no ve ninguno.
interface NavGroup {
  titleKey?: "groupOperations" | "groupIntelligence" | "groupSystem";
  items: NavItem[];
}

const GROUPS: NavGroup[] = [
  {
    items: [{ href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard, permission: "dashboard.view", exact: true }],
  },
  {
    titleKey: "groupOperations",
    items: [
      { href: "/piso", labelKey: "floor", icon: HardHat, permission: "recommendations.assign" },
      { href: "/seguimiento", labelKey: "interventions", icon: ClipboardCheck, permission: "recommendations.assign" },
      { href: "/pre-contratacion", labelKey: "hiring", icon: UserPlus, permission: "hiring.view" },
    ],
  },
  {
    titleKey: "groupIntelligence",
    items: [
      { href: "/reportes", labelKey: "reports", icon: BarChart3, permission: "reports.view" },
      { href: "/evidencia", labelKey: "evidence", icon: FlaskConical, permission: "reports.view" },
      { href: "/voz-del-empleado", labelKey: "voice", icon: MessageSquareText, permission: "voice.view" },
      { href: "/modelo", labelKey: "model", icon: ShieldCheck, permission: "dashboard.view" },
    ],
  },
  {
    titleKey: "groupSystem",
    items: [
      { href: "/integraciones", labelKey: "integrations", icon: Plug, permission: "integrations.view" },
      { href: "/admin", labelKey: "admin", icon: Settings, permission: "admin.view" },
    ],
  },
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
  const user = useSession();

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

        <nav className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 py-2" aria-label={t("primary")}>
          {GROUPS.map((group, i) => {
            const visible = group.items.filter((item) => can(user.role, item.permission));
            if (visible.length === 0) return null;
            return (
              <div key={group.titleKey ?? `g${i}`} className="flex flex-col gap-0.5">
                {group.titleKey && (
                  <div className="px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-ink-3">
                    {t(group.titleKey)}
                  </div>
                )}
                {visible.map((item) => {
                  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
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
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="px-5 py-4 text-[11px] text-ink-3">{t("version")}</div>
      </aside>
    </>
  );
}
