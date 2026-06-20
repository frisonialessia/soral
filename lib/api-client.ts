// lib/api-client.ts
// Capa de fetch (client-side). Llama a los Route Handlers de app/api/* y devuelve
// datos con el contrato de types/index.ts. TanStack Query (lib/queries.ts) consume
// estas funciones; los componentes no saben que hay HTTP de por medio.
//
// Las firmas son idénticas a las de la antigua mock-api, por eso queries.ts solo
// cambió el import.

import type { EmployeePrediction, LineDetail, PlantSummary } from "@/types";

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return res.json() as Promise<T>;
}

// GET /api/plant/summary
export function fetchPlantSummary(): Promise<PlantSummary> {
  return getJson<PlantSummary>("/api/plant/summary");
}

// GET /api/line/:id
export function fetchLineDetail(id: string): Promise<LineDetail> {
  return getJson<LineDetail>(`/api/line/${encodeURIComponent(id)}`);
}

// GET /api/employee/:ref — los refs llevan "#", se codifican para la URL.
// 404 (no encontrado) se mapea a null para conservar el contrato anterior.
export async function fetchEmployee(ref: string): Promise<EmployeePrediction | null> {
  const res = await fetch(`/api/employee/${encodeURIComponent(ref)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET /api/employee → ${res.status}`);
  return res.json() as Promise<EmployeePrediction>;
}

// POST /api/recommendation/:ref/assign
export async function assignRecommendation(
  ref: string,
  line: string
): Promise<{ ok: true; assignedAt: string }> {
  const res = await fetch(`/api/recommendation/${encodeURIComponent(ref)}/assign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ line }),
  });
  if (!res.ok) throw new Error(`POST /api/recommendation → ${res.status}`);
  return res.json() as Promise<{ ok: true; assignedAt: string }>;
}
