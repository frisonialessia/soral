// app/api/voice/route.ts
// Route Handler: voz del empleado (temas, sentimiento, alertas). Capa HTTP delgada.
import { getVoiceSummary } from "@/lib/server/data-service";
import { ok, run } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  return run(async () => ok(await getVoiceSummary()));
}
