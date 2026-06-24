import { describe, it, expect, afterEach } from "vitest";
import {
  getCostModel,
  setCostModel,
  __resetCostModel,
  totalOf,
  DEFAULT_COMPONENTS,
  DEFAULT_COST_PER_REPLACEMENT,
} from "./cost-model";
import { getPlantSummary, getReportSummary } from "./data-service";

// Cada test deja el store como lo encontró (sin configurar).
afterEach(() => __resetCostModel());

describe("cost-model", () => {
  it("por defecto es una estimación de referencia de 36,800", async () => {
    const m = await getCostModel();
    expect(m.configured).toBe(false);
    expect(m.updatedAt).toBeNull();
    expect(m.costPerReplacement).toBe(36_800);
    expect(DEFAULT_COST_PER_REPLACEMENT).toBe(36_800);
    expect(totalOf(DEFAULT_COMPONENTS)).toBe(36_800);
  });

  it("setCostModel guarda los componentes y marca configured", async () => {
    const m = await setCostModel({ recruiting: 1000, screening: 1000, training: 1000, productivity: 1000, coverage: 1000, separation: 1000 });
    expect(m.configured).toBe(true);
    expect(m.costPerReplacement).toBe(6_000);
    expect(typeof m.updatedAt).toBe("string");
  });

  it("el costo configurado se propaga a planta y reportes (una sola fuente de verdad)", async () => {
    const plant0 = await getPlantSummary();
    expect(plant0.costEstimated).toBe(true);
    expect(plant0.savingMxn).toBe(plant0.highRisk * 36_800);

    await setCostModel({ recruiting: 10_000, screening: 10_000, training: 10_000, productivity: 0, coverage: 0, separation: 0 }); // 30,000

    const plant1 = await getPlantSummary();
    expect(plant1.costEstimated).toBe(false);
    expect(plant1.costPerReplacement).toBe(30_000);
    expect(plant1.savingMxn).toBe(plant1.highRisk * 30_000);

    const report = await getReportSummary();
    expect(report.kpis.costEstimated).toBe(false);
    expect(report.kpis.costAvoidedMxn).toBe(report.kpis.retained * 30_000);
  });
});
