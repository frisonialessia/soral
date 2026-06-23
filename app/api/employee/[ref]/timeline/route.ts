// app/api/employee/[ref]/timeline/route.ts
// Route Handler: línea de tiempo del expediente 360. 404 si el ref no existe.
import { NextResponse } from "next/server";
import { getEmployeeTimeline } from "@/lib/server/data-service";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const timeline = await getEmployeeTimeline(decodeURIComponent(ref));
  if (!timeline) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(timeline);
}
