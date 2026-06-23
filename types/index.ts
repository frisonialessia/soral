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

export const LineDetailSchema = z.object({
  id: z.string(), // "L3"
  turnover90d: z.string(), // "22%"
  productivity: z.string(), // "−12%"
  supervisorEffect: z.string(), // "Alto"
  shift: z.string(),
  employees: z.array(EmployeePredictionSchema),
});
export type LineDetail = z.infer<typeof LineDetailSchema>;

export const PlantSummarySchema = z.object({
  tenantId: z.string(),
  weekStart: z.string(),
  modelVersion: z.string(),
  highRisk: z.number(),
  watch: z.number(),
  stable: z.number(),
  savingMxn: z.number(),
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
