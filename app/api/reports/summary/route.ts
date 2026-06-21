// app/api/reports/summary/route.ts
// Route Handler: resumen de reportes (histórico + ROI). Capa HTTP delgada sobre
// el data-service.
import { NextResponse } from "next/server";
import { getReportSummary } from "@/lib/server/data-service";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getReportSummary());
}
