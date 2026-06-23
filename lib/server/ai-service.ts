// lib/server/ai-service.ts
// Capa de IA — SERVER ONLY. Genera el briefing semanal de la planta.
//
// Seam: si hay ANTHROPIC_API_KEY + SORAL_AI_MODEL, lo redacta Claude (SDK
// oficial) a partir de los hechos reales; si no, cae a un briefing determinista
// generado por reglas sobre los mismos datos. Igual de útil hoy, y "en vivo" en
// cuanto se configure la key. Solo lo importan los Route Handlers de app/api/*.

import Anthropic from "@anthropic-ai/sdk";
import { getPlantSummary, getReportSummary } from "./data-service";
import type { Briefing } from "@/types";

interface Facts {
  highRisk: number;
  watch: number;
  stable: number;
  headcount: number;
  costAtRiskMxn: number;
  topByLine: { line: string; rate: number; count: number }[];
  topDrivers: { factor: string; weight: number }[];
  topWorkers: { ref: string; score: number; line: string; driver: string }[];
  attritionTrend: number[];
}

const LANG: Record<string, string> = { en: "English", es: "Spanish", it: "Italian" };

async function gatherFacts(): Promise<Facts> {
  const [plant, report] = await Promise.all([getPlantSummary(), getReportSummary()]);
  return {
    highRisk: plant.highRisk,
    watch: plant.watch,
    stable: plant.stable,
    headcount: plant.highRisk + plant.watch + plant.stable,
    costAtRiskMxn: plant.savingMxn,
    topByLine: report.byLine.slice(0, 3),
    topDrivers: report.drivers.slice(0, 3),
    topWorkers: plant.topRisk.slice(0, 5).map((e) => ({ ref: e.ref, score: e.score, line: e.line, driver: e.driver })),
    attritionTrend: report.attrition,
  };
}

export async function generateBriefing(locale: string): Promise<Briefing> {
  const facts = await gatherFacts();
  const model = process.env.SORAL_AI_MODEL;
  if (process.env.ANTHROPIC_API_KEY && model) {
    try {
      return await llmBriefing(facts, locale, model);
    } catch {
      // Si la llamada al LLM falla, no rompemos la vista: caemos a reglas.
    }
  }
  return rulesBriefing(facts, locale);
}

async function llmBriefing(facts: Facts, locale: string, model: string): Promise<Briefing> {
  const client = new Anthropic(); // lee ANTHROPIC_API_KEY del entorno
  const lang = LANG[locale] ?? "English";
  const system =
    `You are Soral's workforce-retention analyst for a maquiladora plant. Write a crisp weekly briefing ` +
    `for a plant manager, grounded ONLY in the JSON facts provided — never invent numbers, be specific and ` +
    `action-oriented. Write in ${lang}. Respond with ONLY valid JSON matching this shape: ` +
    `{"headline": string (max 8 words), "summary": string (2-3 sentences), "points": string[] (3-4 imperative action items)}.`;

  const msg = await client.messages.create({
    model,
    max_tokens: 700,
    system,
    messages: [{ role: "user", content: `Facts:\n${JSON.stringify(facts)}` }],
  });

  const text = msg.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  const json = JSON.parse(text) as { headline?: unknown; summary?: unknown; points?: unknown };

  return {
    headline: String(json.headline ?? ""),
    summary: String(json.summary ?? ""),
    points: Array.isArray(json.points) ? json.points.map(String).slice(0, 5) : [],
    source: "llm",
    model,
  };
}

function rulesBriefing(facts: Facts, locale: string): Briefing {
  const L = facts.topByLine[0] ?? { line: "—", rate: 0, count: 0 };
  const D = facts.topDrivers[0] ?? { factor: "—", weight: 0 };
  const cost = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(facts.costAtRiskMxn);

  const build = TEMPLATES[locale] ?? TEMPLATES.en;
  const { headline, summary, points } = build(facts, L, D, cost);
  return { headline, summary, points, source: "rules", model: null };
}

type LineFact = { line: string; rate: number; count: number };
type DriverFact = { factor: string; weight: number };
type Built = { headline: string; summary: string; points: string[] };
type Builder = (f: Facts, L: LineFact, D: DriverFact, cost: string) => Built;

