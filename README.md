# Soral

Predicción de continuidad operativa para maquilas: anticipa la rotación de
personal analizando datos operativos (asistencia, productividad, contexto) en
lugar de encuestas de clima. Tres vistas sobre Next.js 15 (App Router) +
TypeScript + Tailwind + shadcn/ui + TanStack Query.

## Arrancar

```bash
npm install
npm run dev      # http://localhost:3000
```

## Rutas

- `/` — Home: mapa de fuerza laboral (campo de puntos), KPIs, tabla Top 10.
- `/linea/[id]` — Detalle de línea (ej. `/linea/L3`).
- `/empleado/[ref]` — Ficha de empleado: radar + barras SHAP + tendencia + modal LLM.

## Arquitectura de datos

Tres capas limpias, pensadas para que conectar la base de datos sea cambiar una
sola de ellas:

- `lib/data.ts` — dataset semilla, generado por la cadena ERP → conector → modelo
  (es el `predictions_payload.json` validado en la simulación de integración).
- `lib/server/data-service.ts` — **capa de datos (server-only)**. La única que
  conoce el origen: hoy lee de `lib/data.ts`, mañana consultará PostgreSQL/Supabase.
  Migrar = cambiar solo el cuerpo de estas funciones.
- `app/api/*/route.ts` — **Route Handlers**. Capa HTTP delgada sobre el data-service
  (`/api/plant/summary`, `/api/line/[id]`, `/api/employee/[ref]`,
  `/api/recommendation/[ref]/assign`).
- `lib/api-client.ts` — **cliente fetch (client-side)**. Llama a los Route Handlers
  y **valida cada respuesta con Zod** en la frontera: un dato fuera de contrato
  produce un error claro (que la vista muestra como `ErrorState`), no un render roto.
- `lib/queries.ts` — hooks de TanStack Query con queryKeys estables; consumen el
  api-client.
- `lib/risk.ts` — **motor de riesgo**: fuente única de banda, color y etiqueta.
- `types/index.ts` — el contrato de datos como **esquemas Zod**; los tipos de TS
  se derivan con `z.infer` (una sola fuente de verdad runtime + compile-time).

## Estado y caché

TanStack Query cachea cada respuesta (`staleTime` 60 s). Navegar entre vistas
ya visitadas no re-pide datos: el estado se mantiene y la interfaz se siente
instantánea. El primer acceso a cada vista hace un `fetch` real al Route Handler
correspondiente y muestra el estado de carga.

## Paleta

Rampa de riesgo cerrada de 6 paradas en `lib/risk.ts` → `RISK_BANDS` (fuente
única: banda, umbral, color y etiqueta), reflejada como tokens de Tailwind
(`risk.sol` … `risk.cri`). El color de cada empleado se deriva de su score.

## Tests

```bash
npm test         # Vitest, una vez
npm run test:watch
```

Cubren la lógica de núcleo: motor de riesgo (`lib/risk.ts`, cada frontera de
banda), agregación del `data-service` (buckets, ahorro, top-10) y el contrato
Zod (el dataset semilla y la salida del servicio cumplen el esquema).

## Próximos pasos

1. Conectar `lib/server/data-service.ts` a las tablas PostgreSQL del `schema.sql`
   (Supabase). Solo cambia el cuerpo de las funciones; handlers y UI no se tocan.
2. Reemplazar el modelo simulado por el XGBoost entrenado.
