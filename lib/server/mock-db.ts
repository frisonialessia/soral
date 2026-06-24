// lib/server/mock-db.ts
// Capa de ACCESO A DATOS simulada — SERVER ONLY. Es el "driver" de base de datos
// en memoria y el ÚNICO punto que el data-service usa para leer/escribir.
//
// Está diseñado para imitar la FORMA de una consulta real (supabase-js / SQL):
// filtros (eq/gte/lte/in), búsqueda (ilike), orden y paginación (range), devolviendo
// filas + total. Cada operación es async y simula latencia de red/IO.
//
// ── El punto de migración ───────────────────────────────────────────────────
// Cambiar a Supabase = reemplazar SOLO el cuerpo de createTable por llamadas a
// supabase-js. La firma (findMany/findOne/count/insert/update) no cambia, así que
// el data-service, los Route Handlers y la UI quedan intactos. Equivalencias:
//
//   table.findMany({ eq:{line:'L3'}, gte:{score:55}, search:{term,fields:['ref']},
//                    order:{field:'score',ascending:false}, limit:10, offset:0 })
//     →  supabase.from('employees').select('*', { count: 'exact' })
//          .eq('line','L3').gte('score',55).or('ref.ilike.%term%')
//          .order('score',{ascending:false}).range(0, 9)
//
//   table.findOne({ ref })  → supabase.from('employees').select('*').eq('ref',ref).maybeSingle()
//   table.insert(row)       → supabase.from('t').insert(row).select().single()
//   table.update({id}, patch) → supabase.from('t').update(patch).eq('id',id).select().maybeSingle()

const isTest = process.env.NODE_ENV === "test";

// Simula la latencia de una consulta real. Se omite en tests (para no ralentizarlos)
// y es configurable con SORAL_MOCK_LATENCY_MS (0 = desactivada).
export async function simulateLatency(): Promise<void> {
  if (isTest) return;
  const base = Number(process.env.SORAL_MOCK_LATENCY_MS ?? 14);
  if (!Number.isFinite(base) || base <= 0) return;
  const ms = base + Math.random() * base; // base..2·base, con jitter
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export interface FindManyOptions<T> {
  eq?: Partial<Record<keyof T, string | number | boolean>>; // igualdad exacta
  gte?: Partial<Record<keyof T, number>>; // >=
  lte?: Partial<Record<keyof T, number>>; // <=
  in?: Partial<Record<keyof T, ReadonlyArray<string | number>>>; // pertenencia
  search?: { term: string; fields: (keyof T)[] }; // ilike sobre varios campos (OR)
  order?: { field: keyof T; ascending?: boolean };
  limit?: number;
  offset?: number;
}

export type CountOptions<T> = Omit<FindManyOptions<T>, "order" | "limit" | "offset">;

// Resultado paginado: filas de la página + total que matchea el filtro (antes de
// paginar) — el equivalente a `{ data, count }` de supabase con count:'exact'.
export interface Page<T> {
  rows: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface Table<T> {
  findMany(opts?: FindManyOptions<T>): Promise<Page<T>>;
  findOne(match: Partial<T>): Promise<T | null>;
  count(opts?: CountOptions<T>): Promise<number>;
  insert(row: T): Promise<T>;
  update(match: Partial<T>, patch: Partial<T>): Promise<T | null>;
}

function matchesAll<T extends object>(row: T, match: Partial<T>): boolean {
  const r = row as Record<string, unknown>;
  return Object.entries(match).every(([k, v]) => r[k] === v);
}

function passesFilters<T extends object>(row: T, opts: CountOptions<T>): boolean {
  const r = row as Record<string, unknown>;
  if (opts.eq) for (const [k, v] of Object.entries(opts.eq)) if (r[k] !== v) return false;
  if (opts.gte) for (const [k, v] of Object.entries(opts.gte)) if ((r[k] as number) < (v as number)) return false;
  if (opts.lte) for (const [k, v] of Object.entries(opts.lte)) if ((r[k] as number) > (v as number)) return false;
  if (opts.in) for (const [k, vs] of Object.entries(opts.in)) if (!(vs as unknown[]).includes(r[k])) return false;
  if (opts.search && opts.search.term.trim()) {
    const term = opts.search.term.trim().toLowerCase();
    const hit = opts.search.fields.some((f) => String(r[f as string] ?? "").toLowerCase().includes(term));
    if (!hit) return false;
  }
  return true;
}

// Crea una "tabla" sobre una semilla. La tabla POSEE su propia copia de las filas
// (clona la semilla al crearse), así update/insert nunca mutan el array semilla del
// caller. Con Supabase, este array interno desaparece.
export function createTable<T extends object>(seed: ReadonlyArray<T>): Table<T> {
  const data: T[] = seed.map((row) => ({ ...row }));

  return {
    async findMany(opts = {}) {
      await simulateLatency();
      let rows = data.filter((r) => passesFilters(r, opts));
      const total = rows.length;
      if (opts.order) {
        const { field, ascending = true } = opts.order;
        rows = [...rows].sort((a, b) => {
          const av = (a as Record<string, unknown>)[field as string] as number | string;
          const bv = (b as Record<string, unknown>)[field as string] as number | string;
          const cmp = av < bv ? -1 : av > bv ? 1 : 0;
          return ascending ? cmp : -cmp;
        });
      }
      const offset = opts.offset ?? 0;
      const limit = opts.limit ?? Math.max(0, total - offset);
      return { rows: rows.slice(offset, offset + limit), total, limit, offset };
    },

    async findOne(match) {
      await simulateLatency();
      return data.find((r) => matchesAll(r, match)) ?? null;
    },

    async count(opts = {}) {
      await simulateLatency();
      return data.filter((r) => passesFilters(r, opts)).length;
    },

    async insert(row) {
      await simulateLatency();
      data.unshift(row); // más reciente primero
      return row;
    },

    async update(match, patch) {
      await simulateLatency();
      const row = data.find((r) => matchesAll(r, match));
      if (!row) return null;
      Object.assign(row, patch);
      return row;
    },
  };
}
