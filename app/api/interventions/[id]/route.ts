// app/api/interventions/[id]/route.ts
// Route Handler: actualiza el estado/resultado de una intervención (cerrar el loop).
import { updateIntervention } from "@/lib/server/data-service";
import { IdParam, UpdateInterventionBody } from "@/lib/server/inputs";
import { ok, run, readJson, notFound } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return run(async () => {
    const { id } = IdParam.parse(await params);
    const patch = UpdateInterventionBody.parse(await readJson(req));
    const updated = await updateIntervention(id, patch);
    if (!updated) throw notFound(`Intervención '${id}' no existe`);
    return ok(updated);
  });
}
