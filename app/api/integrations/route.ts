// app/api/integrations/route.ts
// Route Handler: estado de los conectores. Capa HTTP delgada sobre el data-service.
import { NextResponse } from "next/server";
import { getIntegrations } from "@/lib/server/data-service";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getIntegrations());
}
