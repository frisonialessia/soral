// types/index.ts
// Contrato de datos de Soral, como esquemas Zod. Los tipos de TypeScript se
// DERIVAN de los esquemas (z.infer), así que validación runtime y tipos
// compile-time nunca se desincronizan: hay una sola fuente de verdad.
//
// El api-client valida cada respuesta contra estos esquemas en la frontera, de
// modo que un dato malformado (de la DB o del modelo) se detecta ahí —con un
// error claro— en vez de reventar la UI a mitad del render.

import { z } from "zod";

export const RiskBandSchema = z.enum([
  "solido",
  "estable",
  "vigilancia",
  "medio",
  "alto",
  "critico",
]);
export type RiskBand = z.infer<typeof RiskBandSchema>;

export const ShapDriverSchema = z.object({
  factor: z.string(), // "Retardos en aceleración"
  contrib: z.number(), // 0–100, suman ~100
  detail: z.string(), // "tendencia de retardos en 0.82 (subiendo)"
});
export type ShapDriver = z.infer<typeof ShapDriverSchema>;

export const RadarAxisSchema = z.tuple([z.string(), z.number()]); // ["Puntualidad", 0.88]
export type RadarAxis = z.infer<typeof RadarAxisSchema>;

export const EmployeePredictionSchema = z.object({
  ref: z.string(), // "#A3F9-4471" (display_ref anonimizado)
  score: z.number(), // 0–100
  band: RiskBandSchema,
  driver: z.string(), // driver principal, para la tabla
  line: z.string(), // "L3"
  shift: z.string(), // "nocturno"
  tenure: z.number(), // días de antigüedad
  evidence: z.string(), // texto de evidencia (de los detalles SHAP)
  drivers: z.array(ShapDriverSchema), // SHAP completo
  radar: z.array(RadarAxisSchema), // 6 ejes
  trend: z.array(z.number()), // 12 puntos semanales
  reco: z.string(), // recomendación del LLM (texto multilínea)
});
export type EmployeePrediction = z.infer<typeof EmployeePredictionSchema>;

