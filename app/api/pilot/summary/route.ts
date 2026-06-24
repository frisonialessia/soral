// app/api/pilot/summary/route.ts
// Route Handler: resumen del pilot causal (efecto de las intervenciones + flywheel
// del modelo). Capa HTTP delgada sobre el data-service.
import { getPilotSummary } from "@/lib/server/data-service";
import { ok, run } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  return run(async () => ok(await getPilotSummary()));
}
