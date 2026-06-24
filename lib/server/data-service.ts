// lib/server/data-service.ts
// El CEREBRO de datos — SERVER ONLY. Contiene la lógica de dominio (filtrar,
// buscar, agregar, unir) y expone las funciones que consumen los Route Handlers.
//
// No toca el store directamente: lee y escribe a través de la capa de acceso
// (lib/server/mock-db), cuya interfaz imita una base de datos real. Por eso migrar
// a Supabase = reemplazar el cuerpo de mock-db (o de estas funciones) por llamadas
// a supabase-js; las firmas, los Route Handlers y la UI NO cambian.
//
// Capas:  Route Handler (HTTP) → data-service (dominio) → mock-db (acceso a datos)

import { EMPLOYEES, TENANT_ID, WEEK_START, MODEL_VERSION } from "@/lib/data";
import { bandOf } from "@/lib/risk";
import { scoreCandidate } from "@/lib/hiring";
import { PILOT_SUMMARY } from "@/lib/causal";
import { buildFairness, buildProxies, parity, buildCalibration, calibrationGap } from "@/lib/governance";
import { createTable, type Page } from "./mock-db";
import type {
  EmployeePrediction,
  RiskBand,
  LineDetail,
  PlantSummary,
  ReportSummary,
  IntegrationsSummary,
  IntegrationConnector,
  SyncResult,
  Intervention,
  InterventionsSummary,
  InterventionStatus,
  InterventionOutcome,
  Candidate,
  CandidatesSummary,
  VoiceSummary,
  EmployeeTimeline,
  TimelineEvent,
  PilotSummary,
  GovernanceSummary,
  GovernanceDecision,
} from "@/types";

export type { Page } from "./mock-db";

const REPLACEMENT_COST_MXN = 36_800;
const PLANT_HEADCOUNT = 1180;
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

// ── Tablas (semilla → capa de acceso) ───────────────────────────────────────
// Cada createTable es lo que mañana será `supabase.from('<tabla>')`.

// Empleados: normaliza la banda (defensa de contrato) y ordena por score desc —
// con Supabase, un ORDER BY score DESC en el seed/migración.
const EMPLOYEE_SEED: EmployeePrediction[] = EMPLOYEES.map((e) => ({
  ...e,
  band: e.band ?? bandOf(e.score),
})).sort((a, b) => b.score - a.score);
const employees = createTable<EmployeePrediction>(EMPLOYEE_SEED);

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

// ── Empleados: consultas ─────────────────────────────────────────────────────

// Opciones de consulta sobre la tabla de empleados — la forma exacta que tendría
// un endpoint de listado real (filtros + búsqueda + orden + paginación).
export interface EmployeeQuery {
  line?: string;
  shift?: string;
  band?: RiskBand;
  minScore?: number;
  maxScore?: number;
  search?: string; // busca en ref + driver
  sort?: "score" | "tenure" | "ref";
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

// GET /api/employees — listado paginado/filtrable. La consulta "real" sobre la
// tabla; devuelve la página + total (para que el cliente pueda paginar).
export async function listEmployees(query: EmployeeQuery = {}): Promise<Page<EmployeePrediction>> {
  return employees.findMany({
    eq: {
      ...(query.line ? { line: query.line } : {}),
      ...(query.shift ? { shift: query.shift } : {}),
      ...(query.band ? { band: query.band } : {}),
    },
    gte: query.minScore != null ? { score: query.minScore } : undefined,
    lte: query.maxScore != null ? { score: query.maxScore } : undefined,
    search: query.search ? { term: query.search, fields: ["ref", "driver"] } : undefined,
    order: { field: query.sort ?? "score", ascending: (query.order ?? "desc") === "asc" },
    limit: query.limit,
    offset: query.offset,
  });
}

// GET /api/plant/summary — agrega los buckets de riesgo y arma el resumen de planta.
export async function getPlantSummary(): Promise<PlantSummary> {
  // Varias consultas en paralelo, como harías contra la DB.
  const [highRisk, atRisk, top] = await Promise.all([
    employees.count({ gte: { score: 80 } }),
    employees.findMany({ gte: { score: 55 } }), // marcados (alto + vigilancia)
    employees.findMany({ order: { field: "score", ascending: false }, limit: 10 }),
  ]);
  const watch = atRisk.total - highRisk;
  const stable = PLANT_HEADCOUNT - highRisk - watch;

  const lineCounts: Record<string, number> = { L1: 0, L2: 0, L3: 0, L4: 0, L5: 0, L6: 0, L7: 0 };
  for (const e of atRisk.rows) lineCounts[e.line] = (lineCounts[e.line] ?? 0) + 1;

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
    topRisk: top.rows,
  };
}

