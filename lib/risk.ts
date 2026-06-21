// lib/risk.ts
// FUENTE ÚNICA del motor de riesgo de Soral.
// El modelo produce un score de rotación 0–100; aquí —y SOLO aquí— ese score se
// traduce a banda, color y etiqueta. Antes esta lógica estaba duplicada en
// data-service, dot-field y utils: cualquier desalineación clasificaría mal a un
// empleado y mandaría al supervisor a intervenir a la persona equivocada.
//
// Nota: los tokens de color de Tailwind (tailwind.config.ts → `risk.*`) reflejan
// estos mismos hex; manténlos en sync con RISK_BANDS.

import type { RiskBand } from "@/types";

export interface BandDef {
  band: RiskBand;
  /** Umbral inferior inclusivo del score (0–100). */
  min: number;
  color: string;
  label: string;
}

// Ordenadas de mayor a menor riesgo: gana la primera cuyo `min` <= score.
export const RISK_BANDS: readonly BandDef[] = [
  { band: "critico", min: 90, color: "#EB4F6C", label: "Crítico" },
  { band: "alto", min: 80, color: "#F56C89", label: "Alto" },
  { band: "medio", min: 70, color: "#E59BB0", label: "Medio" },
  { band: "vigilancia", min: 55, color: "#B49AED", label: "Vigilancia" },
  { band: "estable", min: 40, color: "#8476FF", label: "Estable" },
  { band: "solido", min: 0, color: "#5B6EF5", label: "Sólido" },
] as const;

const BY_BAND = Object.fromEntries(RISK_BANDS.map((b) => [b.band, b])) as Record<
  RiskBand,
  BandDef
>;

/** score (0–100) → banda de riesgo. */
export function bandOf(score: number): RiskBand {
  for (const b of RISK_BANDS) if (score >= b.min) return b.band;
  return "solido";
}

/** score (0–100) → color de la rampa (el de su banda). */
export function riskColor(score: number): string {
  return BY_BAND[bandOf(score)].color;
}

/** banda → etiqueta en español. */
export function bandLabel(band: RiskBand): string {
  return BY_BAND[band].label;
}
