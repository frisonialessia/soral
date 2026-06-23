// app/api/ai/ask/route.ts
// Route Handler: asistente "Ask Soral". Recibe el historial de chat, lo sanea y
// devuelve la respuesta del ai-service (Claude en vivo o fallback por reglas).
import { NextResponse } from "next/server";
import { getLocale } from "next-intl/server";
import { answerQuestion } from "@/lib/server/ai-service";

export const dynamic = "force-dynamic";

interface RawTurn {
  role?: unknown;
  content?: unknown;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { messages?: unknown };
  const raw: RawTurn[] = Array.isArray(body.messages) ? body.messages : [];
  const history = raw
    .filter((m): m is { role: "user" | "assistant"; content: string } =>
      !!m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
    )
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  const locale = await getLocale();
  const result = await answerQuestion(history, locale);
  return NextResponse.json(result);
}
