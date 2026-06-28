// app/api/interventions/route.ts
// Route Handler del loop de resultados: lista (GET) y crea (POST) intervenciones.
// PER-VISITANTE: el estado vive en una cookie del navegador (no en el server), así
// que crear una intervención la persiste para ESE visitante y sobrevive al refresh.
import { getInterventions, createIntervention, IV_COOKIE } from "@/lib/server/data-service";
import { CreateInterventionBody } from "@/lib/server/inputs";
import { ok, run, readJson } from "@/lib/server/http";

export const dynamic = "force-dynamic";

const COOKIE_OPTS = { httpOnly: true, sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 365 };

export async function GET() {
  return run(async () => ok(await getInterventions()));
}

export async function POST(req: Request) {
  return run(async () => {
    const body = CreateInterventionBody.parse(await readJson(req));
    const { intervention, cookieValue } = await createIntervention(body);
    const res = ok(intervention, { status: 201 });
    res.cookies.set(IV_COOKIE, cookieValue, COOKIE_OPTS);
    return res;
  });
}