// Página de resultados de un listado (GET /api/employees): filas + total previo a
// paginar, como devolvería supabase con count:'exact'. Contrato de RESPUESTA.
export const EmployeePageSchema = z.object({
  rows: z.array(EmployeePredictionSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});
export type EmployeePage = z.infer<typeof EmployeePageSchema>;

export const LineDetailSchema = z.object({
  id: z.string(), // "L3"
  turnover90d: z.string(), // "22%"
  productivity: z.string(), // "−12%"
  supervisorEffect: z.string(), // "Alto"
  shift: z.string(),
  employees: z.array(EmployeePredictionSchema),
});
export type LineDetail = z.infer<typeof LineDetailSchema>;

// ── Costo de rotación (configurable por RH) ──────────────────────────────────
// El "monto por reemplazo" deja de ser una constante regada por la app: RH lo
// calcula por componentes (lib/server/cost-model). `configured:false` = todavía es
// una estimación de referencia y la UI debe marcarla como tal, no como un hecho.
export const CostComponentsSchema = z.object({
  recruiting: z.number().min(0), // reclutamiento y selección
  screening: z.number().min(0), // exámenes y trámites de alta
  training: z.number().min(0), // capacitación e inducción
  productivity: z.number().min(0), // curva de productividad
  coverage: z.number().min(0), // cobertura del hueco (horas extra)
  separation: z.number().min(0), // finiquito / separación
});
export type CostComponents = z.infer<typeof CostComponentsSchema>;

export const CostModelSchema = z.object({
  components: CostComponentsSchema,
  costPerReplacement: z.number(),
  configured: z.boolean(),
  updatedAt: z.string().nullable(),
});
export type CostModel = z.infer<typeof CostModelSchema>;

// Perfil de la planta (configurable). El headcount dimensiona la población, así que
// los conteos del dashboard cuadran con lo que se ve al drillear.
export const PlantProfileSchema = z.object({
  name: z.string(),
  headcount: z.number(),
  lines: z.array(z.string()),
  shifts: z.array(z.string()),
  configured: z.boolean(),
  updatedAt: z.string().nullable(),
});
export type PlantProfile = z.infer<typeof PlantProfileSchema>;

export const PlantSummarySchema = z.object({
  tenantId: z.string(),
  weekStart: z.string(),
  modelVersion: z.string(),
  highRisk: z.number(),
  watch: z.number(),
  stable: z.number(),
  savingMxn: z.number(),
  costPerReplacement: z.number(), // costo por reemplazo vigente (modelo de costo)
  costEstimated: z.boolean(), // true = estimación de referencia (RH no lo ha configurado)
  trend: z.object({
    highRisk: z.array(z.number()),
    watch: z.array(z.number()),
    stable: z.array(z.number()),
  }),
  lines: z.array(z.object({ id: z.string(), count: z.number() })),
  topRisk: z.array(EmployeePredictionSchema),
});
export type PlantSummary = z.infer<typeof PlantSummarySchema>;

export const AssignResultSchema = z.object({
  ok: z.literal(true),
  assignedAt: z.string(),
});
export type AssignResult = z.infer<typeof AssignResultSchema>;

export const ReportSummarySchema = z.object({
  periodMonths: z.number(),
  kpis: z.object({
    interventions: z.number(),
    retained: z.number(),
    costAvoidedMxn: z.number(),
    costEstimated: z.boolean(),
    precision: z.number(), // 0–100
  }),
  attrition: z.array(z.number()), // rotación mensual %, 12 puntos
  byLine: z.array(z.object({ line: z.string(), rate: z.number(), count: z.number() })),
  drivers: z.array(z.object({ factor: z.string(), weight: z.number() })), // peso 0–100
});
export type ReportSummary = z.infer<typeof ReportSummarySchema>;

// Briefing semanal generado por IA (o por reglas deterministas como fallback).
export const BriefingSchema = z.object({
  headline: z.string(),
  summary: z.string(),
  points: z.array(z.string()),
  source: z.enum(["llm", "rules"]),
  model: z.string().nullable(),
});
export type Briefing = z.infer<typeof BriefingSchema>;

// Respuesta del asistente "Ask Soral".
export const AskAnswerSchema = z.object({
  answer: z.string(),
  source: z.enum(["llm", "rules"]),
});
export type AskAnswer = z.infer<typeof AskAnswerSchema>;

// Integraciones: conectores que alimentan el modelo (HRIS, nómina, reloj, etc.).
export const ConnectorStatusSchema = z.enum(["connected", "syncing", "error", "disconnected"]);
export type ConnectorStatus = z.infer<typeof ConnectorStatusSchema>;

export const IntegrationConnectorSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(["hris", "payroll", "time", "biometrics", "erp", "files"]),
  status: ConnectorStatusSchema,
  lastSyncMin: z.number().nullable(), // minutos desde la última sync; null = nunca
  records: z.number(),
  frequency: z.enum(["realtime", "hourly", "daily", "manual"]),
  fields: z.array(z.object({ source: z.string(), target: z.string() })),
});
export type IntegrationConnector = z.infer<typeof IntegrationConnectorSchema>;

export const IntegrationsSummarySchema = z.object({
  connectors: z.array(IntegrationConnectorSchema),
});
export type IntegrationsSummary = z.infer<typeof IntegrationsSummarySchema>;

export const SyncResultSchema = z.object({ ok: z.literal(true), syncedAt: z.string() });
export type SyncResult = z.infer<typeof SyncResultSchema>;

// Loop de resultados: una intervención rastreada (asignar play → seguir →
// resultado). Los resultados medidos aquí son las etiquetas del futuro modelo.
export const InterventionStatusSchema = z.enum(["assigned", "in_progress", "done"]);
export type InterventionStatus = z.infer<typeof InterventionStatusSchema>;
export const InterventionOutcomeSchema = z.enum(["pending", "retained", "left"]);
export type InterventionOutcome = z.infer<typeof InterventionOutcomeSchema>;