// GET /api/line/:id
export async function getLineDetail(id: string): Promise<LineDetail> {
  const { rows } = await employees.findMany({
    eq: { line: id },
    gte: { score: 55 },
    order: { field: "score", ascending: false },
  });
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
    shift: rows[0]?.shift ?? "mixto",
    employees: rows,
  };
}

// GET /api/employee/:ref
// El ref llega ya decodificado por Next (el handler recibe params decodificados).
export async function getEmployee(ref: string): Promise<EmployeePrediction | null> {
  return employees.findOne({ ref });
}

// GET /api/employee/:ref/timeline
// Expediente 360: cose la señal del modelo (drivers/score) con las intervenciones
// REALES del loop de resultados. Con datos reales, los eventos vendrán de la tabla
// de eventos del trabajador; la firma no cambia.
export async function getEmployeeTimeline(ref: string): Promise<EmployeeTimeline | null> {
  const [e, ivs] = await Promise.all([
    employees.findOne({ ref }),
    interventions.findMany({ eq: { ref } }),
  ]);
  if (!e) return null;

  const events: TimelineEvent[] = [];
  // Señales del modelo (de los dos drivers principales).
  if (e.drivers[0]) events.push({ id: `${e.ref}-s1`, kind: "signal", at: daysAgo(28), driver: e.drivers[0].factor });
  if (e.drivers[1]) events.push({ id: `${e.ref}-s2`, kind: "signal", at: daysAgo(19), driver: e.drivers[1].factor });
  // Alerta cuando el score cruzó el umbral.
  events.push({ id: `${e.ref}-a1`, kind: "alert", at: daysAgo(13), score: e.score });
  // Intervenciones REALES de este trabajador + su resultado.
  for (const iv of ivs.rows) {
    events.push({ id: `${iv.id}-iv`, kind: "intervention", at: iv.assignedAt, play: iv.play, by: iv.assignedBy });
    if (iv.outcome !== "pending") {
      const at = new Date(new Date(iv.assignedAt).getTime() + 5 * 86_400_000).toISOString();
      events.push({ id: `${iv.id}-out`, kind: "outcome", at, outcome: iv.outcome });
    }
  }

  events.sort((a, b) => b.at.localeCompare(a.at)); // más reciente primero
  return { ref: e.ref, events };
}

// POST /api/recommendation/:ref/assign
export async function assignRecommendation(
  _ref: string,
  _line: string
): Promise<{ ok: true; assignedAt: string }> {
  // En producción: persiste la intervención y notifica al supervisor.
  return { ok: true, assignedAt: new Date().toISOString() };
}

