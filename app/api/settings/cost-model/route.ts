// app/api/settings/cost-model/route.ts
// Configuración del costo de rotación (a nivel planta): leer (GET) y guardar (PUT)
// los componentes que RH captura. La respuesta es el modelo ya con el total y el
// flag `configured`.
import { getCostModel, setCostModel } from "@/lib/server/cost-model";
import { CostModelBody } from "@/lib/server/inputs";
import { ok, run, readJson } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  return run(async () => ok(await getCostModel()));
}

export async function PUT(req: Request) {
  return run(async () => {
    const body = CostModelBody.parse(await readJson(req));
    return ok(await setCostModel(body));
  });
}
