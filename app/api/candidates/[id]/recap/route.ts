// app/api/candidates/[id]/recap/route.ts
// Route Handler: recap de entrevista de un candidato (Claude en vivo o reglas).
// 404 si el candidato no existe.
import { getLocale } from "next-intl/server";
import { getCandidate } from "@/lib/server/data-service";
import { interviewRecap } from "@/lib/server/ai-service";
import { IdParam } from "@/lib/server/inputs";
import { ok, run, notFound } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return run(async () => {
    const { id } = IdParam.parse(await params);
    const candidate = await getCandidate(id);
    if (!candidate) throw notFound(`Candidato '${id}' no existe`);
    return ok(await interviewRecap(candidate, await getLocale()));
  });
}
