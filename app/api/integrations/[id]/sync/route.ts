// app/api/integrations/[id]/sync/route.ts
// Route Handler: dispara una sincronización del conector `id` (mock).
import { NextResponse } from "next/server";
import { syncConnector } from "@/lib/server/data-service";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json(await syncConnector(id));
}