export const InterventionSchema = z.object({
  id: z.string(),
  ref: z.string(),
  line: z.string(),
  play: z.string(),
  status: InterventionStatusSchema,
  outcome: InterventionOutcomeSchema,
  assignedAt: z.string(),
  assignedBy: z.string(),
});
export type Intervention = z.infer<typeof InterventionSchema>;

export const InterventionsSummarySchema = z.object({
  interventions: z.array(InterventionSchema),
});
export type InterventionsSummary = z.infer<typeof InterventionsSummarySchema>;

// Pre-contratación: riesgo y costo de una contratación. El mismo motor de
// supervivencia, pero en t=0. NO decide a quién contratar (eso es del humano):
// estima cuánto tiempo se quedaría un candidato y cuánto costaría si rota pronto.
export const HireSourceSchema = z.enum(["referral", "rehire", "job_board", "agency", "walk_in"]);
export type HireSource = z.infer<typeof HireSourceSchema>;

export const HireRecommendationSchema = z.enum(["advance", "review", "caution"]);
export type HireRecommendation = z.infer<typeof HireRecommendationSchema>;

export const HireDriverSchema = z.object({
  factor: z.string(), // clave i18n: `hfeat_${id}`
  contrib: z.number(), // |φ| relativo 0–100
  direction: z.enum(["up", "down"]), // up = sube riesgo; down = protege
});
export type HireDriver = z.infer<typeof HireDriverSchema>;

export const CandidateSchema = z.object({
  id: z.string(),
  ref: z.string(), // ref anonimizado del candidato
  role: z.string(),
  line: z.string(), // línea de destino
  source: HireSourceSchema,
  appliedAt: z.string(),
  interviewDone: z.boolean(),
  survival90: z.number(), // 0–100, prob. de seguir a 90 días
  survival12m: z.number(), // 0–100, prob. de seguir a 12 meses
  expectedTenureMonths: z.number(),
  costRisk: z.number(), // MXN: costo esperado si rota antes de 90 días
  recommendation: HireRecommendationSchema,
  drivers: z.array(HireDriverSchema),
});
export type Candidate = z.infer<typeof CandidateSchema>;

export const CandidatesSummarySchema = z.object({
  candidates: z.array(CandidateSchema),
  kpis: z.object({
    pipeline: z.number(),
    avgSurvival90: z.number(), // 0–100
    costAtRiskMxn: z.number(), // suma de costRisk de review + caution
    costEstimated: z.boolean(),
    advanceReady: z.number(),
  }),
});
export type CandidatesSummary = z.infer<typeof CandidatesSummarySchema>;

// Recap de entrevista (IA o reglas). Estructurado y job-related: nunca un
// veredicto de "contratar/no", sino evidencia para que decida el reclutador.
export const InterviewRecapSchema = z.object({
  summary: z.string(),
  strengths: z.array(z.string()),
  watchouts: z.array(z.string()),
  questions: z.array(z.string()), // preguntas estructuradas sugeridas
  source: z.enum(["llm", "rules"]),
});
export type InterviewRecap = z.infer<typeof InterviewRecapSchema>;

// Voz del empleado: escucha con IA de encuestas, entrevistas de salida y tickets
// de RH. Convierte texto libre en temas, sentimiento y alertas tempranas por línea
// — la señal "blanda" que alimenta el modelo de retención.
export const VoiceChannelSchema = z.enum(["survey", "exit", "ticket"]);
export type VoiceChannel = z.infer<typeof VoiceChannelSchema>;

export const VoiceThemeSchema = z.object({
  id: z.string(), // clave i18n: `theme_${id}`
  mentions: z.number(),
  sentiment: z.number(), // −100..100 (negativo = riesgo)
  delta: z.number(), // cambio de sentimiento vs periodo anterior
  trend: z.array(z.number()), // sentimiento por semana (para sparkline)
});
export type VoiceTheme = z.infer<typeof VoiceThemeSchema>;

export const VerbatimSchema = z.object({
  id: z.string(),
  text: z.string(), // cita anonimizada
  channel: VoiceChannelSchema,
  line: z.string(),
  theme: z.string(), // id de tema
  sentiment: z.number(), // −100..100
});
export type Verbatim = z.infer<typeof VerbatimSchema>;

