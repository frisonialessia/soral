import { describe, it, expect } from "vitest";
import { createTable } from "./mock-db";

interface Row {
  id: string;
  line: string;
  score: number;
  driver: string;
}

const seed: Row[] = [
  { id: "a", line: "L3", score: 90, driver: "supervisor alta rotación" },
  { id: "b", line: "L3", score: 60, driver: "faltas cerca de nómina" },
  { id: "c", line: "L5", score: 40, driver: "caída de productividad" },
  { id: "d", line: "L5", score: 75, driver: "rechazo de tiempo extra" },
];

describe("createTable.findMany", () => {
  it("filtra por eq + gte y reporta el total antes de paginar", async () => {
    const t = createTable(seed);
    const page = await t.findMany({ eq: { line: "L3" }, gte: { score: 55 } });
    expect(page.rows.map((r) => r.id)).toEqual(["a", "b"]);
    expect(page.total).toBe(2);
  });

  it("busca (ilike) sobre varios campos, case-insensitive", async () => {
    const t = createTable(seed);
    const page = await t.findMany({ search: { term: "NÓMINA", fields: ["driver"] } });
    expect(page.rows.map((r) => r.id)).toEqual(["b"]);
  });

  it("ordena y pagina (order + limit + offset)", async () => {
    const t = createTable(seed);
    const page = await t.findMany({ order: { field: "score", ascending: false }, limit: 2, offset: 1 });
    // ordenado desc: 90,75,60,40 → offset 1, limit 2 → 75(d), 60(b)
    expect(page.rows.map((r) => r.id)).toEqual(["d", "b"]);
    expect(page).toMatchObject({ total: 4, limit: 2, offset: 1 });
  });
});

describe("createTable: fila única y escrituras", () => {
  it("findOne y count", async () => {
    const t = createTable(seed);
    expect((await t.findOne({ id: "c" }))?.line).toBe("L5");
    expect(await t.findOne({ id: "zzz" })).toBeNull();
    expect(await t.count({ gte: { score: 60 } })).toBe(3);
  });

  it("insert antepone; update muta por match; update devuelve null si no existe", async () => {
    const t = createTable(seed);
    await t.insert({ id: "e", line: "L1", score: 10, driver: "x" });
    expect((await t.findMany()).rows[0].id).toBe("e");

    const updated = await t.update({ id: "a" }, { score: 99 });
    expect(updated?.score).toBe(99);
    expect((await t.findOne({ id: "a" }))?.score).toBe(99);

    expect(await t.update({ id: "nope" }, { score: 1 })).toBeNull();
  });

  it("no muta la semilla original por fuera de la tabla", async () => {
    const t = createTable(seed);
    await t.update({ id: "a" }, { score: 1 });
    expect(seed.find((r) => r.id === "a")!.score).toBe(90); // intacto
  });
});
