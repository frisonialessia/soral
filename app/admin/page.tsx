import { getTranslations } from "next-intl/server";
import { SectionPlaceholder } from "@/components/shell/section-placeholder";

export default async function AdminPage() {
  const t = await getTranslations("sections.admin");
  return <SectionPlaceholder title={t("title")} description={t("description")} />;
}
