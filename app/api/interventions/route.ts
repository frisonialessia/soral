// app/api/interventions/route.ts
// Route Handler del loop de resultados: lista (GET) y crea (POST) intervenciones.
import { NextResponse } from "next/server";
import { getInterventions, createIntervention } from "@/lib/server/data-service";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getInterventions());
}

export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.slice(0, 300) : "");
  const ref = str(b.ref);
  if (!ref) return NextResponse.json({ error: "ref required" }, { status: 400 });
  const created = await createIntervention({
    ref,
    line: str(b.line),
    play: str(b.play),
    assignedBy: str(b.assignedBy),
  });
  return NextResponse.json(created);
}
