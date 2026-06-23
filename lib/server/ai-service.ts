// lib/server/ai-service.ts
// Capa de IA — SERVER ONLY. Genera el briefing semanal de la planta.
//
// Seam: si hay ANTHROPIC_API_KEY + SORAL_AI_MODEL, lo redacta Claude (SDK
// oficial) a partir de los hechos reales; si no, cae a un briefing determinista
// generado por reglas sobre los mismos datos. Igual de útil hoy, y "en vivo" en
// cuanto se configure la key. Solo lo importan los Route Handlers de app/api/*.

import Anthropic from "@anthropic-ai/sdk";
import { getPlantSummary, getReportSummary } from "./data-service";
import type { Briefing, Candidate, InterviewRecap } from "@/types";

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

// ---------- Recap de entrevista (pre-contratación) ----------
// Estructurado y job-related. Nunca un veredicto "contratar/no": evidencia para
// que decida el reclutador (humano en el loop). Claude si hay key; si no, reglas.

const HFEAT_LABEL: Record<string, Record<string, string>> = {
  en: { sourceQuality: "hiring channel", commuteFit: "commute distance", tenureHistory: "prior job stability", payFit: "pay vs market", interviewSignal: "structured interview", roleStability: "role stability" },
  es: { sourceQuality: "canal de origen", commuteFit: "distancia de traslado", tenureHistory: "estabilidad laboral previa", payFit: "salario vs mercado", interviewSignal: "entrevista estructurada", roleStability: "estabilidad del puesto" },
  it: { sourceQuality: "canale di origine", commuteFit: "distanza del tragitto", tenureHistory: "stabilità lavorativa precedente", payFit: "retribuzione vs mercato", interviewSignal: "colloquio strutturato", roleStability: "stabilità del ruolo" },
};
const SOURCE_LABEL: Record<string, Record<string, string>> = {
  en: { referral: "referral", rehire: "rehire", job_board: "job board", agency: "staffing agency", walk_in: "walk-in" },
  es: { referral: "referido", rehire: "recontratación", job_board: "bolsa de trabajo", agency: "agencia", walk_in: "espontáneo" },
  it: { referral: "referral", rehire: "riassunzione", job_board: "annuncio", agency: "agenzia", walk_in: "spontaneo" },
};
const REC_LABEL: Record<string, Record<string, string>> = {
  en: { advance: "advance", review: "review", caution: "caution" },
  es: { advance: "avanzar", review: "revisar", caution: "precaución" },
  it: { advance: "avanzare", review: "rivedere", caution: "cautela" },
};

function recapFacts(c: Candidate, locale: string) {
  const hl = HFEAT_LABEL[locale] ?? HFEAT_LABEL.en;
  const strengths = c.drivers.filter((d) => d.direction === "down").slice(0, 3).map((d) => hl[d.factor] ?? d.factor);
  const risks = c.drivers.filter((d) => d.direction === "up").slice(0, 3).map((d) => hl[d.factor] ?? d.factor);
  return {
    role: c.role,
    source: (SOURCE_LABEL[locale] ?? SOURCE_LABEL.en)[c.source] ?? c.source,
    survival90: c.survival90,
    survival12m: c.survival12m,
    expectedTenureMonths: c.expectedTenureMonths,
    recommendation: (REC_LABEL[locale] ?? REC_LABEL.en)[c.recommendation] ?? c.recommendation,
    interviewDone: c.interviewDone,
    strengths,
    risks,
  };
}

export async function interviewRecap(candidate: Candidate, locale: string): Promise<InterviewRecap> {
  const facts = recapFacts(candidate, locale);
  const model = process.env.SORAL_AI_MODEL;
  if (process.env.ANTHROPIC_API_KEY && model) {
    try {
      return await llmRecap(facts, locale, model);
    } catch {
      // Caemos a reglas si el LLM falla.
    }
  }
  return rulesRecap(facts, locale);
}

type RecapFacts = ReturnType<typeof recapFacts>;

async function llmRecap(facts: RecapFacts, locale: string, model: string): Promise<InterviewRecap> {
  const client = new Anthropic();
  const lang = LANG[locale] ?? "English";
  const system =
    `You are Soral's hiring-intelligence assistant for a maquiladora plant. Produce a STRUCTURED interview recap ` +
    `for a recruiter, grounded ONLY in the JSON facts — never invent numbers, never reference protected attributes ` +
    `(age, sex, origin, health, etc.), and NEVER output a hire/no-hire verdict. This is decision support; the human ` +
    `decides. Be specific and job-related. Write in ${lang}. Respond with ONLY valid JSON matching: ` +
    `{"summary": string (2 sentences), "strengths": string[] (2-3), "watchouts": string[] (2-3), "questions": string[] (3 structured, job-related interview questions targeting the watchouts)}.`;
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
  const json = JSON.parse(text) as Record<string, unknown>;
  const arr = (v: unknown) => (Array.isArray(v) ? v.map(String).slice(0, 4) : []);
  return {
    summary: String(json.summary ?? ""),
    strengths: arr(json.strengths),
    watchouts: arr(json.watchouts),
    questions: arr(json.questions),
    source: "llm",
  };
}

function rulesRecap(facts: RecapFacts, locale: string): InterviewRecap {
  const build = RECAP_TPL[locale] ?? RECAP_TPL.en;
  return { ...build(facts), source: "rules" };
}

type RecapBuilt = { summary: string; strengths: string[]; watchouts: string[]; questions: string[] };
const RECAP_TPL: Record<string, (f: RecapFacts) => RecapBuilt> = {
  en: (f) => ({
    summary: `${f.role} candidate via ${f.source}. The model estimates ${f.survival90}% 90-day survival and ~${f.expectedTenureMonths} months expected tenure — recommendation: ${f.recommendation}.`,
    strengths: f.strengths.map((s) => `Strong ${s}`),
    watchouts: f.risks.length ? f.risks.map((s) => `Watch ${s}`) : ["No major risk signals"],
    questions: f.risks.slice(0, 3).map((s) => `How will the candidate handle ${s} in the first 90 days?`),
  }),
  es: (f) => ({
    summary: `Candidato a ${f.role} vía ${f.source}. El modelo estima ${f.survival90}% de supervivencia a 90 días y ~${f.expectedTenureMonths} meses de permanencia esperada — recomendación: ${f.recommendation}.`,
    strengths: f.strengths.map((s) => `Buen ${s}`),
    watchouts: f.risks.length ? f.risks.map((s) => `Vigilar ${s}`) : ["Sin señales de riesgo relevantes"],
    questions: f.risks.slice(0, 3).map((s) => `¿Cómo manejaría el candidato ${s} en los primeros 90 días?`),
  }),
  it: (f) => ({
    summary: `Candidato per ${f.role} via ${f.source}. Il modello stima ${f.survival90}% di sopravvivenza a 90 giorni e ~${f.expectedTenureMonths} mesi di permanenza attesa — raccomandazione: ${f.recommendation}.`,
    strengths: f.strengths.map((s) => `Buon ${s}`),
    watchouts: f.risks.length ? f.risks.map((s) => `Attenzione a ${s}`) : ["Nessun segnale di rischio rilevante"],
    questions: f.risks.slice(0, 3).map((s) => `Come gestirà il candidato ${s} nei primi 90 giorni?`),
  }),
};
