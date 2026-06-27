// app/api/settings/cost-model/route.ts
// Costo de rotación PER-VISITANTE: GET lee la cookie del visitante; PUT valida y la
// guarda en su navegador (Set-Cookie). Ningún estado mutable compartido en el server.
import { getCostModel, modelFromComponents, COST_COOKIE } from "@/lib/server/cost-model";
import { CostModelBody } from "@/lib/server/inputs";
import { ok, run, readJson } from "@/lib/server/http";

export const dynamic = "force-dynamic";

const COOKIE_OPTS = { httpOnly: true, sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 365 };

export async function GET() {
  return run(async () => ok(await getCostModel()));
}

export async function PUT(req: Request) {
  return run(async () => {
    const body = CostModelBody.parse(await readJson(req));
    const { model, cookieValue } = modelFromComponents(body);
    const res = ok(model);
    res.cookies.set(COST_COOKIE, cookieValue, COOKIE_OPTS);
    return res;
  });
}
