// app/api/integrations/route.ts
// Route Handler: estado de los conectores. Capa HTTP delgada sobre el data-service.
import { getIntegrations } from "@/lib/server/data-service";
import { ok, run } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  return run(async () => ok(await getIntegrations()));
}
