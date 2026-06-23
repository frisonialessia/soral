// app/api/interventions/[id]/route.ts
// Route Handler: actualiza el estado/resultado de una intervención (cerrar el loop).
import { NextResponse } from "next/server";
import { updateIntervention } from "@/lib/server/data-service";
import type { InterventionStatus, InterventionOutcome } from "@/types";

export const dynamic = "force-dynamic";

const STATUS = ["assigned", "in_progress", "done"];
const OUTCOME = ["pending", "retained", "left"];

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const status = STATUS.includes(b.status as string) ? (b.status as InterventionStatus) : undefined;
  const outcome = OUTCOME.includes(b.outcome as string) ? (b.outcome as InterventionOutcome) : undefined;
  const updated = await updateIntervention(id, { status, outcome });
  if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(updated);
}
