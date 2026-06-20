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

- `lib/data.ts` — dataset semilla, generado por la cadena ERP → conector → modelo
  (es el `predictions_payload.json` validado en la simulación de integración).
- `lib/mock-api.ts` — simula los endpoints REST con latencia. Las firmas son las
  que tendrá la API real: migrar = cambiar el cuerpo de estas funciones por `fetch()`.
- `lib/queries.ts` — hooks de TanStack Query con queryKeys estables.
- `types/index.ts` — el contrato de datos (mismo shape que la API).

## Estado y caché

TanStack Query cachea cada respuesta (`staleTime` 60 s). Navegar entre vistas
ya visitadas no re-pide datos: el estado se mantiene y la interfaz se siente
instantánea. El primer acceso a cada vista muestra el estado de carga (latencia
simulada de la mock API).

## Paleta

Rampa de riesgo cerrada de 6 paradas (`lib/utils.ts` → `RISK_RAMP`), definida
también como tokens de Tailwind (`risk.sol` … `risk.cri`). El color de cada
empleado se deriva de su score.

## Próximos pasos

1. Reemplazar el cuerpo de `lib/mock-api.ts` por llamadas `fetch()` a Route Handlers en `app/api/`.
2. Conectar la API a las tablas PostgreSQL del `schema.sql`.
3. Reemplazar el modelo simulado por el XGBoost entrenado.
