// app/api/candidates/route.ts
// Route Handler: pipeline de pre-contratación. Capa HTTP delgada sobre el
// data-service (que calcula supervivencia/costo con lib/hiring.ts).
import { NextResponse } from "next/server";
import { getCandidates } from "@/lib/server/data-service";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getCandidates());
}
