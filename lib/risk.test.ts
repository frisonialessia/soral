import { describe, it, expect } from "vitest";
import { bandOf, riskColor, bandLabel, RISK_BANDS } from "@/lib/risk";

describe("bandOf", () => {
  // Los límites son la regla de negocio que decide a quién se interviene:
  // se prueban exactamente en cada frontera.
  it("clasifica cada frontera de score en la banda correcta", () => {
    expect(bandOf(100)).toBe("critico");
    expect(bandOf(90)).toBe("critico");
    expect(bandOf(89)).toBe("alto");
    expect(bandOf(80)).toBe("alto");
    expect(bandOf(79)).toBe("medio");
    expect(bandOf(70)).toBe("medio");
    expect(bandOf(69)).toBe("vigilancia");
    expect(bandOf(55)).toBe("vigilancia");
    expect(bandOf(54)).toBe("estable");
    expect(bandOf(40)).toBe("estable");
    expect(bandOf(39)).toBe("solido");
    expect(bandOf(0)).toBe("solido");
  });
});

describe("riskColor", () => {
  it("devuelve el color de la banda del score", () => {
    expect(riskColor(95)).toBe("#EB4F6C"); // crítico
    expect(riskColor(85)).toBe("#F56C89"); // alto
    expect(riskColor(10)).toBe("#5B6EF5"); // sólido
  });

  it("es consistente con bandOf en el umbral de cada banda", () => {
    for (const b of RISK_BANDS) {
      expect(riskColor(b.min)).toBe(b.color);
      expect(bandOf(b.min)).toBe(b.band);
    }
  });
});

describe("bandLabel", () => {
  it("traduce cada banda a su etiqueta en español", () => {
    expect(bandLabel("critico")).toBe("Crítico");
    expect(bandLabel("alto")).toBe("Alto");
    expect(bandLabel("medio")).toBe("Medio");
    expect(bandLabel("vigilancia")).toBe("Vigilancia");
    expect(bandLabel("estable")).toBe("Estable");
    expect(bandLabel("solido")).toBe("Sólido");
  });
});
