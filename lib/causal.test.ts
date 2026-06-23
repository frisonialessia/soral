// lib/causal.test.ts
// El pilot causal debe ser estadísticamente correcto: recuperar el efecto verdadero
// inyectado, dar un IC coherente y un valor p significativo. Si la matemática se
// rompe, estos tests fallan (no es decorado: es la prueba del ROI).
import { describe, it, expect } from "vitest";
import { PILOT_SUMMARY, GROUND_TRUTH_ATE_PP } from "./causal";
import { PilotSummarySchema } from "@/types";
import { MODEL_INFO } from "./model";

describe("pilot causal", () => {
  const p = PILOT_SUMMARY;

  it("cumple el contrato Zod", () => {
    expect(() => PilotSummarySchema.parse(p)).not.toThrow();
  });

  it("recupera el efecto verdadero dentro del IC 95 %", () => {
    expect(GROUND_TRUTH_ATE_PP).toBeGreaterThanOrEqual(p.ciLow);
    expect(GROUND_TRUTH_ATE_PP).toBeLessThanOrEqual(p.ciHigh);
  });

  it("el ATE cae dentro de su propio intervalo y es positivo", () => {
    expect(p.ate).toBeGreaterThan(p.ciLow);
    expect(p.ate).toBeLessThan(p.ciHigh);
    expect(p.ate).toBeGreaterThan(0);
  });

  it("tratados retienen más que control y el efecto es significativo", () => {
    expect(p.treated.rate).toBeGreaterThan(p.control.rate);
    expect(p.significant).toBe(true);
    expect(p.pValue).toBeLessThan(0.05);
    expect(p.pValue).toBeGreaterThanOrEqual(0);
  });

  it("NNT es coherente con el ATE", () => {
    expect(p.nnt).toBe(Math.ceil(1 / (p.ate / 100)));
    expect(p.nnt).toBeGreaterThan(0);
  });

  it("el ROI deriva del uplift y el costo de reemplazo", () => {
    expect(p.costAvoidedPilot).toBe(p.extraRetainedPilot * p.replacementCostMxn);
    expect(p.costAvoidedAnnual).toBe(p.extraRetainedAnnual * p.replacementCostMxn);
    expect(p.extraRetainedAnnual).toBeGreaterThan(p.extraRetainedPilot);
  });

  it("la curva acumulada termina con toda la muestra y crece monótona", () => {
    expect(p.trend.length).toBeGreaterThan(0);
    expect(p.trend[p.trend.length - 1].n).toBe(p.designN);
    for (let i = 1; i < p.trend.length; i++) {
      expect(p.trend[i].n).toBeGreaterThanOrEqual(p.trend[i - 1].n);
    }
  });

  it("desglosa el uplift por línea sin perder sujetos", () => {
    expect(p.byLine.length).toBeGreaterThan(0);
    const total = p.byLine.reduce((s, l) => s + l.nT + l.nC, 0);
    expect(total).toBe(p.designN);
    for (const l of p.byLine) expect(l.ciHigh).toBeGreaterThanOrEqual(l.ciLow);
  });

  it("el flywheel ancla al AUC actual y proyecta el siguiente reentrenamiento", () => {
    const shipped = p.retrains.filter((r) => !r.projected);
    const current = shipped[shipped.length - 1];
    expect(current.auc).toBeCloseTo(MODEL_INFO.metrics.auc, 2);
    expect(p.retrains[p.retrains.length - 1].projected).toBe(true);
    for (let i = 1; i < p.retrains.length; i++) {
      expect(p.retrains[i].labels).toBeGreaterThan(p.retrains[i - 1].labels);
    }
  });
});
