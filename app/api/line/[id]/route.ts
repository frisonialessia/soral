// app/api/line/[id]/route.ts
// Route Handler: detalle de una línea. Valida el id de ruta (p. ej. L3).
import { getLineDetail } from "@/lib/server/data-service";
import { LineIdParam } from "@/lib/server/inputs";
import { ok, run } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return run(async () => {
    const { id } = LineIdParam.parse(await params);
    return ok(await getLineDetail(id));
  });
}
