// components/admin/roles-matrix.tsx
// Matriz REAL roles × permisos, derivada de lib/auth/roles.ts (el mismo RBAC que
// gobierna la navegación). No es maqueta: si cambias ROLE_PERMISSIONS, cambia aquí.
"use client";

import { useTranslations } from "next-intl";
import { Check, Minus } from "lucide-react";
import { ROLES, PERMISSIONS, can } from "@/lib/auth/roles";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";

export function RolesMatrix() {
  const t = useTranslations("admin");
  const tr = useTranslations("roles");
  const tp = useTranslations("permissions");

  return (
    <section className="mt-9">
      <h2 className="text-subhead font-semibold">{t("rolesTitle")}</h2>
      <p className="mb-3 mt-0.5 text-copy text-ink-2">{t("rolesSubtitle")}</p>

      <Table>
        <THead>
          <TR className="hover:bg-transparent">
            <TH>{t("permissionColumn")}</TH>
            {ROLES.map((r) => (
              <TH key={r} className="text-center">
                {tr(r)}
              </TH>
            ))}
          </TR>
        </THead>
        <tbody>
          {PERMISSIONS.map((p) => (
            <TR key={p}>
              <TD className="whitespace-nowrap text-ink-1">{tp(p)}</TD>
              {ROLES.map((r) => (
                <TD key={r} className="text-center">
                  {can(r, p) ? (
                    <Check className="mx-auto h-4 w-4 text-risk-sol" aria-label="✓" />
                  ) : (
                    <Minus className="mx-auto h-3.5 w-3.5 text-ink-3/40" aria-hidden="true" />
                  )}
                </TD>
              ))}
            </TR>
          ))}
        </tbody>
      </Table>
    </section>
  );
}
