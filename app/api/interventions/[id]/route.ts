// app/api/interventions/[id]/route.ts
// Route Handler: actualiza el estado/resultado de una intervención (cerrar el loop).
// PER-VISITANTE: el cambio se guarda en la cookie del visitante, así que marcar
// "retenido/se fue" persiste y sobrevive al refresh.
import { updateIntervention, IV_COOKIE } from "@/lib/server/data-service";
import { IdParam, UpdateInterventionBody } from "@/lib/server/inputs";
import { ok, run, readJson, notFound } from "@/lib/server/http";

export const dynamic = "force-dynamic";

const COOKIE_OPTS = { httpOnly: true, sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 365 };

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return run(async () => {
    const { id } = IdParam.parse(await params);
    const patch = UpdateInterventionBody.parse(await readJson(req));
    const { intervention, cookieValue } = await updateIntervention(id, patch);
    if (!intervention) throw notFound(`Intervención '${id}' no existe`);
    const res = ok(intervention);
    res.cookies.set(IV_COOKIE, cookieValue, COOKIE_OPTS);
    return res;
  });
}
