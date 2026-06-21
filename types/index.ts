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
