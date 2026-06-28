// lib/api-client.ts
// Capa de fetch (client-side). Llama a los Route Handlers de app/api/* y valida
// cada respuesta contra el contrato Zod (types/index.ts) en la frontera: un dato
// que no cumple el contrato lanza aquí (ZodError) y React Query lo expone como
// isError → la vista muestra ErrorState con "Reintentar", en vez de reventar el
// render. Los componentes no saben que hay HTTP ni validación de por medio.

import { z } from "zod";
import {
  PlantSummarySchema,
  LineDetailSchema,
  EmployeePredictionSchema,
  AssignResultSchema,
  ReportSummarySchema,
  BriefingSchema,
  AskAnswerSchema,
  IntegrationsSummarySchema,
  SyncResultSchema,
  InterventionSchema,
  InterventionsSummarySchema,
  CandidatesSummarySchema,
  InterviewRecapSchema,
  VoiceSummarySchema,
  EmployeeTimelineSchema,
  PilotSummarySchema,
  GovernanceSummarySchema,
  EmployeePageSchema,
  CostModelSchema,
  PlantProfileSchema,
  type CostModel,
  type CostComponents,
  type PlantProfile,
  type EmployeePrediction,
  type AssignResult,
  type AskAnswer,
  type SyncResult,
  type Intervention,
  type InterventionStatus,
  type InterventionOutcome,
  type InterviewRecap,
} from "@/types";

// GET + valida contra el esquema. Devuelve el tipo inferido del esquema.
async function getValidated<S extends z.ZodTypeAny>(
  url: string,
  schema: S
): Promise<z.infer<S>> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return schema.parse(await res.json());
}

// GET /api/plant/summary
export function fetchPlantSummary() {
  return getValidated("/api/plant/summary", PlantSummarySchema);
}

// GET /api/settings/cost-model — modelo de costo de rotación (configurable por RH).
export function fetchCostModel() {
  return getValidated("/api/settings/cost-model", CostModelSchema);
}

// PUT /api/settings/cost-model — guarda los componentes capturados por RH.
export async function updateCostModel(components: CostComponents): Promise<CostModel> {
  const res = await fetch("/api/settings/cost-model", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(components),
  });
  if (!res.ok) throw new Error(`PUT /api/settings/cost-model → ${res.status}`);
  return CostModelSchema.parse(await res.json());
}

// GET /api/settings/plant-profile — perfil de la planta (nombre, headcount).
export function fetchPlantProfile() {
  return getValidated("/api/settings/plant-profile", PlantProfileSchema);
}

