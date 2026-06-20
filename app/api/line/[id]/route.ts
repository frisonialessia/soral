// app/api/line/[id]/route.ts
// Route Handler: detalle de una línea.
import { NextResponse } from "next/server";
import { getLineDetail } from "@/lib/server/data-service";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const detail = await getLineDetail(id);
  return NextResponse.json(detail);
}
