// app/api/ai/voice-digest/route.ts
// Route Handler: lectura ejecutiva de la voz del empleado (Claude o reglas).
import { NextResponse } from "next/server";
import { getLocale } from "next-intl/server";
import { voiceDigest } from "@/lib/server/ai-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const locale = await getLocale();
  return NextResponse.json(await voiceDigest(locale));
}
