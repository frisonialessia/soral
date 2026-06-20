// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RiskBand } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Rampa de riesgo cerrada — única fuente de color de la app
export const RISK_RAMP: [number, string][] = [
  [0, "#5B6EF5"],
  [40, "#8476FF"],
  [55, "#B49AED"],
  [70, "#E59BB0"],
  [80, "#F56C89"],
  [90, "#EB4F6C"],
];

export function riskColor(score: number): string {
  let c = RISK_RAMP[0][1];
  for (const [t, col] of RISK_RAMP) if (score >= t) c = col;
  return c;
}

export function bandLabel(band: RiskBand): string {
  return {
    solido: "Sólido",
    estable: "Estable",
    vigilancia: "Vigilancia",
    medio: "Medio",
    alto: "Alto",
    critico: "Crítico",
  }[band];
}

export function formatMxn(n: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(n);
}
