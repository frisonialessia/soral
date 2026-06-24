// lib/governance.ts
// Lógica de gobernanza y equidad — pura y testeable. No conoce HTTP ni React.
// El data-service la usa para armar GovernanceSummary; la UI solo la pinta.

import type { FairnessDimension, ProxySignal } from "@/types";

// --- Equidad por grupo ---
// Tasa de riesgo = % del grupo que el modelo coloca en banda elevada. Son
// estadísticas a nivel POBLACIÓN (sobre los ~1180), distintas del worklist
// semanal (top-10). Las tasas por línea siguen la rotación conocida por línea;
// turno y antigüedad reflejan la composición de riesgo de la planta.
interface GroupSeed {
  group: string;
  size: number;
  rate: number;
}

const LINE_GROUPS: GroupSeed[] = [
  { group: "L1", size: 180, rate: 8 },
  { group: "L2", size: 200, rate: 9 },
  { group: "L3", size: 210, rate: 22 },
  { group: "L4", size: 170, rate: 11 },
  { group: "L5", size: 190, rate: 16 },
  { group: "L6", size: 130, rate: 6 },
  { group: "L7", size: 100, rate: 7 },
];

const SHIFT_GROUPS: GroupSeed[] = [
  { group: "morning", size: 470, rate: 7 },
  { group: "evening", size: 360, rate: 9 },
  { group: "night", size: 290, rate: 16 },
  { group: "rotating", size: 60, rate: 8 },
];

const TENURE_GROUPS: GroupSeed[] = [
  { group: "lt3m", size: 210, rate: 18 },
  { group: "m3_12", size: 420, rate: 12 },
  { group: "y1_3", size: 360, rate: 8 },
  { group: "gt3y", size: 190, rate: 6 },
];

// Regla de los 4/5: razón = tasa mínima / tasa máxima. Por debajo de 0.8 ⇒ revisar.
export function impactRatio(rates: number[]): number {
  const max = Math.max(...rates);
  const min = Math.min(...rates);
  return max === 0 ? 1 : min / max;
}

function buildDimension(
  dimension: FairnessDimension["dimension"],
  sensitive: boolean,
  seeds: GroupSeed[]
): FairnessDimension {
  const ratio = impactRatio(seeds.map((g) => g.rate));
  return {
    dimension,
    sensitive,
    groups: seeds.map((g) => ({ group: g.group, size: g.size, rate: g.rate })),
    ratio: Math.round(ratio * 100) / 100,
    status: ratio < 0.8 ? "review" : "ok",
  };
}

export function buildFairness(): FairnessDimension[] {
  return [
    // La línea es operativa: que L3 rote más es esperado, no un sesgo. Turno y
    // antigüedad SÍ son sensibles (pueden ser proxy de un atributo protegido).
    buildDimension("line", false, LINE_GROUPS),
    buildDimension("shift", true, SHIFT_GROUPS),
    buildDimension("tenure", true, TENURE_GROUPS),
  ];
}

// Paridad = peor razón entre las dimensiones SENSIBLES. La línea queda fuera: su
// variación es operativa y se mostraría como falso positivo.
export function parity(fairness: FairnessDimension[]): { ratio: number; status: "ok" | "review" } {
  const sensitive = fairness.filter((d) => d.sensitive);
  const ratio = sensitive.length ? Math.min(...sensitive.map((d) => d.ratio)) : 1;
  return { ratio, status: ratio < 0.8 ? "review" : "ok" };
}

// --- Señales proxy ---
// Cada driver se evalúa: ¿podría correlacionar con un atributo protegido? No se
// elimina en automático (eso esconde el sesgo): se DOCUMENTA y se vigila.
const PROXY_RULES: { match: RegExp; risk: ProxySignal["risk"]; proxyFor: ProxySignal["proxyFor"] }[] = [
  { match: /antig|edad|senior/i, risk: "high", proxyFor: "age" },
  { match: /transport|ruta|traslad|distancia|domicil/i, risk: "medium", proxyFor: "location" },
  { match: /n[oó]mina|falta|pago|deuda|anticipo|sueldo/i, risk: "medium", proxyFor: "finance" },
  { match: /tiempo extra|hora extra|disponibilidad/i, risk: "medium", proxyFor: "family" },
];

export function assessProxy(factor: string): { risk: ProxySignal["risk"]; proxyFor: ProxySignal["proxyFor"] } {
  for (const r of PROXY_RULES) if (r.match.test(factor)) return { risk: r.risk, proxyFor: r.proxyFor };
  return { risk: "low", proxyFor: "none" };
}

const RISK_ORDER: Record<ProxySignal["risk"], number> = { high: 0, medium: 1, low: 2 };

export function buildProxies(drivers: { factor: string; weight: number }[]): ProxySignal[] {
  return drivers
    .map((d) => ({ factor: d.factor, weight: d.weight, ...assessProxy(d.factor) }))
    .sort((a, b) => RISK_ORDER[a.risk] - RISK_ORDER[b.risk] || b.weight - a.weight);
}