// PUT /api/settings/plant-profile — guarda el perfil de la planta.
export async function updatePlantProfile(input: { name: string; headcount: number; lines: string[]; shifts: string[]; lineRisk?: number[] }): Promise<PlantProfile> {
  const res = await fetch("/api/settings/plant-profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`PUT /api/settings/plant-profile → ${res.status}`);
  return PlantProfileSchema.parse(await res.json());
}

// GET /api/reports/summary
export function fetchReportSummary() {
  return getValidated("/api/reports/summary", ReportSummarySchema);
}

// GET /api/pilot/summary
export function fetchPilotSummary() {
  return getValidated("/api/pilot/summary", PilotSummarySchema);
}

// GET /api/governance
export function fetchGovernance() {
  return getValidated("/api/governance", GovernanceSummarySchema);
}

// GET /api/ai/briefing
export function fetchBriefing() {
  return getValidated("/api/ai/briefing", BriefingSchema);
}

// POST /api/ai/ask — asistente conversacional. Valida la respuesta en la frontera.
export async function fetchAsk(
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<AskAnswer> {
  const res = await fetch("/api/ai/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) throw new Error(`POST /api/ai/ask → ${res.status}`);
  return AskAnswerSchema.parse(await res.json());
}

// GET /api/employees — listado filtrable/paginado. Devuelve { rows, total, limit, offset }.
export interface EmployeesQuery {
  line?: string;
  shift?: string;
  band?: string;
  minScore?: number;
  maxScore?: number;
  search?: string;
  sort?: "score" | "tenure" | "ref";
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export function fetchEmployees(query: EmployeesQuery = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return getValidated(`/api/employees${qs ? `?${qs}` : ""}`, EmployeePageSchema);
}

// GET /api/line/:id
export function fetchLineDetail(id: string) {
  return getValidated(`/api/line/${encodeURIComponent(id)}`, LineDetailSchema);
}

// GET /api/employee/:ref — los refs llevan "#", se codifican para la URL.
// 404 (no encontrado) se mapea a null para conservar el contrato anterior.
export async function fetchEmployee(ref: string): Promise<EmployeePrediction | null> {
  const res = await fetch(`/api/employee/${encodeURIComponent(ref)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET /api/employee → ${res.status}`);
  return EmployeePredictionSchema.parse(await res.json());
}

// GET /api/employee/:ref/timeline — expediente 360 (señales, alertas, acciones).
export async function fetchEmployeeTimeline(ref: string) {
  const res = await fetch(`/api/employee/${encodeURIComponent(ref)}/timeline`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET /api/employee/${ref}/timeline → ${res.status}`);
  return EmployeeTimelineSchema.parse(await res.json());
}

// GET /api/integrations
export function fetchIntegrations() {
  return getValidated("/api/integrations", IntegrationsSummarySchema);
}

// POST /api/integrations/:id/sync
export async function syncConnector(id: string): Promise<SyncResult> {
  const res = await fetch(`/api/integrations/${encodeURIComponent(id)}/sync`, { method: "POST" });
  if (!res.ok) throw new Error(`POST /api/integrations/${id}/sync → ${res.status}`);
  return SyncResultSchema.parse(await res.json());
}

// GET /api/candidates
export function fetchCandidates() {
  return getValidated("/api/candidates", CandidatesSummarySchema);
}

// GET /api/voice — voz del empleado (escucha con IA)
export function fetchVoiceSummary() {
  return getValidated("/api/voice", VoiceSummarySchema);
}

// GET /api/ai/voice-digest — lectura ejecutiva (LLM o reglas)
export function fetchVoiceDigest() {
  return getValidated("/api/ai/voice-digest", BriefingSchema);
}

// POST /api/candidates/:id/recap — recap de entrevista (LLM o reglas).
export async function fetchInterviewRecap(id: string): Promise<InterviewRecap> {
  const res = await fetch(`/api/candidates/${encodeURIComponent(id)}/recap`, { method: "POST" });
  if (!res.ok) throw new Error(`POST /api/candidates/${id}/recap → ${res.status}`);
  return InterviewRecapSchema.parse(await res.json());
}

// GET /api/interventions
export function fetchInterventions() {
  return getValidated("/api/interventions", InterventionsSummarySchema);
}

// POST /api/interventions — crea una intervención al asignar una play.
export async function createIntervention(input: {
  ref: string;
  line: string;
  play: string;
  assignedBy: string;
}): Promise<Intervention> {
  const res = await fetch("/api/interventions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`POST /api/interventions → ${res.status}`);
  return InterventionSchema.parse(await res.json());
}

// POST /api/interventions/:id — actualiza estado/resultado (cierra el loop).
export async function updateIntervention(
  id: string,
  patch: { status?: InterventionStatus; outcome?: InterventionOutcome }
): Promise<Intervention> {
  const res = await fetch(`/api/interventions/${encodeURIComponent(id)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`POST /api/interventions/${id} → ${res.status}`);
  return InterventionSchema.parse(await res.json());
}

// POST /api/recommendation/:ref/assign
export async function assignRecommendation(
  ref: string,
  line: string
): Promise<AssignResult> {
  const res = await fetch(`/api/recommendation/${encodeURIComponent(ref)}/assign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ line }),
  });
  if (!res.ok) throw new Error(`POST /api/recommendation → ${res.status}`);
  return AssignResultSchema.parse(await res.json());
}
