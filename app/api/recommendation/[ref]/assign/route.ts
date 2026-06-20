// app/api/recommendation/[ref]/assign/route.ts
// Route Handler: asigna la recomendación al supervisor. El ref va en la ruta,
// la línea en el cuerpo JSON.
import { NextResponse } from "next/server";
import { assignRecommendation } from "@/lib/server/data-service";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ ref: string }> }
) {
  const { ref } = await params;
  const body = await req.json().catch(() => ({}));
  const line = typeof body?.line === "string" ? body.line : "";
  const result = await assignRecommendation(ref, line);
  return NextResponse.json(result);
}
