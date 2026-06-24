// app/api/recommendation/[ref]/assign/route.ts
// Route Handler: asigna la recomendación al supervisor. El ref va en la ruta,
// la línea en el cuerpo JSON.
import { assignRecommendation } from "@/lib/server/data-service";
import { RefParam, AssignBody } from "@/lib/server/inputs";
import { ok, run, readJson } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ ref: string }> }) {
  return run(async () => {
    const { ref } = RefParam.parse(await params);
    const { line } = AssignBody.parse(await readJson(req));
    return ok(await assignRecommendation(ref, line));
  });
}
