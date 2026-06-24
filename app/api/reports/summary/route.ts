// app/api/reports/summary/route.ts
// Route Handler: resumen de reportes (histórico + ROI). Capa HTTP delgada sobre
// el data-service.
import { getReportSummary } from "@/lib/server/data-service";
import { ok, run } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  return run(async () => ok(await getReportSummary()));
}
