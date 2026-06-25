import { describe, it, expect } from "vitest";
import { buildPopulation } from "./population";
import { EmployeePredictionSchema } from "@/types";

describe("buildPopulation", () => {
  it("genera tantas filas como el headcount e incluye a los curados", () => {
    const pop = buildPopulation(1180);
    expect(pop).toHaveLength(1180);
    // los curados van al frente y conservan su ref (para que resuelvan los expedientes)
    expect(pop[0].ref).toBe("#E7D9-6515");
    expect(pop.filter((e) => e.ref === "#9445-1041")).toHaveLength(1);
  });

  it("cada fila cumple el contrato EmployeePrediction", () => {
    const pop = buildPopulation(300);
    expect(() => pop.forEach((e) => EmployeePredictionSchema.parse(e))).not.toThrow();
  });

  it("es determinista y produce una mezcla de bandas", () => {
    expect(buildPopulation(800)[500].ref).toBe(buildPopulation(800)[500].ref);
    const bands = new Set(buildPopulation(800).map((e) => e.band));
    expect(bands.size).toBeGreaterThan(2);
  });

  it("nunca devuelve menos que los curados aunque pidan poco", () => {
    expect(buildPopulation(3).length).toBeGreaterThanOrEqual(10);
  });

  it("respeta líneas/turnos configurados y no filtra etiquetas ajenas al catálogo", () => {
    const pop = buildPopulation(200, ["A", "B", "C"], ["D1", "D2"]);
    expect(pop.every((e) => ["A", "B", "C"].includes(e.line))).toBe(true);
    expect(pop.every((e) => ["D1", "D2"].includes(e.shift))).toBe(true);
  });
});
