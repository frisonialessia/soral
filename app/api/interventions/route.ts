// app/api/interventions/route.ts
// Route Handler del loop de resultados: lista (GET) y crea (POST) intervenciones.
import { getInterventions, createIntervention } from "@/lib/server/data-service";
import { CreateInterventionBody } from "@/lib/server/inputs";
import { ok, run, readJson } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  return run(async () => ok(await getInterventions()));
}

export async function POST(req: Request) {
  return run(async () => {
    const body = CreateInterventionBody.parse(await readJson(req));
    return ok(await createIntervention(body), { status: 201 });
  });
}
