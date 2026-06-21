import { getTranslations } from "next-intl/server";
import { SectionPlaceholder } from "@/components/shell/section-placeholder";

export default async function IntegrationsPage() {
  const t = await getTranslations("sections.integrations");
  return <SectionPlaceholder title={t("title")} description={t("description")} />;
}
