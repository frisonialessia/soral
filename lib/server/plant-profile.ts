// lib/server/plant-profile.ts
// Perfil de la planta — SERVER ONLY, PER-VISITANTE (misma idea que cost-model):
// vive en una cookie del navegador, viaja con cada request, sin estado compartido.
// El headcount dimensiona la población, así que cada visitante ve sus propios
// conteos. Sin cookie → valores demo por defecto.
import type { PlantProfile } from "@/types";
import { DEFAULT_LINES, DEFAULT_SHIFTS } from "./population";

export const DEFAULT_HEADCOUNT = 1180;
const DEFAULT_NAME = "Planta demo";
export const PLANT_COOKIE = "soral_plant";

type ProfileInput = { name: string; headcount: number; lines: string[]; shifts: string[] };
type Stored = ProfileInput & { updatedAt: string };

let testStored: Stored | null = null;
export function __setPlantProfileForTest(input: ProfileInput | null): void {
  testStored = input ? { ...input, updatedAt: new Date().toISOString() } : null;
}

async function readStored(): Promise<Stored | null> {
  try {
    const { cookies } = await import("next/headers");
    const raw = (await cookies()).get(PLANT_COOKIE)?.value;
    if (raw) {
      const p = JSON.parse(raw) as Partial<Stored>;
      if (p && typeof p.headcount === "number" && p.name && Array.isArray(p.lines) && Array.isArray(p.shifts)) {
        return { name: p.name, headcount: p.headcount, lines: p.lines, shifts: p.shifts, updatedAt: p.updatedAt ?? "" };
      }
    }
  } catch {
    // sin contexto de request → override de test / default
  }
  return testStored;
}

function toProfile(s: Stored | null): PlantProfile {
  return {
    name: s?.name ?? DEFAULT_NAME,
    headcount: s?.headcount ?? DEFAULT_HEADCOUNT,
    lines: s?.lines ?? DEFAULT_LINES,
    shifts: s?.shifts ?? DEFAULT_SHIFTS,
    configured: s !== null,
    updatedAt: s?.updatedAt || null,
  };
}

export async function getPlantProfile(): Promise<PlantProfile> {
  return toProfile(await readStored());
}

// El Route Handler (PUT) usa esto: arma el perfil + el valor de la cookie del visitante.
export function profileFromInput(input: ProfileInput): { profile: PlantProfile; cookieValue: string } {
  const updatedAt = new Date().toISOString();
  const s: Stored = { ...input, updatedAt };
  return { profile: toProfile(s), cookieValue: JSON.stringify(s) };
}
