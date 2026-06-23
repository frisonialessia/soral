// lib/hiring.ts
// EL CEREBRO de pre-contratación. Mismo principio que lib/model.ts (un hazard
// logístico con SHAP exacto), pero estima la SUPERVIVENCIA de un candidato en t=0:
// ¿seguirá aquí a los 90 días? ¿a los 12 meses? ¿cuánto cuesta si rota pronto?
//
// IMPORTANTE (gobernanza): esto NO decide a quién contratar. Solo usa señales
// job-related (canal de origen, traslado, historial de permanencia, ajuste salarial,
// señal de entrevista estructurada, estabilidad del puesto) — nunca atributos
// protegidos — y produce evidencia para que el reclutador (humano) decida.

import type { Candidate, HireRecommendation } from "@/types";

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

// Costo esperado si la contratación rota antes de 90 días (reclutamiento +
// capacitación + producción perdida). Mismo orden que el costo de reemplazo del
// resto de la app.
export const EARLY_EXIT_COST_MXN = 36_800;

// Features de estabilidad (xᵢ ∈ [0,1], MÁS alto = MÁS probable que se quede).
export interface HireFeature {
  id: string; // clave i18n: `hfeat_${id}`
  beta: number; // coeficiente sobre el log-odds de supervivencia (≥ 0)
  baseline: number; // candidato "promedio"
}
export const HIRE_FEATURES: HireFeature[] = [
  { id: "sourceQuality", beta: 1.2, baseline: 0.5 },
  { id: "commuteFit", beta: 1.4, baseline: 0.5 },
  { id: "tenureHistory", beta: 1.6, baseline: 0.5 },
  { id: "payFit", beta: 1.3, baseline: 0.5 },
  { id: "interviewSignal", beta: 1.0, baseline: 0.5 },
  { id: "roleStability", beta: 0.8, baseline: 0.5 },
];
// Intercepto: con el candidato promedio, supervivencia a 90 días ≈ 62% (realista
// para maquila, donde el acantilado de los 90 días es el problema central).
const HIRE_INTERCEPT = -3.16;
const HIRE_BASE_LOGIT = HIRE_INTERCEPT + HIRE_FEATURES.reduce((s, f) => s + f.beta * f.baseline, 0);

/** Probabilidad de seguir a 90 días (0–1). */
export function survival90(x: number[]): number {
  const z = HIRE_INTERCEPT + HIRE_FEATURES.reduce((s, f, i) => s + f.beta * (x[i] ?? f.baseline), 0);
  return sigmoid(z);
}

// Supervivencia a 12 meses bajo hazard constante: si p3 = supervivencia a 3 meses,
// la retención mensual es r = p3^(1/3) y s12 = r^12 = p3^4.
function survival12(p3: number): number {
  return Math.pow(p3, 4);
}

// Tenencia esperada (meses) bajo el mismo hazard mensual: 1/(1−r), acotada.
function expectedTenure(p3: number): number {
  const r = Math.pow(Math.max(0.01, p3), 1 / 3);
  return Math.min(36, Math.round(1 / Math.max(0.001, 1 - r)));
}

export interface HireContribution {
  id: string;
  value: number;
  phi: number; // contribución SHAP al log-odds de SUPERVIVENCIA (con signo)
}
/** SHAP exacto sobre la supervivencia (cerrado, lineal-en-log-odds). */
export function explainHire(x: number[]): HireContribution[] {
  return HIRE_FEATURES.map((f, i) => ({
    id: f.id,
    value: x[i] ?? f.baseline,
    phi: f.beta * ((x[i] ?? f.baseline) - f.baseline),
  })).sort((a, b) => Math.abs(b.phi) - Math.abs(a.phi));
}

function recommend(s90: number): HireRecommendation {
  if (s90 >= 70) return "advance";
  if (s90 >= 55) return "review";
  return "caution";
}

// Construye la predicción completa de un candidato a partir de su vector + meta.
export function scoreCandidate(input: {
  id: string;
  ref: string;
  role: string;
  line: string;
  source: Candidate["source"];
  appliedAt: string;
  interviewDone: boolean;
  features: number[];
}): Candidate {
  const p3 = survival90(input.features);
  const s90 = Math.round(p3 * 100);
  const contribs = explainHire(input.features);
  const maxAbs = Math.max(...contribs.map((c) => Math.abs(c.phi)), 0.001);
  return {
    id: input.id,
    ref: input.ref,
    role: input.role,
    line: input.line,
    source: input.source,
    appliedAt: input.appliedAt,
    interviewDone: input.interviewDone,
    survival90: s90,
    survival12m: Math.round(survival12(p3) * 100),
    expectedTenureMonths: expectedTenure(p3),
    costRisk: Math.round((1 - p3) * EARLY_EXIT_COST_MXN),
    recommendation: recommend(s90),
    // Para la UI, los drivers se expresan en términos de RIESGO: una feature que
    // sube la supervivencia (φ>0) protege (down); una que la baja, sube riesgo (up).
    drivers: contribs.map((c) => ({
      factor: c.id,
      contrib: Math.round((Math.abs(c.phi) / maxAbs) * 100),
      direction: c.phi >= 0 ? ("down" as const) : ("up" as const),
    })),
  };
}

export { HIRE_BASE_LOGIT };
