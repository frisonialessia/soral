// lib/server/plant-profile.ts
// Perfil de la planta (configurable) — SERVER ONLY. Igual que el modelo de costo:
// hoy un singleton en memoria (mock), mañana una fila en `settings` de Supabase.
// Nombre, headcount, líneas y turnos dejan de estar hardcodeados para que el demo
// use el contexto del prospecto y los conteos cuadren con la población.
import type { PlantProfile } from "@/types";
import { DEFAULT_LINES, DEFAULT_SHIFTS } from "./population";

export const DEFAULT_HEADCOUNT = 1180;
const DEFAULT_NAME = "Planta demo";

type ProfileInput = { name: string; headcount: number; lines: string[]; shifts: string[] };
let stored: (ProfileInput & { updatedAt: string }) | null = null;

export async function getPlantProfile(): Promise<PlantProfile> {
  return {
    name: stored?.name ?? DEFAULT_NAME,
    headcount: stored?.headcount ?? DEFAULT_HEADCOUNT,
    lines: stored?.lines ?? DEFAULT_LINES,
    shifts: stored?.shifts ?? DEFAULT_SHIFTS,
    configured: stored !== null,
    updatedAt: stored?.updatedAt ?? null,
  };
}

export async function setPlantProfile(input: ProfileInput): Promise<PlantProfile> {
  stored = { ...input, updatedAt: new Date().toISOString() };
  return getPlantProfile();
}

// Solo para tests: vuelve al estado "sin configurar".
export function __resetPlantProfile(): void {
  stored = null;
}
