// app/api/integrations/[id]/sync/route.ts
// Route Handler: dispara una sincronización del conector `id` (mock). Valida que el
// conector exista antes (404 si no).
import { getConnector, syncConnector } from "@/lib/server/data-service";
import { IdParam } from "@/lib/server/inputs";
import { ok, run, notFound } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return run(async () => {
    const { id } = IdParam.parse(await params);
    if (!(await getConnector(id))) throw notFound(`Conector '${id}' no existe`);
    return ok(await syncConnector(id));
  });
}
