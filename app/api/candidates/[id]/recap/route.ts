// app/api/candidates/[id]/recap/route.ts
// Route Handler: recap de entrevista de un candidato (Claude en vivo o reglas).
// 404 si el candidato no existe.
import { NextResponse } from "next/server";
import { getLocale } from "next-intl/server";
import { getCandidate } from "@/lib/server/data-service";
import { interviewRecap } from "@/lib/server/ai-service";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const candidate = await getCandidate(id);
  if (!candidate) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const locale = await getLocale();
  return NextResponse.json(await interviewRecap(candidate, locale));
}
