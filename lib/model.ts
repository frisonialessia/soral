// lib/model.ts
// SEAM DEL MODELO (el "cerebro"). Hoy el score y el SHAP de cada empleado vienen
// del dataset semilla; este módulo define el CONTRATO y los metadatos del modelo
// (la "model card") para que el día que entre un modelo real —p. ej. un hazard de
// supervivencia calibrado— se enchufe aquí SIN tocar la UI. También deriva la
// CONFIANZA de cada predicción, para mostrar incertidumbre en vez de un número seco.

export interface ModelMetrics {
  auc: number; // 0–1
  precision: number; // 0–1
  recall: number; // 0–1
  leadTimeDays: number; // anticipación media de la alerta
}

export interface CalibrationPoint {
  predicted: number; // % de riesgo predicho (bin)
  observed: number; // % que realmente se fue en ese bin
}

export interface ModelInfo {
  version: string;
  horizonDays: number;
  trainedAt: string; // ISO
  sampleSize: number; // trabajadores en el entrenamiento
  metrics: ModelMetrics;
  calibration: CalibrationPoint[];
}

// Hoy: valores de referencia (el dataset semilla simula este modelo). Cuando el
// modelo real exista, estos metadatos los publica el pipeline de entrenamiento.
export const MODEL_INFO: ModelInfo = {
  version: "xgb_sim_v0",
  horizonDays: 30,
  trainedAt: "2026-06-08",
  sampleSize: 5400,
  metrics: { auc: 0.86, precision: 0.78, recall: 0.71, leadTimeDays: 26 },
  calibration: [
    { predicted: 10, observed: 8 },
    { predicted: 30, observed: 27 },
    { predicted: 50, observed: 52 },
    { predicted: 70, observed: 73 },
    { predicted: 90, observed: 88 },
  ],
};

export type ConfidenceLevel = "high" | "medium" | "low";
export interface Confidence {
  level: ConfidenceLevel;
  pct: number;
}

// Confianza derivada: mayor en los extremos del score y MENOR cerca del umbral de
// decisión (≈80), donde un punto cambia la acción. Con un modelo real: ancho del
// intervalo de predicción / del bin de calibración.
export function confidenceOf(score: number): Confidence {
  const dist = Math.abs(score - 80);
  const pct = Math.min(96, Math.round(55 + dist * 2));
  const level: ConfidenceLevel = pct >= 85 ? "high" : pct >= 70 ? "medium" : "low";
  return { level, pct };
}

// Contrato del modelo (referencia para cuando se enchufe el real):
//   predict(features) -> { score: 0–100, drivers: ShapDriver[] }
// La UI ya consume EmployeePrediction (score + drivers + radar), así que el modelo
// real solo debe producir ese shape. Este comentario marca el punto de inyección.