// ── Integraciones ────────────────────────────────────────────────────────────
// Conectores que alimentan el modelo. Hoy mock; mañana, estado real de cada
// pipeline ERP/HRIS/biométrico. Los campos source→target reflejan el mapeo que
// usa el conector para producir las señales del dataset.
const CONNECTOR_SEED: IntegrationConnector[] = [
  {
    id: "successfactors",
    name: "SAP SuccessFactors",
    category: "hris",
    status: "connected",
    lastSyncMin: 12,
    records: PLANT_HEADCOUNT,
    frequency: "hourly",
    fields: [
      { source: "employee_id", target: "ref" },
      { source: "hire_date", target: "tenure" },
      { source: "position", target: "role" },
      { source: "employment_status", target: "active" },
    ],
  },
  {
    id: "adp",
    name: "ADP Payroll",
    category: "payroll",
    status: "connected",
    lastSyncMin: 140,
    records: PLANT_HEADCOUNT,
    frequency: "daily",
    fields: [
      { source: "pay_date", target: "pay_cycle" },
      { source: "gross_pay", target: "pay_level" },
      { source: "deductions", target: "pay_signal" },
    ],
  },
  {
    id: "ukg",
    name: "UKG / Kronos",
    category: "time",
    status: "connected",
    lastSyncMin: 8,
    records: 38420,
    frequency: "hourly",
    fields: [
      { source: "clock_in", target: "punctuality" },
      { source: "late_minutes", target: "tardiness" },
      { source: "absence_flag", target: "absences" },
    ],
  },
  {
    id: "zkteco",
    name: "ZKTeco",
    category: "biometrics",
    status: "syncing",
    lastSyncMin: 1,
    records: 36910,
    frequency: "realtime",
    fields: [
      { source: "device_id", target: "gate" },
      { source: "event_ts", target: "entry_time" },
    ],
  },
  {
    id: "oracle-erp",
    name: "Oracle ERP",
    category: "erp",
    status: "error",
    lastSyncMin: 1440,
    records: 0,
    frequency: "daily",
    fields: [
      { source: "cost_center", target: "line" },
      { source: "shift_code", target: "shift" },
    ],
  },
  {
    id: "sftp-survey",
    name: "Pulse survey (SFTP)",
    category: "files",
    status: "connected",
    lastSyncMin: 300,
    records: 920,
    frequency: "daily",
    fields: [
      { source: "survey_score", target: "climate" },
      { source: "supervisor_id", target: "supervisor" },
    ],
  },
  {
    id: "workday",
    name: "Workday",
    category: "hris",
    status: "disconnected",
    lastSyncMin: null,
    records: 0,
    frequency: "manual",
    fields: [],
  },
];
const connectors = createTable<IntegrationConnector>(CONNECTOR_SEED);

// GET /api/integrations
export async function getIntegrations(): Promise<IntegrationsSummary> {
  const { rows } = await connectors.findMany();
  return { connectors: rows };
}

// Un conector por id (para validar antes de sincronizar).
export async function getConnector(id: string): Promise<IntegrationConnector | null> {
  return connectors.findOne({ id });
}

// POST /api/integrations/:id/sync
export async function syncConnector(_id: string): Promise<SyncResult> {
  // En producción: dispara una corrida del pipeline del conector `id`.
  return { ok: true, syncedAt: new Date().toISOString() };
}

// ── Loop de resultados: intervenciones (seguimiento) ─────────────────────────
// La tabla `interventions` ES el store. Los resultados medidos aquí serán las
// ETIQUETAS con las que el modelo aprende. Con DB: insert/select/update reales.
const INTERVENTION_SEED: Intervention[] = [
  { id: "iv-1", ref: "#9445-1041", line: "L3", play: "1:1 con supervisor y ajuste de ruta de transporte", status: "done", outcome: "retained", assignedAt: daysAgo(6), assignedBy: "Demo Admin" },
  { id: "iv-2", ref: "#0A25-3150", line: "L5", play: "Revisar carga de horas extra del turno", status: "done", outcome: "left", assignedAt: daysAgo(9), assignedBy: "Diego Ramírez" },
  { id: "iv-3", ref: "#E7D9-6515", line: "L3", play: "Plan de retención prioritario; mentor asignado", status: "in_progress", outcome: "pending", assignedAt: daysAgo(3), assignedBy: "Demo Admin" },
  { id: "iv-4", ref: "#11E2-2898", line: "L3", play: "Reasignar de cuadrilla por conflicto con supervisor", status: "in_progress", outcome: "pending", assignedAt: daysAgo(2), assignedBy: "Diego Ramírez" },
  { id: "iv-5", ref: "#2108-2836", line: "L5", play: "Bono de asistencia posterior a nómina", status: "assigned", outcome: "pending", assignedAt: daysAgo(1), assignedBy: "Demo Admin" },
];
const interventions = createTable<Intervention>(INTERVENTION_SEED);

export async function getInterventions(): Promise<InterventionsSummary> {
  const { rows } = await interventions.findMany({ order: { field: "assignedAt", ascending: false } });
  return { interventions: rows };
}

