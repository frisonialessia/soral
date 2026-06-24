// app/api/ai/voice-digest/route.ts
// Route Handler: lectura ejecutiva de la voz del empleado (Claude o reglas).
import { getLocale } from "next-intl/server";
import { voiceDigest } from "@/lib/server/ai-service";
import { ok, run } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  return run(async () => ok(await voiceDigest(await getLocale())));
}
