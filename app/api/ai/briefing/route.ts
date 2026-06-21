// app/api/ai/briefing/route.ts
// Route Handler: briefing semanal con IA. Capa HTTP delgada sobre el ai-service.
import { NextResponse } from "next/server";
import { getLocale } from "next-intl/server";
import { generateBriefing } from "@/lib/server/ai-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const locale = await getLocale();
  return NextResponse.json(await generateBriefing(locale));
}
