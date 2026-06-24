// app/api/candidates/route.ts
// Route Handler: pipeline de pre-contratación. Capa HTTP delgada sobre el
// data-service (que calcula supervivencia/costo con lib/hiring.ts).
import { getCandidates } from "@/lib/server/data-service";
import { ok, run } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  return run(async () => ok(await getCandidates()));
}
