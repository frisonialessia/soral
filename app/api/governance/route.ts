// app/api/governance/route.ts
// Route Handler: gobernanza y equidad. Capa HTTP delgada sobre el data-service.
import { getGovernanceSummary } from "@/lib/server/data-service";
import { ok, run } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  return run(async () => ok(await getGovernanceSummary()));
}
