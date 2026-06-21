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

export async function generateBriefing(locale: string): Promise<Briefing> {
  const [plant, report] = await Promise.all([getPlantSummary(), getReportSummary()]);
  const facts: Facts = {
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