export const VoiceAlertSchema = z.object({
  id: z.string(),
  theme: z.string(), // id de tema (la UI compone el mensaje localizado)
  line: z.string(),
  sentiment: z.number(), // −100..100
  severity: z.enum(["high", "medium"]),
});
export type VoiceAlert = z.infer<typeof VoiceAlertSchema>;

export const VoiceSummarySchema = z.object({
  overallSentiment: z.number(), // −100..100
  responseRate: z.number(), // 0–100
  responses: z.number(),
  themes: z.array(VoiceThemeSchema),
  byLine: z.array(z.object({ line: z.string(), sentiment: z.number() })),
  verbatims: z.array(VerbatimSchema),
  alerts: z.array(VoiceAlertSchema),
});
export type VoiceSummary = z.infer<typeof VoiceSummarySchema>;

// Expediente 360: la línea de tiempo del trabajador — señal → alerta →
// intervención → resultado. Une la señal del modelo con las intervenciones REALES
// (loop de resultados). La UI compone el texto localizado a partir de estos campos.
export const TimelineEventSchema = z.object({
  id: z.string(),
  kind: z.enum(["signal", "alert", "intervention", "outcome"]),
  at: z.string(), // ISO
  driver: z.string().optional(), // signal: factor que se movió
  score: z.number().optional(), // alert: score al disparar
  play: z.string().optional(), // intervention: la jugada asignada
  by: z.string().optional(), // intervention: quién la asignó
  outcome: z.enum(["retained", "left"]).optional(), // outcome
});
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

export const EmployeeTimelineSchema = z.object({
  ref: z.string(),
  events: z.array(TimelineEventSchema),
});
export type EmployeeTimeline = z.infer<typeof EmployeeTimelineSchema>;

// Pilot causal: la PRUEBA de que actuar reduce la rotación. Un experimento
// aleatorizado (tratados vs. control) mide el efecto causal de las intervenciones
// con estadística real (ATE, IC 95 %, valor p, NNT, ROI). Es el artefacto que
// convierte "predecimos quién se va" en "demostramos que lo evitamos".
export const PilotArmSchema = z.object({
  n: z.number(),
  retained: z.number(),
  rate: z.number(), // % de retención del brazo (0–100)
});
export type PilotArm = z.infer<typeof PilotArmSchema>;

export const PilotLineUpliftSchema = z.object({
  line: z.string(),
  nT: z.number(),
  nC: z.number(),
  uplift: z.number(), // puntos porcentuales de retención
  ciLow: z.number(),
  ciHigh: z.number(),
});
export type PilotLineUplift = z.infer<typeof PilotLineUpliftSchema>;

export const PilotTrendPointSchema = z.object({
  week: z.number(),
  ate: z.number(), // pp
  ciLow: z.number(),
  ciHigh: z.number(),
  n: z.number(),
});
export type PilotTrendPoint = z.infer<typeof PilotTrendPointSchema>;

export const RetrainPointSchema = z.object({
  version: z.string(),
  labels: z.number(), // etiquetas (resultados del loop) acumuladas
  auc: z.number(), // 0–1
  projected: z.boolean(), // true = aún no embarcado (proyección)
});
export type RetrainPoint = z.infer<typeof RetrainPointSchema>;

export const PilotSummarySchema = z.object({
  designN: z.number(),
  treated: PilotArmSchema,
  control: PilotArmSchema,
  ate: z.number(), // uplift de retención en pp
  ciLow: z.number(),
  ciHigh: z.number(),
  relUplift: z.number(), // % relativo vs. retención del control
  pValue: z.number(),
  significant: z.boolean(),
  nnt: z.number(), // number needed to treat
  extraRetainedPilot: z.number(),
  costAvoidedPilot: z.number(), // MXN, en el pilot
  annualEligible: z.number(),
  extraRetainedAnnual: z.number(),
  costAvoidedAnnual: z.number(), // MXN, proyección anual
  replacementCostMxn: z.number(),
  costEstimated: z.boolean(),
  byLine: z.array(PilotLineUpliftSchema),
  trend: z.array(PilotTrendPointSchema),
  retrains: z.array(RetrainPointSchema),
});
export type PilotSummary = z.infer<typeof PilotSummarySchema>;

