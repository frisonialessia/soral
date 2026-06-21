// components/admin/members-section.tsx
// Lista de miembros del workspace. Datos sembrados (etiquetados como ejemplo);
// el cambio de rol y la invitación mutan estado local con el seam listo para
// Supabase. Acciones de gestión gated por `members.manage`.
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { UserPlus } from "lucide-react";
import { useCan } from "@/components/auth/can";
import { ROLES, type Role } from "@/lib/auth/roles";
import { SEED_MEMBERS, type Member } from "@/lib/admin/members";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export function MembersSection() {
  const t = useTranslations("admin");
  const tr = useTranslations("roles");
  const canManage = useCan("members.manage");
  const [members, setMembers] = useState<Member[]>(SEED_MEMBERS);
  const [inviteOpen, setInviteOpen] = useState(false);

  function changeRole(id: string, role: Role) {
    setMembers((ms) => ms.map((m) => (m.id === id ? { ...m, role } : m)));
    // TODO(supabase): persistir el cambio de rol del miembro.
  }

  function addInvite(email: string, role: Role) {
    setMembers((ms) => [
      ...ms,
      { id: crypto.randomUUID(), name: email.split("@")[0], email, role, status: "invited" },
    ]);
    // TODO(supabase): crear la invitación (y enviar el email).
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-semibold">{t("membersTitle")}</h2>
          <p className="mt-0.5 text-[12.5px] text-ink-2">{t("membersSubtitle")}</p>
        </div>
        {canManage && (
          <Button variant="primary" onClick={() => setInviteOpen(true)}>
            <UserPlus className="mr-1.5 inline h-4 w-4" />
            {t("invite")}
          </Button>
        )}
      </div>
      <p className="mb-3 mt-1.5 text-[11px] text-ink-3">{t("sampleNote")}</p>

      <Table>
        <THead>
          <TR className="hover:bg-transparent">
            <TH>{t("colName")}</TH>
            <TH>{t("colEmail")}</TH>
            <TH>{t("colRole")}</TH>
            <TH>{t("colStatus")}</TH>
          </TR>
        </THead>
        <tbody>
          {members.map((m) => (
            <TR key={m.id}>
              <TD className="whitespace-nowrap font-medium text-ink-1">{m.name}</TD>
              <TD className="whitespace-nowrap font-mono text-[12.5px] text-ink-2">{m.email}</TD>
              <TD>
                {canManage ? (
                  <select
                    value={m.role}
                    onChange={(e) => changeRole(m.id, e.target.value as Role)}
                    aria-label={t("changeRole")}
                    className="rounded-lg border border-line-2 bg-surface px-2.5 py-1.5 text-[13px] text-ink-1 outline-none transition-colors hover:border-risk-sol focus:border-risk-sol"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {tr(r)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-[13px] text-ink-1">{tr(m.role)}</span>
                )}
              </TD>
              <TD>
                <StatusBadge
                  active={m.status === "active"}
                  label={m.status === "active" ? t("statusActive") : t("statusInvited")}
                />
              </TD>
            </TR>
          ))}
        </tbody>
      </Table>

      {inviteOpen && <InviteDialog onClose={() => setInviteOpen(false)} onInvite={addInvite} />}
    </section>
  );
}

function StatusBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-medium ${
        active ? "bg-risk-sol-soft text-risk-sol" : "bg-surface-2 text-ink-2"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-risk-sol" : "bg-ink-3"}`} />
      {label}
    </span>
  );
}

function InviteDialog({
  onClose,
  onInvite,
}: {
  onClose: () => void;
  onInvite: (email: string, role: Role) => void;
}) {
  const t = useTranslations("admin");
  const tr = useTranslations("roles");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("viewer");
  const valid = /\S+@\S+\.\S+/.test(email);

  return (
    <Dialog open onClose={onClose} label={t("inviteTitle")}>
      <h3 className="text-[16px] font-semibold">{t("inviteTitle")}</h3>
      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="mb-1 block text-[12px] text-ink-2">{t("inviteEmail")}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("inviteEmailPlaceholder")}
            className="w-full rounded-lg border border-line-2 px-3 py-2 text-sm text-ink-1 outline-none focus:border-risk-sol"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[12px] text-ink-2">{t("inviteRole")}</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full rounded-lg border border-line-2 bg-surface px-3 py-2 text-sm text-ink-1 outline-none focus:border-risk-sol"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {tr(r)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-5 flex justify-end gap-2.5">
        <Button variant="default" onClick={onClose}>
          {t("cancel")}
        </Button>
        <Button
          variant="primary"
          disabled={!valid}
          onClick={() => {
            onInvite(email.trim(), role);
            onClose();
          }}
        >
          {t("inviteSubmit")}
        </Button>
      </div>
    </Dialog>
  );
}
