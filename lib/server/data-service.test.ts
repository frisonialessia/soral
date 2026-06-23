import { describe, it, expect } from "vitest";
import {
  getPlantSummary,
  getLineDetail,
  getEmployee,
  getReportSummary,
  getIntegrations,
  syncConnector,
} from "@/lib/server/data-service";
import { ReportSummarySchema, IntegrationsSummarySchema } from "@/types";

describe("getPlantSummary", () => {
  it("agrega los buckets de riesgo y el ahorro sobre el dataset semilla", async () => {
    const s = await getPlantSummary();
    expect(s.highRisk).toBe(6); // score >= 80
    expect(s.watch).toBe(3); // 55..79
    expect(s.stable).toBe(1180 - s.highRisk - s.watch); // resto del headcount
    expect(s.savingMxn).toBe(s.highRisk * 36_800);
  });

  it("devuelve el top 10 ordenado por score descendente", async () => {
    const { topRisk } = await getPlantSummary();
    expect(topRisk).toHaveLength(10);
    const scores = topRisk.map((e) => e.score);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
  });

  it("asigna banda a cada registro del top (defensa de contrato)", async () => {
    const { topRisk } = await getPlantSummary();
    expect(topRisk.every((e) => typeof e.band === "string" && e.band.length > 0)).toBe(true);
  });
});

describe("getEmployee", () => {
  it("encuentra por ref y devuelve null si no existe", async () => {
    expect((await getEmployee("#E7D9-6515"))?.score).toBe(100);
    expect(await getEmployee("#NO-EXISTE")).toBeNull();
  });
});

describe("getLineDetail", () => {
  it("filtra empleados de la línea en vigilancia+ (score >= 55)", async () => {
    const l3 = await getLineDetail("L3");
    expect(l3.id).toBe("L3");
    expect(l3.turnover90d).toBe("22%");
    expect(l3.employees.every((e) => e.line === "L3" && e.score >= 55)).toBe(true);
  });

  it("usa metadatos por defecto para líneas sin override", async () => {
    const l7 = await getLineDetail("L7");
    expect(l7.turnover90d).toBe("7%");
  });
});

describe("getReportSummary", () => {
  it("cumple el contrato y agrega histórico, causas y ROI", async () => {
    const r = await getReportSummary();
    expect(() => ReportSummarySchema.parse(r)).not.toThrow();
    expect(r.attrition).toHaveLength(12);
    // byLine ordenado por rate descendente
    const rates = r.byLine.map((l) => l.rate);
    expect([...rates].sort((a, b) => b - a)).toEqual(rates);
    // causas agregadas con peso no negativo
    expect(r.drivers.length).toBeGreaterThan(0);
    expect(r.drivers.every((d) => d.weight >= 0)).toBe(true);
    // ROI: costo evitado = retenidos × costo de reemplazo
    expect(r.kpis.costAvoidedMxn).toBe(r.kpis.retained * 36_800);
  });
});

describe("getIntegrations", () => {
  it("cumple el contrato y expone conectores con estado", async () => {
    const r = await getIntegrations();
    expect(() => IntegrationsSummarySchema.parse(r)).not.toThrow();
    expect(r.connectors.length).toBeGreaterThan(3);
    expect(r.connectors.some((c) => c.status === "connected")).toBe(true);
    expect(r.connectors.some((c) => c.status === "error")).toBe(true);
  });

  it("syncConnector devuelve ok con timestamp", async () => {
    const res = await syncConnector("ukg");
    expect(res.ok).toBe(true);
    expect(typeof res.syncedAt).toBe("string");
  });
});
