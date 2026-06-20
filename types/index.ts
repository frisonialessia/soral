// types/index.ts
// Contrato de datos: el shape exacto que la API devuelve y la UI consume.
// Coincide con el predictions_payload.json validado en la simulación de integración.

export type RiskBand =
  | "solido"
  | "estable"
  | "vigilancia"
  | "medio"
  | "alto"
  | "critico";

export interface ShapDriver {
  factor: string;      // "Retardos en aceleración"
  contrib: number;     // 0–100, suman ~100
  detail: string;      // "tendencia de retardos en 0.82 (subiendo)"
}

export type RadarAxis = [string, number]; // ["Puntualidad", 0.88]

export interface EmployeePrediction {
  ref: string;              // "#A3F9-4471" (display_ref anonimizado)
  score: number;            // 0–100
  band: RiskBand;
  driver: string;           // driver principal, para la tabla
  line: string;             // "L3"
  shift: string;            // "nocturno"
  tenure: number;           // días de antigüedad
  evidence: string;         // texto de evidencia (de los detalles SHAP)
  drivers: ShapDriver[];    // SHAP completo
  radar: RadarAxis[];       // 6 ejes
  trend: number[];          // 12 puntos semanales
  reco: string;             // recomendación del LLM (texto multilínea)
}

export interface LineDetail {
  id: string;               // "L3"
  turnover90d: string;      // "22%"
  productivity: string;     // "−12%"
  supervisorEffect: string; // "Alto"
  shift: string;
  employees: EmployeePrediction[];
}

export interface PlantSummary {
  tenantId: string;
  weekStart: string;
  modelVersion: string;
  highRisk: number;
  watch: number;
  stable: number;
  savingMxn: number;
  lines: { id: string; count: number }[];
  topRisk: EmployeePrediction[];
}
