// app/api/voice/route.ts
// Route Handler: voz del empleado (temas, sentimiento, alertas). Capa HTTP delgada.
import { NextResponse } from "next/server";
import { getVoiceSummary } from "@/lib/server/data-service";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getVoiceSummary());
}
