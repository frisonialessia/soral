// app/api/plant/summary/route.ts
// Route Handler: resumen de planta. Capa HTTP delgada sobre el data-service.
import { NextResponse } from "next/server";
import { getPlantSummary } from "@/lib/server/data-service";

// Datos vivos (predicciones por semana): nunca cachear la ruta de forma estática.
export const dynamic = "force-dynamic";

export async function GET() {
  const summary = await getPlantSummary();
  return NextResponse.json(summary);
}
