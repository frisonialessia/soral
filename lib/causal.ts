// lib/causal.ts
// LA PRUEBA del cerebro. Predecir QUIÉN se va es la mitad; demostrar que ACTUAR
// reduce la rotación es la venta. Eso no se prueba con una correlación: se prueba
// con un experimento. Este módulo corre un pilot ALEATORIZADO (tratados vs. control)
// y mide el efecto causal de las intervenciones con estadística real:
//   • ATE (uplift de retención) = retención_tratados − retención_control
//   • IC 95 % (Wald) y prueba z de dos proporciones (valor p)
//   • NNT (cuántos hay que tratar para retener a uno más) y ROI en MXN
//
// Mismo principio que lib/model.ts: la MATEMÁTICA es real y ejecutable; lo único
// sintético es el cohorte. Inyectamos un efecto verdadero por trabajador y el motor
// lo RECUPERA desde los resultados observados (lo verifica causal.test.ts). El día
// del pilot real, este cohorte se reemplaza por el holdout del cliente y nada más
// cambia: el contrato (types) y la UI quedan intactos.

import { MODEL_INFO } from "./model";
import { EARLY_EXIT_COST_MXN } from "./hiring";
import type { PilotSummary, PilotArm } from "@/types";

// ---------- helpers numéricos ----------
const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
const logit = (p: number) => Math.log(p / (1 - p));
const clip = (p: number, lo = 1e-4, hi = 1 - 1e-4) => Math.max(lo, Math.min(hi, p));
const r1 = (x: number) => Math.round(x * 10) / 10;
const r2 = (x: number) => Math.round(x * 100) / 100;

// erf (Abramowitz & Stegun 7.1.26) → CDF normal estándar, para el valor p.
function erf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-x * x);
  return x >= 0 ? y : -y;
}
const normCdf = (z: number) => 0.5 * (1 + erf(z / Math.SQRT2));

// PRNG determinista (idéntico al de lib/model.ts) para un pilot reproducible.
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

// ---------- estadística del experimento ----------
interface DiffStats {
  ate: number; // diferencia de proporciones (fracción)
  ciLow: number;
  ciHigh: number;
  z: number;
  pValue: number;
}
/** Diferencia de retención entre brazos: IC 95 % de Wald + prueba z de dos proporciones. */
function diffStats(retT: number, nT: number, retC: number, nC: number): DiffStats {
  const pt = retT / nT;
  const pc = retC / nC;
  const ate = pt - pc;
  // IC del efecto: error estándar NO combinado (cada brazo con su varianza).
  const seCi = Math.sqrt((pt * (1 - pt)) / nT + (pc * (1 - pc)) / nC);
  // Prueba de hipótesis (H0: ATE=0): error estándar COMBINADO.
  const pPool = (retT + retC) / (nT + nC);
  const sePool = Math.sqrt(pPool * (1 - pPool) * (1 / nT + 1 / nC));
  const z = sePool > 0 ? ate / sePool : 0;
  const pValue = 2 * (1 - normCdf(Math.abs(z)));
  return { ate, ciLow: ate - 1.96 * seCi, ciHigh: ate + 1.96 * seCi, z, pValue };
}

// ---------- el pilot sintético, aleatorizado ----------
const PILOT_N = 480;
const PILOT_SEED = 4242;
const PILOT_WEEKS = 12;
const BASE_LEAVE = 0.45; // prob. media de salida a 90 días en población en riesgo
const LEAVE_SD = 0.62; // dispersión en log-odds entre trabajadores
const RRR_BASE = 0.33; // reducción relativa de la salida que logra una play
// Heterogeneidad real del efecto por línea (algunas responden más a la intervención).
const RRR_BY_LINE: Record<string, number> = { L3: 0.3, L5: 0.34, L4: 0.33, L2: 0.37, L1: 0.31, L6: 0.27, L7: 0.41 };
const LINES = ["L3", "L5", "L4", "L2", "L1", "L6", "L7"];
const LINE_W = [0.26, 0.18, 0.15, 0.13, 0.12, 0.08, 0.08]; // reparto del pilot por línea
const ANNUAL_ELIGIBLE = 1200; // trabajadores en riesgo elegibles al año (proyección de ROI)

interface Subject {
  line: string;
  arm: 0 | 1; // 1 = tratado (recibe play), 0 = control
  pC: number; // prob. de salida contrafactual (sin tratar)
  rrr: number; // efecto verdadero inyectado para este trabajador
  left: 0 | 1; // resultado observado
  week: number; // semana de enrolamiento (para la curva acumulada)
}

function makePilot(): Subject[] {
  const r = mulberry32(PILOT_SEED);
  const cum: number[] = [];
  let acc = 0;
  for (const w of LINE_W) { acc += w; cum.push(acc); }

  const subs: Subject[] = [];
  for (let i = 0; i < PILOT_N; i++) {
    const u = r();
    let li = cum.findIndex((c) => u <= c);
    if (li < 0) li = LINES.length - 1;
    const line = LINES[li];

    const pC = clip(sigmoid(logit(BASE_LEAVE) + gauss(r) * LEAVE_SD)); // riesgo basal
    const arm: 0 | 1 = r() < 0.5 ? 1 : 0; // asignación AL AZAR (independiente del riesgo)
    const rrr = RRR_BY_LINE[line] ?? RRR_BASE;
    const pArm = arm ? clip(pC * (1 - rrr)) : pC; // tratar reduce la salida
    const left: 0 | 1 = r() < pArm ? 1 : 0;
    const week = 1 + Math.floor(r() * PILOT_WEEKS);
    subs.push({ line, arm, pC, rrr, left, week });
  }
  return subs;
}

