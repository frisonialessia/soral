// components/shell/section-placeholder.tsx
// Placeholder honesto para secciones aún sin construir. No finge datos: dice
// claramente que está en construcción y que se conectará a Supabase.
import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/card";

export async function SectionPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const t = await getTranslations("placeholder");

  return (
    <div className="animate-fade py-6">
      <h1 className="text-title font-semibold tracking-tight">{title}</h1>
      <Card className="mt-6 flex flex-col items-center gap-3 px-6 py-16 text-center">
        <span className="rounded-full bg-risk-sol-soft px-3 py-1 text-meta font-semibold text-risk-sol">
          {t("underConstruction")}
        </span>
        <p className="max-w-md text-body text-ink-2">{description}</p>
        <p className="text-meta text-ink-3">{t("supabaseNote")}</p>
      </Card>
    </div>
  );
}
