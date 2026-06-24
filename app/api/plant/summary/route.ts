// app/api/plant/summary/route.ts
// Route Handler: resumen de planta. Capa HTTP delgada sobre el data-service.
import { getPlantSummary } from "@/lib/server/data-service";
import { ok, run } from "@/lib/server/http";

// Datos vivos (predicciones por semana): nunca cachear la ruta de forma estática.
export const dynamic = "force-dynamic";

export async function GET() {
  return run(async () => ok(await getPlantSummary()));
}
