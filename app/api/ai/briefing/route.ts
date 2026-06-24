// app/api/ai/briefing/route.ts
// Route Handler: briefing semanal con IA. Capa HTTP delgada sobre el ai-service.
import { getLocale } from "next-intl/server";
import { generateBriefing } from "@/lib/server/ai-service";
import { ok, run } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  return run(async () => ok(await generateBriefing(await getLocale())));
}
