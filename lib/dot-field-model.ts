// lib/dot-field-model.ts
// Lógica (sin vista) del mapa de fuerza laboral. Compone el campo de puntos a
// partir de los empleados con predicción real + la mayoría estable. Separada del
// componente para poder testearla y para mantener la lógica fuera del render.
//
// Honestidad del visual:
// - Cada punto es UN empleado (el total = headcount real del summary).
// - Los empleados con predicción conservan su score/ref reales (puntos cálidos,
//   interactivos).
// - El resto (la mayoría estable, sin señal individual) recibe un score acotado
//   SIEMPRE por debajo del umbral de vigilancia: un punto anónimo nunca aparenta
//   riesgo ni inventa una referencia.

import { bandOf } from "@/lib/risk";
import type { EmployeePrediction, RiskBand } from "@/types";

export const COLS = 44;
export const CELL = 20;

export interface Cell {
  c: number;
  r: number;
  score: number;
  ref: string | null;
  band: RiskBand;
  driver: string | null;
}

// Variación determinista en la zona tranquila (sin Math.random → sin parpadeo
// entre renders). Acotada a < 55 para no aparentar riesgo jamás.
export function calmScore(i: number): number {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  const frac = x - Math.floor(x); // 0..1
  return Math.floor(frac * 49); // 0..48
}

export interface Field {
  real: Cell[];
  anon: Cell[];
  cols: number;
  rows: number;
  width: number;
  height: number;
}

export function buildField(employees: EmployeePrediction[], total: number): Field {
  const people: Omit<Cell, "c" | "r">[] = employees.map((e) => ({
    score: e.score,
    ref: e.ref,
    band: e.band,
    driver: e.driver,
  }));

  const anonCount = Math.max(0, total - employees.length);
  for (let i = 0; i < anonCount; i++) {
    const score = calmScore(i);
    people.push({ score, ref: null, band: bandOf(score), driver: null });
  }

  // Orden por riesgo desc → el cálido se concentra arriba (junto a "crítico").
  people.sort((a, b) => b.score - a.score);

  const rows = Math.max(1, Math.ceil(people.length / COLS));
  const cells: Cell[] = people.map((p, idx) => ({
    ...p,
    c: idx % COLS,
    r: Math.floor(idx / COLS),
  }));

  return {
    real: cells.filter((c) => c.ref !== null),
    anon: cells.filter((c) => c.ref === null),
    cols: COLS,
    rows,
    width: COLS * CELL,
    height: rows * CELL,
  };
}
