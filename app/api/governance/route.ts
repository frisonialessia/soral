// app/api/governance/route.ts
// Route Handler: gobernanza y equidad. Capa HTTP delgada sobre el data-service.
import { NextResponse } from "next/server";
import { getGovernanceSummary } from "@/lib/server/data-service";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getGovernanceSummary());
}
