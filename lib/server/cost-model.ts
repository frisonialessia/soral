// lib/server/cost-model.ts
// FUENTE ÚNICA del costo de rotación — SERVER ONLY.
// El "monto por reemplazo" ya NO es una constante hardcodeada y regada por la app:
// RH lo calcula por componentes y aquí se guarda. Mientras no lo configure,
// devolvemos una ESTIMACIÓN de referencia (configured:false) para que la UI la
// marque como tal y NUNCA la presente como un hecho.
//
// Hoy el store es un singleton en memoria (mock). Mañana = una fila de la tabla
// `settings` en Supabase; getCostModel()/setCostModel() cambian su CUERPO, no su
// firma — el data-service, los Route Handlers y la UI no se enteran.
import type { CostComponents, CostModel } from "@/types";

export const COST_COMPONENT_KEYS = [
  "recruiting",
  "screening",
  "training",
  "productivity",
  "coverage",
  "separation",
] as const;

// Estimación de referencia por defecto. La SUMA es 36,800 MXN — el mismo valor que
// la app usaba hardcodeado — pero va marcada como estimación hasta que RH la ajuste.
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

// El costo por defecto (= 36,800). Las capas que siembran montos con el costo viejo
// (p. ej. lib/hiring) lo reescalan a este valor para hablar todas del mismo número.
export const DEFAULT_COST_PER_REPLACEMENT = totalOf(DEFAULT_COMPONENTS);

// Store singleton (mock). null = RH aún no lo ha configurado → estimación.
let stored: { components: CostComponents; updatedAt: string } | null = null;

export async function getCostModel(): Promise<CostModel> {
  const components = stored?.components ?? DEFAULT_COMPONENTS;
  return {
    components,
    costPerReplacement: totalOf(components),
    configured: stored !== null,
    updatedAt: stored?.updatedAt ?? null,
  };
}

export async function setCostModel(components: CostComponents): Promise<CostModel> {
  stored = { components: { ...components }, updatedAt: new Date().toISOString() };
  return getCostModel();
}

// Solo para tests: vuelve el store al estado "sin configurar".
export function __resetCostModel(): void {
  stored = null;
}
