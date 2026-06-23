// components/shell/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { LayoutDashboard, HardHat, ClipboardCheck, BarChart3, UserPlus, MessageSquareText, Plug, Settings, ShieldCheck, FlaskConical, ListChecks, SlidersHorizontal } from "lucide-react";
import { useSession } from "@/lib/auth/session";
import { can, type Permission } from "@/lib/auth/roles";
import { BrandMark } from "@/components/brand-mark";

type LabelKey =
  | "dashboard" | "actionPlan" | "simulator"
  | "floor" | "interventions" | "hiring"
  | "reports" | "evidence" | "voice" | "model"
  | "integrations" | "admin";

interface NavItem {
  href: string;
  labelKey: LabelKey;
  icon: typeof LayoutDashboard;
  permission: Permission;
  exact?: boolean;
}

// La navegación se agrupa por intención para que no sea una lista plana:
// qué pasa (Dashboard) · qué planeo (Planeación) · qué hago (Operación) ·
// qué aprendo (Inteligencia) · cómo se configura (Sistema). Cada grupo se oculta
// entero si el rol no ve ninguno de sus ítems.
interface NavGroup {
  titleKey?: "groupPlanning" | "groupOperations" | "groupIntelligence" | "groupSystem";
  items: NavItem[];
}

const GROUPS: NavGroup[] = [
  {
    items: [{ href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard, permission: "dashboard.view", exact: true }],
  },
  {
    titleKey: "groupPlanning",
    items: [
      { href: "/plan-de-accion", labelKey: "actionPlan", icon: ListChecks, permission: "recommendations.assign" },
      { href: "/simulador", labelKey: "simulator", icon: SlidersHorizontal, permission: "dashboard.view" },
    ],
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
        className={`fixed inset-y-0 left-0 z-50 flex w-64 transform flex-col border-r border-line bg-surface transition-transform duration-200 md:sticky md:top-0 md:z-auto md:h-screen md:translate-x-0 md:self-start ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-2.5 px-5 py-[18px]"
        >
          <BrandMark size={26} className="shrink-0" />
          <span className="text-body font-semibold tracking-tight text-ink-1">Soral</span>
        </Link>

        <nav className="flex flex-1 flex-col gap-[18px] overflow-y-auto px-3 py-2" aria-label={t("primary")}>
          {GROUPS.map((group, i) => {
            const visible = group.items.filter((item) => can(user.role, item.permission));
            if (visible.length === 0) return null;
            return (
              <div key={group.titleKey ?? `g${i}`} className="flex flex-col gap-0.5">
                {group.titleKey && (
                  <div className="mb-1 px-3 text-micro font-semibold uppercase tracking-[0.08em] text-ink-3">
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
                      className={`group/item flex items-center gap-3 rounded-lg px-3 py-[9px] text-body font-medium transition-colors ${
                        active
                          ? "bg-risk-sol-soft text-risk-sol"
                          : "text-ink-1 hover:bg-surface-2"
                      }`}
                    >
                      <Icon
                        className={`h-[18px] w-[18px] shrink-0 ${active ? "text-risk-sol" : "text-ink-3 group-hover/item:text-ink-2"}`}
                      />
                      {t(item.labelKey)}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <Link
          href="/modelo"
          onClick={onClose}
          className="flex items-center justify-between gap-2 border-t border-line px-5 py-3.5 transition-colors hover:bg-surface-2"
        >
          <span className="flex items-center gap-2 text-meta font-medium text-ink-2">
            <span className="h-2 w-2 rounded-full bg-risk-sol" aria-hidden="true" />
            {t("modelStatus")}
          </span>
          <span className="text-micro text-ink-3">{t("version")}</span>
        </Link>
      </aside>
    </>
  );
}
