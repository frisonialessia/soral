import { describe, it, expect } from "vitest";
import { buildField, calmScore } from "@/lib/dot-field-model";
import type { EmployeePrediction } from "@/types";

const emp = (
  ref: string,
  score: number,
  band: EmployeePrediction["band"]
): EmployeePrediction => ({
  ref,
  score,
  band,
  driver: "driver",
  line: "L1",
  shift: "matutino",
  tenure: 100,
  evidence: "",
  drivers: [],
  radar: [],
  trend: [],
  reco: "",
});

describe("buildField", () => {
  const employees = [emp("#A", 95, "critico"), emp("#B", 60, "vigilancia")];
  const field = buildField(employees, 100);

  it("renderiza exactamente un punto por empleado del total", () => {
    expect(field.real.length + field.anon.length).toBe(100);
  });

  it("los empleados con predicción son los puntos reales (con ref)", () => {
    expect(field.real.map((c) => c.ref).sort()).toEqual(["#A", "#B"]);
    expect(field.real.every((c) => c.ref !== null)).toBe(true);
  });

  it("ningún punto anónimo aparenta riesgo (sin ref y score < 55)", () => {
    expect(field.anon.every((c) => c.ref === null && c.score < 55)).toBe(true);
  });

  it("ordena por riesgo: el crítico cae en la primera fila", () => {
    const critical = field.real.find((c) => c.ref === "#A")!;
    expect(critical.r).toBe(0);
  });

  it("nunca deja menos puntos que empleados aunque el total sea bajo", () => {
    const f = buildField(employees, 1);
    expect(f.real.length).toBe(2);
    expect(f.anon.length).toBe(0);
  });
});

describe("calmScore", () => {
  it("siempre cae en la zona tranquila (0..54)", () => {
    for (let i = 0; i < 500; i++) {
      const s = calmScore(i);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThan(55);
    }
  });
});
