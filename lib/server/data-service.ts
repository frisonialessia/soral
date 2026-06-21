// lib/server/data-service.ts
// Capa de datos — SERVER ONLY. Es la única capa que conoce el origen de los datos.
// Hoy lee del dataset semilla (lib/data.ts); mañana consultará PostgreSQL/Supabase.
//
// Solo los Route Handlers de app/api/* importan este módulo (nunca un componente
// cliente). Migrar a Supabase = cambiar SOLO el cuerpo de estas funciones: las
// firmas y el contrato de types/index.ts no se tocan, así que ni los handlers ni
// la UI cambian.

import { EMPLOYEES, TENANT_ID, WEEK_START, MODEL_VERSION } from "@/lib/data";
import { bandOf } from "@/lib/risk";
import type { EmployeePrediction, LineDetail, PlantSummary } from "@/types";

const REPLACEMENT_COST_MXN = 36_800;
const PLANT_HEADCOUNT = 1180;

// Normaliza: asegura que cada registro tenga banda (defensa de contrato) y ordena
// por score descendente. Cuando esto sea SQL, será un ORDER BY score DESC.
const ALL: EmployeePrediction[] = EMPLOYEES.map((e) => ({
  ...e,
  band: e.band ?? bandOf(e.score),
})).sort((a, b) => b.score - a.score);

// Serie semanal sintética (determinista) que termina en el valor actual — solo
// para las sparklines del dashboard. Con Supabase será un GROUP BY por semana.
function trendSeries(end: number, volatility: number, weeks = 10): number[] {
  const out: number[] = [];
  for (let i = 0; i < weeks; i++) {
    const t = i / (weeks - 1);
    const noise = Math.sin(i * 1.7 + end * 0.5) * 0.6 + Math.sin(i * 0.8 + 1) * 0.4;
    out.push(Math.max(0, Math.round(end * (1 + noise * volatility * (1 - t * 0.6)))));
  }
  out[weeks - 1] = end; // ancla el último punto al valor real
  return out;
}

// GET /api/plant/summary
export async function getPlantSummary(): Promise<PlantSummary> {
  const highRisk = ALL.filter((e) => e.score >= 80).length;
  const watch = ALL.filter((e) => e.score >= 55 && e.score < 80).length;
  const stable = PLANT_HEADCOUNT - highRisk - watch;

  // Conteo por línea (de los empleados en riesgo conocidos + líneas vacías del demo)
  const lineCounts: Record<string, number> = {
    L1: 0, L2: 0, L3: 0, L4: 0, L5: 0, L6: 0, L7: 0,
  };
  ALL.forEach((e) => {
    if (e.score >= 55) lineCounts[e.line] = (lineCounts[e.line] ?? 0) + 1;
  });

  return {
    tenantId: TENANT_ID,
    weekStart: WEEK_START,
    modelVersion: MODEL_VERSION,
    highRisk,
    watch,
    stable,
    savingMxn: highRisk * REPLACEMENT_COST_MXN,
    trend: {
      highRisk: trendSeries(highRisk, 0.32),
      watch: trendSeries(watch, 0.3),
      stable: trendSeries(stable, 0.015),
    },
    lines: Object.entries(lineCounts).map(([id, count]) => ({ id, count })),
    topRisk: ALL.slice(0, 10),
  };
}

// GET /api/line/:id
export async function getLineDetail(id: string): Promise<LineDetail> {
  const employees = ALL.filter((e) => e.line === id && e.score >= 55);
  const meta: Record<string, { t: string; p: string; s: string }> = {
    L3: { t: "22%", p: "−12%", s: "Alto" },
    L5: { t: "16%", p: "−8%", s: "Medio" },
    L4: { t: "11%", p: "−4%", s: "Bajo" },
  };
  const m = meta[id] ?? { t: "7%", p: "−2%", s: "Bajo" };
  return {
    id,
    turnover90d: m.t,
    productivity: m.p,
    supervisorEffect: m.s,
    shift: employees[0]?.shift ?? "mixto",
    employees,
  };
}

// GET /api/employee/:ref
// El ref llega ya decodificado por Next (el handler recibe params decodificados).
export async function getEmployee(ref: string): Promise<EmployeePrediction | null> {
  return ALL.find((e) => e.ref === ref) ?? null;
}

// POST /api/recommendation/:ref/assign
export async function assignRecommendation(
  ref: string,
  line: string
): Promise<{ ok: true; assignedAt: string }> {
  // En producción: persiste la intervención y notifica al supervisor.
  return { ok: true, assignedAt: new Date().toISOString() };
}