const TEMPLATES: Record<string, Builder> = {
  en: (f, L, D, cost) => ({
    headline: `${f.highRisk} high-risk workers this week`,
    summary: `${f.highRisk} of ${f.headcount} workers are flagged high-risk and ${f.watch} are on watch. The hotspot is line ${L.line} at ${L.rate}% turnover, and the leading driver across flagged workers is ${D.factor}. Estimated cost at risk if no action is taken: ${cost}.`,
    points: [
      `Assign a retention play to each of the ${f.highRisk} high-risk workers this week.`,
      `Prioritize line ${L.line}: ${L.rate}% turnover with ${L.count} flagged.`,
      `Tackle "${D.factor}" — the top driver at ${D.weight}% of model weight.`,
      `Review the ${f.watch} watch-list workers before they escalate.`,
    ],
  }),
  es: (f, L, D, cost) => ({
    headline: `${f.highRisk} trabajadores de alto riesgo esta semana`,
    summary: `${f.highRisk} de ${f.headcount} trabajadores están marcados como alto riesgo y ${f.watch} en vigilancia. El foco es la línea ${L.line} con ${L.rate}% de rotación, y la causa principal entre los marcados es ${D.factor}. Costo estimado en riesgo si no se actúa: ${cost}.`,
    points: [
      `Asigna un plan de retención a cada uno de los ${f.highRisk} trabajadores de alto riesgo esta semana.`,
      `Prioriza la línea ${L.line}: ${L.rate}% de rotación con ${L.count} marcados.`,
      `Ataca "${D.factor}" — la causa principal con ${D.weight}% del peso del modelo.`,
      `Revisa los ${f.watch} trabajadores en vigilancia antes de que escalen.`,
    ],
  }),
  it: (f, L, D, cost) => ({
    headline: `${f.highRisk} lavoratori ad alto rischio questa settimana`,
    summary: `${f.highRisk} di ${f.headcount} lavoratori sono segnalati ad alto rischio e ${f.watch} in osservazione. Il focus è la linea ${L.line} con ${L.rate}% di turnover, e la causa principale tra i segnalati è ${D.factor}. Costo stimato a rischio se non si agisce: ${cost}.`,
    points: [
      `Assegna un piano di retention a ciascuno dei ${f.highRisk} lavoratori ad alto rischio questa settimana.`,
      `Dai priorità alla linea ${L.line}: ${L.rate}% di turnover con ${L.count} segnalati.`,
      `Affronta "${D.factor}" — la causa principale con ${D.weight}% del peso del modello.`,
      `Controlla i ${f.watch} lavoratori in osservazione prima che la situazione peggiori.`,
    ],
  }),
};

// ---------- Ask Soral (asistente conversacional) ----------

type ChatTurn = { role: "user" | "assistant"; content: string };

export async function answerQuestion(
  history: ChatTurn[],
  locale: string
): Promise<{ answer: string; source: "llm" | "rules" }> {
  const facts = await gatherFacts();
  const model = process.env.SORAL_AI_MODEL;
  if (process.env.ANTHROPIC_API_KEY && model && history.some((m) => m.role === "user")) {
    try {
      const answer = await llmAnswer(facts, history, locale, model);
      if (answer) return { answer, source: "llm" };
    } catch {
      // Caemos al fallback por reglas.
    }
  }
  return { answer: rulesAnswer(history, facts, locale), source: "rules" };
}

async function llmAnswer(facts: Facts, history: ChatTurn[], locale: string, model: string): Promise<string> {
  const client = new Anthropic();
  const lang = LANG[locale] ?? "English";
  const system =
    `You are Soral's workforce assistant for a maquiladora plant. Answer the manager using ONLY the JSON facts ` +
    `below — never invent numbers. Be concise (1-4 sentences), specific and action-oriented. If the answer is not ` +
    `in the facts, say you do not have that data. Write in ${lang}.\n\nFACTS:\n${JSON.stringify(facts)}`;
  const msg = await client.messages.create({
    model,
    max_tokens: 600,
    system,
    messages: history.length ? history : [{ role: "user", content: "Give a short status of the plant." }],
  });
  return msg.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();
}