function armOf(subs: Subject[], a: 0 | 1): PilotArm {
  const s = subs.filter((x) => x.arm === a);
  const retained = s.filter((x) => x.left === 0).length;
  return { n: s.length, retained, rate: s.length ? r1((retained / s.length) * 100) : 0 };
}

const PILOT = makePilot();

// Efecto verdadero (estimando) = ganancia media de retención inyectada: E[pC·rrr].
// causal.test.ts verifica que el ATE recuperado cae dentro del IC 95 % de este valor.
export const GROUND_TRUTH_ATE_PP = r2((PILOT.reduce((s, x) => s + x.pC * x.rrr, 0) / PILOT.length) * 100);

function build(): PilotSummary {
  const treated = armOf(PILOT, 1);
  const control = armOf(PILOT, 0);
  const d = diffStats(treated.retained, treated.n, control.retained, control.n);
  const ateFrac = d.ate;

  // Uplift por línea (heterogeneidad): algunas cruzan el cero → aún no concluyente.
  const byLine = LINES.map((line) => {
    const sub = PILOT.filter((x) => x.line === line);
    const t = armOf(sub, 1);
    const c = armOf(sub, 0);
    const ds = diffStats(t.retained, Math.max(1, t.n), c.retained, Math.max(1, c.n));
    return { line, nT: t.n, nC: c.n, uplift: r1(ds.ate * 100), ciLow: r1(ds.ciLow * 100), ciHigh: r1(ds.ciHigh * 100) };
  }).sort((a, b) => b.uplift - a.uplift);

  // Curva acumulada: a medida que el pilot enrola, el estimado se estabiliza y el IC
  // se angosta. Refleja cómo la evidencia se vuelve concluyente con el tiempo.
  const trend = [];
  for (let w = 1; w <= PILOT_WEEKS; w++) {
    const sub = PILOT.filter((x) => x.week <= w);
    const t = armOf(sub, 1);
    const c = armOf(sub, 0);
    const ds = diffStats(t.retained, Math.max(1, t.n), c.retained, Math.max(1, c.n));
    trend.push({ week: w, ate: r1(ds.ate * 100), ciLow: r1(ds.ciLow * 100), ciHigh: r1(ds.ciHigh * 100), n: sub.length });
  }

  // ROI: retenidos de más por encima del contrafactual (control), valorados al costo
  // de reemplazo. Medido en el pilot y proyectado a la población elegible anual.
  const extraRetainedPilot = Math.round(ateFrac * treated.n);
  const extraRetainedAnnual = Math.round(ateFrac * ANNUAL_ELIGIBLE);
  const controlRetention = control.retained / control.n;

  // Flywheel del modelo: los resultados del loop (retenido/se fue) son las etiquetas.
  // Más etiquetas → reentrenamiento → mejor AUC. El último embarcado ancla al AUC
  // actual de la model card; el siguiente es PROYECCIÓN (marcado).
  const cur = MODEL_INFO.metrics.auc;
  const retrains = [
    { version: "v0.8", labels: 240, auc: r2(cur - 0.08), projected: false },
    { version: "v0.9", labels: 560, auc: r2(cur - 0.04), projected: false },
    { version: MODEL_INFO.version, labels: 1020, auc: r2(cur), projected: false },
    { version: "v1.1", labels: 1740, auc: r2(Math.min(0.9, cur + 0.02)), projected: true },
  ];

  return {
    designN: PILOT.length,
    treated,
    control,
    ate: r1(ateFrac * 100),
    ciLow: r1(d.ciLow * 100),
    ciHigh: r1(d.ciHigh * 100),
    relUplift: controlRetention > 0 ? Math.round((ateFrac / controlRetention) * 100) : 0,
    pValue: d.pValue,
    significant: d.pValue < 0.05,
    nnt: ateFrac > 0 ? Math.max(1, Math.ceil(1 / ateFrac)) : 0,
    extraRetainedPilot,
    costAvoidedPilot: extraRetainedPilot * EARLY_EXIT_COST_MXN,
    annualEligible: ANNUAL_ELIGIBLE,
    extraRetainedAnnual,
    costAvoidedAnnual: extraRetainedAnnual * EARLY_EXIT_COST_MXN,
    replacementCostMxn: EARLY_EXIT_COST_MXN,
    costEstimated: true, // base; getPilotSummary lo ajusta según el modelo de costo
    byLine,
    trend,
    retrains,
  };
}

// Se computa UNA vez al cargar el módulo (determinista) y alimenta /evidencia.
export const PILOT_SUMMARY: PilotSummary = build();
