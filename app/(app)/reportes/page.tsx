import { getTranslations } from "next-intl/server";
import { SectionPlaceholder } from "@/components/shell/section-placeholder";

export default async function ReportsPage() {
  const t = await getTranslations("sections.reports");
  return <SectionPlaceholder title={t("title")} description={t("description")} />;
}
