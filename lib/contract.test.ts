import { describe, it, expect } from "vitest";
import {
  EmployeePredictionSchema,
  PlantSummarySchema,
  RiskBandSchema,
} from "@/types";
import { EMPLOYEES } from "@/lib/data";
import { getPlantSummary } from "@/lib/server/data-service";

describe("contrato de datos (Zod)", () => {
  it("el dataset semilla cumple EmployeePredictionSchema", () => {
    for (const e of EMPLOYEES) {
      expect(() => EmployeePredictionSchema.parse(e)).not.toThrow();
    }
  });

  it("la salida de getPlantSummary cumple PlantSummarySchema", async () => {
    const summary = await getPlantSummary();
    expect(() => PlantSummarySchema.parse(summary)).not.toThrow();
  });

  it("rechaza un payload con un campo del tipo equivocado", () => {
    const bad = { ...EMPLOYEES[0], score: "no-soy-numero" };
    expect(() => EmployeePredictionSchema.parse(bad)).toThrow();
  });

  it("rechaza una banda desconocida", () => {
    expect(() => RiskBandSchema.parse("ultra-critico")).toThrow();
  });

  it("rechaza un empleado sin campos obligatorios", () => {
    expect(() => EmployeePredictionSchema.parse({ ref: "#X", score: 90 })).toThrow();
  });
});
