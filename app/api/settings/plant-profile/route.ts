// app/api/settings/plant-profile/route.ts
// Perfil de la planta (nombre, headcount): leer (GET) y guardar (PUT).
import { getPlantProfile, setPlantProfile } from "@/lib/server/plant-profile";
import { PlantProfileBody } from "@/lib/server/inputs";
import { ok, run, readJson } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  return run(async () => ok(await getPlantProfile()));
}

export async function PUT(req: Request) {
  return run(async () => {
    const body = PlantProfileBody.parse(await readJson(req));
    return ok(await setPlantProfile(body));
  });
}
