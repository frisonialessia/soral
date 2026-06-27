// app/api/settings/plant-profile/route.ts
// Perfil de planta PER-VISITANTE: GET lee la cookie; PUT valida y la guarda en el
// navegador del visitante. Sin estado mutable compartido en el server.
import { getPlantProfile, profileFromInput, PLANT_COOKIE } from "@/lib/server/plant-profile";
import { PlantProfileBody } from "@/lib/server/inputs";
import { ok, run, readJson } from "@/lib/server/http";

export const dynamic = "force-dynamic";

const COOKIE_OPTS = { httpOnly: true, sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 365 };

export async function GET() {
  return run(async () => ok(await getPlantProfile()));
}

export async function PUT(req: Request) {
  return run(async () => {
    const body = PlantProfileBody.parse(await readJson(req));
    const { profile, cookieValue } = profileFromInput(body);
    const res = ok(profile);
    res.cookies.set(PLANT_COOKIE, cookieValue, COOKIE_OPTS);
    return res;
  });
}