export async function createIntervention(input: {
  ref: string;
  line: string;
  play: string;
  assignedBy: string;
}): Promise<Intervention> {
  return interventions.insert({
    id: `iv-${Date.now().toString(36)}`,
    ref: input.ref,
    line: input.line,
    play: input.play || "Plan de retención",
    status: "assigned",
    outcome: "pending",
    assignedAt: new Date().toISOString(),
    assignedBy: input.assignedBy || "—",
  });
}

export async function updateIntervention(
  id: string,
  patch: { status?: InterventionStatus; outcome?: InterventionOutcome }
): Promise<Intervention | null> {
  const clean: Partial<Intervention> = {};
  if (patch.status) clean.status = patch.status;
  if (patch.outcome) clean.outcome = patch.outcome;
  return interventions.update({ id }, clean);
}

// ── Pre-contratación: candidatos ─────────────────────────────────────────────
// Semilla de vectores de features (estabilidad, 0–1) + meta. El score, la
// supervivencia, el costo y los drivers los CALCULA el motor (lib/hiring.ts), no
// están escritos a mano. Con un ATS real: estas señales salen del candidato.
interface CandidateSeed {
  id: string;
  ref: string;
  role: string;
  line: string;
  source: Candidate["source"];
  appliedAt: string;
  interviewDone: boolean;
  features: number[]; // [sourceQuality, commuteFit, tenureHistory, payFit, interviewSignal, roleStability]
}

const CANDIDATE_SEED: CandidateSeed[] = [
  { id: "cn-7731", ref: "#CN-7731", role: "Operador de ensamble", line: "L3", source: "referral", appliedAt: daysAgo(1), interviewDone: true, features: [0.9, 0.85, 0.8, 0.7, 0.8, 0.7] },
  { id: "cn-6620", ref: "#CN-6620", role: "Operador de soldadura", line: "L2", source: "rehire", appliedAt: daysAgo(2), interviewDone: true, features: [0.85, 0.6, 0.9, 0.65, 0.7, 0.6] },
  { id: "cn-5093", ref: "#CN-5093", role: "Inspector de calidad", line: "L5", source: "job_board", appliedAt: daysAgo(2), interviewDone: true, features: [0.5, 0.3, 0.55, 0.55, 0.6, 0.5] },
  { id: "cn-4471", ref: "#CN-4471", role: "Operador de línea SMT", line: "L4", source: "agency", appliedAt: daysAgo(3), interviewDone: false, features: [0.35, 0.45, 0.25, 0.4, 0.45, 0.4] },
  { id: "cn-3380", ref: "#CN-3380", role: "Operador de empaque", line: "L7", source: "walk_in", appliedAt: daysAgo(4), interviewDone: false, features: [0.3, 0.25, 0.3, 0.35, 0.4, 0.3] },
  { id: "cn-2954", ref: "#CN-2954", role: "Operador de ensamble", line: "L3", source: "referral", appliedAt: daysAgo(1), interviewDone: true, features: [0.85, 0.25, 0.55, 0.45, 0.55, 0.5] },
  { id: "cn-8812", ref: "#CN-8812", role: "Montacarguista", line: "L1", source: "job_board", appliedAt: daysAgo(5), interviewDone: true, features: [0.55, 0.6, 0.6, 0.8, 0.85, 0.6] },
  { id: "cn-7106", ref: "#CN-7106", role: "Operador de soldadura", line: "L5", source: "agency", appliedAt: daysAgo(3), interviewDone: true, features: [0.45, 0.5, 0.45, 0.45, 0.6, 0.45] },
  { id: "cn-9237", ref: "#CN-9237", role: "Inspector de calidad", line: "L2", source: "referral", appliedAt: daysAgo(1), interviewDone: true, features: [0.9, 0.8, 0.85, 0.75, 0.9, 0.8] },
];

const candidates = createTable<Candidate>(CANDIDATE_SEED.map(scoreCandidate).sort((a, b) => b.costRisk - a.costRisk));

