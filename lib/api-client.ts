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
  type EmployeePrediction,
  type AssignResult,
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

// GET /api/reports/summary
export function fetchReportSummary() {
  return getValidated("/api/reports/summary", ReportSummarySchema);
}

// GET /api/ai/briefing
export function fetchBriefing() {
  return getValidated("/api/ai/briefing", BriefingSchema);
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
