// lib/server/population.ts
// Población sintética DETERMINISTA — SERVER ONLY. Genera ~headcount trabajadores
// con el MOTOR REAL (lib/model): un vector de features con sesgo por línea/turno →
// score por el modelo → drivers por SHAP exacto. Así el headcount que muestra el
// dashboard CUADRA al drillear (mapa, tabla, directorio) en vez de "10 registros
// detrás de 1,180". Los 10 trabajadores curados van al frente (conservan sus refs,
// para que las intervenciones y los expedientes 360 sigan resolviendo).
//
// Con datos del cliente, esto se reemplaza por su tabla real; la forma no cambia.
import { EMPLOYEES } from "@/lib/data";
import { FEATURES, scoreFromFeatures, explain } from "@/lib/model";
import { bandOf } from "@/lib/risk";
import type { EmployeePrediction } from "@/types";

const LINES = ["L1", "L2", "L3", "L4", "L5", "L6", "L7"] as const;
// Sesgo de riesgo por línea (refleja la rotación conocida: L3 alta, L6 baja).
const LINE_BIAS: Record<string, number> = { L1: -0.1, L2: -0.06, L3: 0.22, L4: 0, L5: 0.12, L6: -0.14, L7: -0.08 };
const SHIFTS = ["matutino", "vespertino", "nocturno", "mixto"] as const;
const SHIFT_BIAS: Record<string, number> = { matutino: -0.06, vespertino: 0, nocturno: 0.12, mixto: -0.02 };
// feature del modelo → nombre del driver en la UI (mismo vocabulario que los curados).
const DRIVER_LABEL: Record<string, string> = {
  punctuality: "Retardos en aceleración",
  productivity: "Caída de productividad",
  climate: "Supervisor alta rotación",
  tenure: "Antigüedad en zona crítica",
  context: "Trayecto largo",
  pay: "Salario vs mercado",
};
const RADAR_LABEL = ["Puntualidad", "Productividad", "Clima de línea", "Antigüedad", "Contexto", "Compensación"];

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(r: () => number) {
  let u = 0, v = 0;
  while (!u) u = r();
  while (!v) v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const HEX = "0123456789ABCDEF";

function genRef(r: () => number): string {
  const h = () => HEX[Math.floor(r() * 16)];
  const d = () => Math.floor(r() * 10);
  return `#${h()}${h()}${h()}${h()}-${d()}${d()}${d()}${d()}`;
}

function makeTrend(score: number, r: () => number): number[] {
  const out: number[] = [];
  let v = Math.max(18, score - 28 - Math.floor(r() * 12));
  for (let i = 0; i < 12; i++) {
    out.push(Math.round(v));
    v += (score - v) / (12 - i) + (r() - 0.5) * 3;
  }
  out[11] = score;
  return out;
}

function makeOne(r: () => number): EmployeePrediction {
  const line = LINES[Math.floor(r() * LINES.length)];
  const shift = SHIFTS[Math.floor(r() * SHIFTS.length)];
  const bias = (LINE_BIAS[line] ?? 0) + (SHIFT_BIAS[shift] ?? 0);
  const x = FEATURES.map((f) => clamp01(f.baseline + bias + gauss(r) * 0.34));
  const score = scoreFromFeatures(x);
  const ex = explain(x); // contribs ya ordenadas por |phi| desc
  const positives = ex.contribs.filter((c) => c.phi > 0);
  const chosen = (positives.length ? positives : ex.contribs).slice(0, 4);
  const sum = chosen.reduce((s, c) => s + Math.abs(c.phi), 0) || 1;
  const drivers = chosen.map((c) => ({
    factor: DRIVER_LABEL[c.id] ?? c.id,
    contrib: Math.max(1, Math.round((Math.abs(c.phi) / sum) * 100)),
    detail: "",
  }));
  const tenure = 25 + Math.floor(r() * 1700);
  const headline = drivers[0]?.factor ?? "—";
  const win = score >= 80 ? 7 : score >= 70 ? 14 : 21;
  return {
    ref: genRef(r),
    score,
    band: bandOf(score),
    driver: headline,
    line,
    shift,
    tenure,
    evidence: `${headline}. Línea ${line}, turno ${shift}. ${tenure} días de antigüedad.`,
    drivers,
    radar: x.map((v, j) => [RADAR_LABEL[j], Math.round(v * 1000) / 1000] as [string, number]),
    trend: makeTrend(score, r),
    reco:
      `Diagnóstico: el modelo marca a este operador principalmente por «${headline.toLowerCase()}».\n\n` +
      `Acciones priorizadas:\n1. Conversación 1:1 del supervisor.\n2. Revisar condiciones de la estación.\n3. Seguimiento semanal de la métrica.\n\n` +
      `Ventana de acción: ${win} días.`,
  };
}

// Genera la población: los curados al frente + (n − curados) sintéticos. Determinista.
export function buildPopulation(n: number): EmployeePrediction[] {
  const curated: EmployeePrediction[] = EMPLOYEES.map((e) => ({ ...e, band: e.band ?? bandOf(e.score) }));
  const target = Math.max(curated.length, Math.floor(n));
  const r = mulberry32(20260615);
  const out = [...curated];
  for (let i = curated.length; i < target; i++) out.push(makeOne(r));
  return out;
}
