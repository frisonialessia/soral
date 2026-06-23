// app/api/pilot/summary/route.ts
// Route Handler: resumen del pilot causal (efecto de las intervenciones + flywheel
// del modelo). Capa HTTP delgada sobre el data-service.
import { NextResponse } from "next/server";
import { getPilotSummary } from "@/lib/server/data-service";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getPilotSummary());
}