// Gobernanza y equidad: el lente de RESPONSABILIDAD sobre el modelo. Complementa
// la model card (/modelo, qué tan preciso es) con tres cosas que un comité de ética,
// Legal o el sindicato exigen: ¿el modelo trata distinto a unos grupos que a otros?
// ¿alguna señal es proxy de un atributo protegido? ¿quién decidió qué y por qué?
export const FairnessGroupSchema = z.object({
  group: z.string(), // "L3" (línea, literal) | clave i18n para turno/antigüedad
  size: z.number(), // personas en el grupo
  rate: z.number(), // % del grupo que el modelo coloca en banda elevada (0–100)
});
export type FairnessGroup = z.infer<typeof FairnessGroupSchema>;

export const FairnessDimensionSchema = z.object({
  dimension: z.enum(["line", "shift", "tenure"]),
  sensitive: z.boolean(), // ¿es proxy de un atributo protegido? (turno/antigüedad sí; línea no)
  groups: z.array(FairnessGroupSchema),
  ratio: z.number(), // razón de impacto (regla de 4/5): min/max de las tasas, 0–1
  status: z.enum(["ok", "review"]),
});
export type FairnessDimension = z.infer<typeof FairnessDimensionSchema>;

export const ProxySignalSchema = z.object({
  factor: z.string(), // el driver, tal cual (dato)
  weight: z.number(), // peso en el modelo, 0–100
  risk: z.enum(["high", "medium", "low"]),
  proxyFor: z.enum(["age", "location", "finance", "family", "none"]),
});
export type ProxySignal = z.infer<typeof ProxySignalSchema>;

export const GovernanceDecisionSchema = z.object({
  id: z.string(),
  ref: z.string(),
  line: z.string(),
  play: z.string(),
  by: z.string(),
  at: z.string(),
  status: InterventionStatusSchema,
  outcome: InterventionOutcomeSchema,
  band: RiskBandSchema, // el "por qué": banda de riesgo al decidir
  driver: z.string(), // el "por qué": driver principal
});
export type GovernanceDecision = z.infer<typeof GovernanceDecisionSchema>;

// Calibración por grupo: la OTRA mitad de la equidad. No basta con marcar a los
// grupos en igual proporción; el modelo debe ACERTAR igual. Compara el riesgo
// predicho con la rotación observada por grupo — una brecha grande significa que
// sobre/infra-estima a ese grupo.
export const CalibrationGroupSchema = z.object({
  group: z.string(),
  predicted: z.number(), // riesgo medio predicho por el modelo (0–100)
  observed: z.number(), // rotación observada del grupo (0–100)
});
export type CalibrationGroup = z.infer<typeof CalibrationGroupSchema>;

export const CalibrationDimensionSchema = z.object({
  dimension: z.enum(["line", "shift", "tenure"]),
  groups: z.array(CalibrationGroupSchema),
});
export type CalibrationDimension = z.infer<typeof CalibrationDimensionSchema>;

export const GovernanceSummarySchema = z.object({
  parityRatio: z.number(), // peor razón de impacto entre las dimensiones sensibles (0–1)
  parityStatus: z.enum(["ok", "review"]),
  proxyCount: z.number(), // señales proxy de riesgo alto+medio
  decisionCount: z.number(),
  measuredPct: z.number(), // % de decisiones con resultado medido (0–100)
  calibrationGap: z.number(), // mayor |predicho − observado| entre grupos sensibles (pp)
  calibrationStatus: z.enum(["ok", "review"]),
  fairness: z.array(FairnessDimensionSchema),
  calibration: z.array(CalibrationDimensionSchema),
  proxies: z.array(ProxySignalSchema),
  log: z.array(GovernanceDecisionSchema),
});
export type GovernanceSummary = z.infer<typeof GovernanceSummarySchema>;