// GET /api/candidates
export async function getCandidates(): Promise<CandidatesSummary> {
  const { rows } = await candidates.findMany();
  const atRisk = rows.filter((c) => c.recommendation !== "advance");
  return {
    candidates: rows,
    kpis: {
      pipeline: rows.length,
      avgSurvival90: Math.round(rows.reduce((s, c) => s + c.survival90, 0) / rows.length),
      costAtRiskMxn: atRisk.reduce((s, c) => s + c.costRisk, 0),
      advanceReady: rows.filter((c) => c.recommendation === "advance").length,
    },
  };
}

// Un candidato por id (para el recap de entrevista).
export async function getCandidate(id: string): Promise<Candidate | null> {
  return candidates.findOne({ id });
}

// ── Voz del empleado: escucha con IA ─────────────────────────────────────────
// Hoy: temas/sentimiento semilla (lo que un motor de NLP produciría). Las CITAS
// quedan en su idioma original (español de planta) a propósito — son el dato crudo.
const VOICE: VoiceSummary = {
  overallSentiment: -14,
  responseRate: 71,
  responses: 838,
  themes: [
    { id: "transport", mentions: 184, sentiment: -38, delta: -9, trend: [-18, -22, -25, -28, -30, -33, -36, -38] },
    { id: "supervisor", mentions: 142, sentiment: -31, delta: -12, trend: [-12, -14, -18, -20, -22, -26, -29, -31] },
    { id: "pay", mentions: 167, sentiment: -22, delta: -3, trend: [-16, -18, -17, -19, -20, -21, -21, -22] },
    { id: "workload", mentions: 121, sentiment: -19, delta: -6, trend: [-8, -10, -12, -13, -15, -16, -18, -19] },
    { id: "cafeteria", mentions: 73, sentiment: -8, delta: 2, trend: [-12, -11, -10, -10, -9, -9, -8, -8] },
    { id: "safety", mentions: 64, sentiment: 11, delta: 4, trend: [4, 5, 6, 7, 8, 9, 10, 11] },
    { id: "recognition", mentions: 58, sentiment: 24, delta: 7, trend: [12, 14, 16, 18, 19, 21, 23, 24] },
  ],
  byLine: [
    { line: "L3", sentiment: -34 },
    { line: "L5", sentiment: -21 },
    { line: "L4", sentiment: -6 },
    { line: "L2", sentiment: 8 },
    { line: "L1", sentiment: 14 },
    { line: "L6", sentiment: 18 },
    { line: "L7", sentiment: 9 },
  ],
  verbatims: [
    { id: "v1", text: "La ruta de transporte cambió y ahora llego tarde aunque salga de casa más temprano.", channel: "survey", line: "L3", theme: "transport", sentiment: -52 },
    { id: "v2", text: "Mi supervisor solo nos habla para regañar; nadie reconoce cuando sacamos la meta.", channel: "exit", line: "L3", theme: "supervisor", sentiment: -61 },
    { id: "v3", text: "El sueldo está bien pero la planta de enfrente paga más por el mismo trabajo.", channel: "survey", line: "L5", theme: "pay", sentiment: -40 },
    { id: "v4", text: "Demasiadas horas extra obligatorias esta temporada, ya no veo a mi familia.", channel: "ticket", line: "L5", theme: "workload", sentiment: -47 },
    { id: "v5", text: "El nuevo equipo de seguridad y los lentes nuevos sí se agradecen.", channel: "survey", line: "L1", theme: "safety", sentiment: 38 },
    { id: "v6", text: "Me gustó que reconocieran al equipo en la junta del mes pasado.", channel: "survey", line: "L6", theme: "recognition", sentiment: 49 },
  ],
  alerts: [
    { id: "a1", theme: "supervisor", line: "L3", sentiment: -31, severity: "high" },
    { id: "a2", theme: "transport", line: "L3", sentiment: -38, severity: "high" },
    { id: "a3", theme: "workload", line: "L5", sentiment: -19, severity: "medium" },
  ],
};

// GET /api/voice
export async function getVoiceSummary(): Promise<VoiceSummary> {
  return VOICE;
}

