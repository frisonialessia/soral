// app/api/ai/ask/route.ts
// Route Handler: asistente "Ask Soral". Valida el historial de chat, lo recorta a
// la ventana útil y devuelve la respuesta del ai-service (Claude o fallback).
import { getLocale } from "next-intl/server";
import { answerQuestion } from "@/lib/server/ai-service";
import { AskBody } from "@/lib/server/inputs";
import { ok, run, readJson } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return run(async () => {
    const { messages } = AskBody.parse(await readJson(req));
    // Recorta a los últimos 12 turnos y limita el largo de cada uno (coste del LLM).
    const history = messages.slice(-12).map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
    return ok(await answerQuestion(history, await getLocale()));
  });
}
