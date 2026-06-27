// lib/server/cost-model.ts
// FUENTE del costo de rotación — SERVER ONLY, PER-VISITANTE.
// La config de cada visitante vive en una COOKIE (almacenamiento del navegador que
// viaja con cada request). Así el servidor calcula los montos con la config de ESE
// visitante, sin estado compartido ni mutable: cero fugas entre usuarios, persiste
// en su navegador, y nunca toca el código. Sin cookie → estimación de referencia.
//
// Mañana (Supabase): readStored() leería la fila del tenant en vez de la cookie.
import type { CostComponents, CostModel } from "@/types";

export const COST_COMPONENT_KEYS = [
  "recruiting",
  "screening",
  "training",
  "productivity",
  "coverage",
  "separation",
] as const;

// Estimación de referencia por defecto (suma 36,800 MXN), marcada como estimación
// hasta que el visitante la ajuste.
export const DEFAULT_COMPONENTS: CostComponents = {
  recruiting: 5_200,
  screening: 2_400,
  training: 8_600,
  productivity: 12_800,
  coverage: 4_800,
  separation: 3_000,
};

export const totalOf = (c: CostComponents): number =>
  COST_COMPONENT_KEYS.reduce((sum, k) => sum + (c[k] || 0), 0);

export const DEFAULT_COST_PER_REPLACEMENT = totalOf(DEFAULT_COMPONENTS);
export const COST_COOKIE = "soral_cost";

type Stored = { components: CostComponents; updatedAt: string };

// Override solo para tests (sin contexto de request/cookie).
let testStored: Stored | null = null;
export function __setCostModelForTest(components: CostComponents | null): void {
  testStored = components ? { components, updatedAt: new Date().toISOString() } : null;
}

// Lee la config del visitante desde su cookie. Fuera de un request (tests/build) o
// sin cookie, cae al override de test o a null (→ estimación por defecto).
async function readStored(): Promise<Stored | null> {
  try {
    const { cookies } = await import("next/headers");
    const raw = (await cookies()).get(COST_COOKIE)?.value;
    if (raw) {
      const p = JSON.parse(raw) as Partial<Stored>;
      if (p && p.components) return { components: p.components as CostComponents, updatedAt: p.updatedAt ?? "" };
    }
  } catch {
    // sin contexto de request → override de test / default
  }
  return testStored;
}

function toModel(components: CostComponents, configured: boolean, updatedAt: string | null): CostModel {
  return { components, costPerReplacement: totalOf(components), configured, updatedAt };
}

export async function getCostModel(): Promise<CostModel> {
  const s = await readStored();
  return s ? toModel(s.components, true, s.updatedAt || null) : toModel(DEFAULT_COMPONENTS, false, null);
}

// El Route Handler (PUT) usa esto: arma el modelo configurado + el valor que guardará
// en la cookie del visitante.
export function modelFromComponents(components: CostComponents): { model: CostModel; cookieValue: string } {
  const updatedAt = new Date().toISOString();
  return { model: toModel(components, true, updatedAt), cookieValue: JSON.stringify({ components, updatedAt }) };
}
