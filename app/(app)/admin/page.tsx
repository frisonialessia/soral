"use client";

import { useTranslations } from "next-intl";
import { useCan } from "@/components/auth/can";
import { MembersSection } from "@/components/admin/members-section";
import { RolesMatrix } from "@/components/admin/roles-matrix";
import { Card } from "@/components/ui/card";

export default function AdminPage() {
  const t = useTranslations("admin");
  const allowed = useCan("admin.view");

  if (!allowed) {
    return (
      <div className="animate-fade py-6">
        <h1 className="text-title font-semibold tracking-tight">{t("title")}</h1>
        <Card className="mt-6 px-6 py-12 text-center text-body text-ink-2" role="alert">
          {t("forbidden")}
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade py-6">
      <div className="mb-6">
        <h1 className="text-title font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-body text-ink-2">{t("subtitle")}</p>
      </div>
      <MembersSection />
      <RolesMatrix />
    </div>
  );
}