function rulesAnswer(history: ChatTurn[], facts: Facts, locale: string): string {
  const q = (history.filter((m) => m.role === "user").pop()?.content ?? "").toLowerCase();
  const money = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(facts.costAtRiskMxn);
  const refs = facts.topWorkers.map((w) => `${w.ref} (${w.score}%)`).join(", ");
  const a = (ANSWER_TPL[locale] ?? ANSWER_TPL.en)(facts, money, refs);

  if (/high|alto|who|qui[eé]n|chi\b/.test(q)) return a.high;
  if (/line|l[ií]nea|linea/.test(q)) return a.line;
  if (/driver|cause|causa|motivo|why|por qu|perch/.test(q)) return a.driver;
  if (/cost|costo|saving|ahorro|how much|cu[aá]nto|quanto|at risk|en riesgo|a rischio|dinero|money|mxn|spend/.test(q))
    return a.cost;
  return a.fallback;
}

type AnswerSet = { high: string; line: string; driver: string; cost: string; fallback: string };
const ANSWER_TPL: Record<string, (f: Facts, money: string, refs: string) => AnswerSet> = {
  en: (f, money, refs) => ({
    high: `${f.highRisk} workers are high-risk this week: ${refs}. Each one needs a retention play now.`,
    line: `Turnover is highest on line ${f.topByLine[0].line} (${f.topByLine[0].rate}%, ${f.topByLine[0].count} flagged), followed by ${f.topByLine.slice(1).map((l) => `${l.line} (${l.rate}%)`).join(", ")}.`,
    driver: `The leading turnover drivers among flagged workers are ${f.topDrivers.map((d) => `${d.factor} (${d.weight}%)`).join(", ")}.`,
    cost: `Estimated cost at risk if no action is taken is ${money} — ${f.highRisk} high-risk workers at replacement cost.`,
    fallback: `${f.highRisk} workers are high-risk and ${f.watch} on watch out of ${f.headcount}. The hotspot is line ${f.topByLine[0].line}. Ask me about lines, drivers, cost, or who to act on. (Add an LLM key for free-form answers.)`,
  }),
  es: (f, money, refs) => ({
    high: `${f.highRisk} trabajadores son de alto riesgo esta semana: ${refs}. Cada uno necesita un plan de retención ahora.`,
    line: `La rotación es mayor en la línea ${f.topByLine[0].line} (${f.topByLine[0].rate}%, ${f.topByLine[0].count} marcados), seguida de ${f.topByLine.slice(1).map((l) => `${l.line} (${l.rate}%)`).join(", ")}.`,
    driver: `Las causas principales de rotación entre los marcados son ${f.topDrivers.map((d) => `${d.factor} (${d.weight}%)`).join(", ")}.`,
    cost: `El costo estimado en riesgo si no se actúa es ${money} — ${f.highRisk} trabajadores de alto riesgo a costo de reemplazo.`,
    fallback: `${f.highRisk} trabajadores de alto riesgo y ${f.watch} en vigilancia de ${f.headcount}. El foco es la línea ${f.topByLine[0].line}. Pregúntame por líneas, causas, costo o a quién atender. (Agrega una key de LLM para respuestas libres.)`,
  }),
  it: (f, money, refs) => ({
    high: `${f.highRisk} lavoratori sono ad alto rischio questa settimana: ${refs}. Ognuno ha bisogno di un piano di retention ora.`,
    line: `Il turnover è più alto sulla linea ${f.topByLine[0].line} (${f.topByLine[0].rate}%, ${f.topByLine[0].count} segnalati), seguita da ${f.topByLine.slice(1).map((l) => `${l.line} (${l.rate}%)`).join(", ")}.`,
    driver: `Le principali cause di turnover tra i segnalati sono ${f.topDrivers.map((d) => `${d.factor} (${d.weight}%)`).join(", ")}.`,
    cost: `Il costo stimato a rischio se non si agisce è ${money} — ${f.highRisk} lavoratori ad alto rischio al costo di sostituzione.`,
    fallback: `${f.highRisk} lavoratori ad alto rischio e ${f.watch} in osservazione su ${f.headcount}. Il focus è la linea ${f.topByLine[0].line}. Chiedimi di linee, cause, costo o chi seguire. (Aggiungi una key LLM per risposte libere.)`,
  }),
};