// GET /api/reports/summary
// Mira hacia atrás: histórico de rotación + impacto (ROI). byLine y drivers se
// agregan del dataset real (lectura completa + agregación en el cerebro); KPIs y
// serie mensual son mock determinista (con Supabase: GROUP BY mes / línea / factor).
export async function getReportSummary(): Promise<ReportSummary> {
  const { rows: all } = await employees.findMany();

  const byLineCount: Record<string, number> = {};
  const factorWeight: Record<string, number> = {};
  for (const e of all) {
    byLineCount[e.line] = (byLineCount[e.line] ?? 0) + 1;
    for (const d of e.drivers) {
      factorWeight[d.factor] = (factorWeight[d.factor] ?? 0) + d.contrib;
    }
  }

  // Rotación anualizada por línea (override conocido; resto, base por defecto).
  const lineRate: Record<string, number> = { L3: 22, L5: 16, L4: 11, L2: 9, L1: 8, L6: 6, L7: 7 };
  const byLine = ["L1", "L2", "L3", "L4", "L5", "L6", "L7"]
    .map((line) => ({ line, rate: lineRate[line] ?? 7, count: byLineCount[line] ?? 0 }))
    .sort((a, b) => b.rate - a.rate);

  // Causas: peso SHAP agregado de los marcados, normalizado a %.
  const totalW = Object.values(factorWeight).reduce((s, v) => s + v, 0) || 1;
  const drivers = Object.entries(factorWeight)
    .map(([factor, w]) => ({ factor, weight: Math.round((w / totalW) * 100) }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 6);

  // Rotación mensual (12 meses): rango realista de maquila, mejora gradual reciente.
  const attrition = [15.8, 16.2, 15.1, 14.6, 15.3, 14.1, 13.4, 13.8, 12.6, 11.9, 11.2, 10.7];

  const retained = 16; // estimación de retenidos entre los marcados
  return {
    periodMonths: 12,
    kpis: {
      interventions: 24,
      retained,
      costAvoidedMxn: retained * REPLACEMENT_COST_MXN,
      precision: 78,
    },
    attrition,
    byLine,
    drivers,
  };
}

// GET /api/pilot/summary
// Pilot causal: el experimento aleatorizado que prueba el ROI. Se computa en el
// motor (lib/causal.ts) con estadística real; aquí solo se expone por la frontera.
export async function getPilotSummary(): Promise<PilotSummary> {
  return PILOT_SUMMARY;
}

// GET /api/governance
// Gobernanza y equidad: equidad por grupo (lib/governance), señales proxy sobre
// los MISMOS drivers agregados que ve /reportes, y el registro de decisiones — las
// intervenciones unidas (join en memoria) a la banda/driver del trabajador.
export async function getGovernanceSummary(): Promise<GovernanceSummary> {
  const fairness = buildFairness();
  const par = parity(fairness);
  const calibration = buildCalibration();
  const cal = calibrationGap(calibration);

  const [report, ivPage, empPage] = await Promise.all([
    getReportSummary(),
    interventions.findMany({ order: { field: "assignedAt", ascending: false } }),
    employees.findMany(),
  ]);
  const proxies = buildProxies(report.drivers);
  const byRef = new Map(empPage.rows.map((e) => [e.ref, e]));

  const log: GovernanceDecision[] = ivPage.rows.map((iv) => {
    const e = byRef.get(iv.ref);
    return {
      id: iv.id,
      ref: iv.ref,
      line: iv.line,
      play: iv.play,
      by: iv.assignedBy,
      at: iv.assignedAt,
      status: iv.status,
      outcome: iv.outcome,
      band: e?.band ?? "alto",
      driver: e?.driver ?? "—",
    };
  });
  const measured = log.filter((d) => d.outcome !== "pending").length;

  return {
    parityRatio: par.ratio,
    parityStatus: par.status,
    proxyCount: proxies.filter((p) => p.risk !== "low").length,
    decisionCount: log.length,
    measuredPct: log.length ? Math.round((measured / log.length) * 100) : 0,
    calibrationGap: cal.gap,
    calibrationStatus: cal.status,
    fairness,
    calibration,
    proxies,
    log,
  };
}
