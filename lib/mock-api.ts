// lib/mock-api.ts
// Simula las llamadas a la API real. Cada función tiene la firma que tendrá
// el endpoint de producción, para que migrar a fetch() real sea cambiar solo
// el cuerpo de estas funciones (no los componentes que las consumen).
//
// TanStack Query cachea estos resultados, así que navegar entre vistas no
// re-pide datos ya cargados: la interfaz se siente instantánea.

import { EMPLOYEES, TENANT_ID, WEEK_START, MODEL_VERSION } from "./data";
import type { EmployeePrediction, LineDetail, PlantSummary, RiskBand } from "@/types";

const REPLACEMENT_COST_MXN = 36_800;

// Latencia simulada para que el caché de React Query se note de verdad
function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function bandOf(score: number): RiskBand {
  if (score >= 90) return "critico";
  if (score >= 80) return "alto";
  if (score >= 70) return "medio";
  if (score >= 55) return "vigilancia";
  if (score >= 40) return "estable";
  return "solido";
}

// Normaliza: asegura que cada registro tenga banda (defensa de contrato)
const ALL: EmployeePrediction[] = EMPLOYEES.map((e) => ({
  ...e,
  band: e.band ?? bandOf(e.score),
})).sort((a, b) => b.score - a.score);

// GET /api/plant/summary
export async function fetchPlantSummary(): Promise<PlantSummary> {
  const highRisk = ALL.filter((e) => e.score >= 80).length;
  const watch = ALL.filter((e) => e.score >= 55 && e.score < 80).length;
  const stable = 1180 - highRisk - watch;

  // Conteo por línea (de los empleados en riesgo conocidos + líneas vacías del demo)
  const lineCounts: Record<string, number> = {
    L1: 0, L2: 0, L3: 0, L4: 0, L5: 0, L6: 0, L7: 0,
  };
  ALL.forEach((e) => {
    if (e.score >= 55) lineCounts[e.line] = (lineCounts[e.line] ?? 0) + 1;
  });

  return delay({
    tenantId: TENANT_ID,
    weekStart: WEEK_START,
    modelVersion: MODEL_VERSION,
    highRisk,
    watch,
    stable,
    savingMxn: highRisk * REPLACEMENT_COST_MXN,
    lines: Object.entries(lineCounts).map(([id, count]) => ({ id, count })),
    topRisk: ALL.slice(0, 10),
  });
}

// GET /api/line/:id
export async function fetchLineDetail(id: string): Promise<LineDetail> {
  const employees = ALL.filter((e) => e.line === id && e.score >= 55);
  const meta: Record<string, { t: string; p: string; s: string }> = {
    L3: { t: "22%", p: "−12%", s: "Alto" },
    L5: { t: "16%", p: "−8%", s: "Medio" },
    L4: { t: "11%", p: "−4%", s: "Bajo" },
  };
  const m = meta[id] ?? { t: "7%", p: "−2%", s: "Bajo" };
  return delay({
    id,
    turnover90d: m.t,
    productivity: m.p,
    supervisorEffect: m.s,
    shift: employees[0]?.shift ?? "mixto",
    employees,
  });
}

// GET /api/employee/:ref
export async function fetchEmployee(ref: string): Promise<EmployeePrediction | null> {
  const decoded = decodeURIComponent(ref);
  const found = ALL.find((e) => e.ref === decoded) ?? null;
  return delay(found);
}

// POST /api/recommendation/:ref/assign
export async function assignRecommendation(
  ref: string,
  line: string
): Promise<{ ok: true; assignedAt: string }> {
  // En producción: persiste la intervención y notifica al supervisor.
  return delay({ ok: true, assignedAt: new Date().toISOString() }, 250);
}
