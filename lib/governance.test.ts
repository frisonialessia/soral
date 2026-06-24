import { describe, it, expect } from "vitest";
import { impactRatio, assessProxy, buildFairness, buildProxies, parity, buildCalibration, calibrationGap } from "./governance";

describe("impactRatio (4/5ths rule)", () => {
  it("is min/max of the rates", () => {
    expect(impactRatio([10, 20])).toBe(0.5);
    expect(impactRatio([8, 8, 8])).toBe(1);
  });
  it("returns 1 when all rates are zero (no division by zero)", () => {
    expect(impactRatio([0, 0])).toBe(1);
  });
});

describe("assessProxy", () => {
  it("flags tenure/seniority as a high-risk age proxy", () => {
    expect(assessProxy("antigüedad en zona crítica")).toEqual({ risk: "high", proxyFor: "age" });
  });
  it("flags payroll-timed absences as a finance proxy", () => {
    expect(assessProxy("faltas cerca de nómina")).toEqual({ risk: "medium", proxyFor: "finance" });
  });
  it("flags overtime refusal as a caregiving/family proxy", () => {
    expect(assessProxy("rechazo de tiempo extra")).toEqual({ risk: "medium", proxyFor: "family" });
  });
  it("leaves job-related drivers clean", () => {
    expect(assessProxy("supervisor alta rotación")).toEqual({ risk: "low", proxyFor: "none" });
    expect(assessProxy("caída de productividad")).toEqual({ risk: "low", proxyFor: "none" });
  });
});

describe("buildFairness", () => {
  const dims = buildFairness();
  it("marks line operational and shift/tenure sensitive", () => {
    expect(dims.find((d) => d.dimension === "line")!.sensitive).toBe(false);
    expect(dims.find((d) => d.dimension === "shift")!.sensitive).toBe(true);
    expect(dims.find((d) => d.dimension === "tenure")!.sensitive).toBe(true);
  });
  it("computes a rounded impact ratio and review status when below 0.8", () => {
    const tenure = dims.find((d) => d.dimension === "tenure")!;
    expect(tenure.ratio).toBe(0.33); // 6/18
    expect(tenure.status).toBe("review");
  });
});

describe("parity", () => {
  it("uses only sensitive dimensions (line variance is operational)", () => {
    const p = parity(buildFairness());
    expect(p.ratio).toBe(0.33); // min(shift 0.44, tenure 0.33)
    expect(p.status).toBe("review");
  });
});

describe("buildProxies", () => {
  it("sorts high-risk proxies before low-risk ones", () => {
    const out = buildProxies([
      { factor: "caída de productividad", weight: 30 },
      { factor: "antigüedad en zona crítica", weight: 10 },
    ]);
    expect(out[0].factor).toBe("antigüedad en zona crítica");
    expect(out[0].risk).toBe("high");
  });
});

describe("calibrationGap", () => {
  it("covers the sensitive dimensions", () => {
    expect(buildCalibration().map((d) => d.dimension).sort()).toEqual(["shift", "tenure"]);
  });
  it("reports the max predicted-vs-observed gap and flags review at >= 3pp", () => {
    const c = calibrationGap(buildCalibration());
    expect(c.gap).toBe(3); // night shift: predicted 16 vs observed 13
    expect(c.status).toBe("review");
  });
  it("stays ok when every group is within tolerance", () => {
    expect(calibrationGap([{ dimension: "tenure", groups: [{ group: "g", predicted: 10, observed: 9 }] }])).toEqual({
      gap: 1,
      status: "ok",
    });
  });
});
