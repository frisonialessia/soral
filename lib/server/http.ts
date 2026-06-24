// lib/server/http.ts
// Utilidades HTTP compartidas para los Route Handlers — SERVER ONLY.
// Respuestas CONSISTENTES en toda la API:
//   • éxito → el DTO pelado (lo que la UI / api-client consume y valida con Zod)
//   • error → { error: { code, message, details? } } con el status HTTP correcto
//
// El handler solo describe el "camino feliz" y lanza HttpError/ZodError cuando algo
// falla; run() centraliza la traducción a la estructura de error. Así ningún
// endpoint inventa su propio formato.
import { NextResponse } from "next/server";
import { ZodError } from "zod";

// Éxito: el DTO tal cual.
export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, init);
}

export interface ApiErrorBody {
  error: { code: string; message: string; details?: unknown };
}

// Error con estructura consistente.
export function fail(status: number, code: string, message: string, details?: unknown): NextResponse {
  const body: ApiErrorBody = { error: { code, message, ...(details !== undefined ? { details } : {}) } };
  return NextResponse.json(body, { status });
}

// Error de dominio con status HTTP — se lanza desde el handler y run() lo traduce.
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export const badRequest = (message = "Solicitud inválida", details?: unknown) =>
  new HttpError(400, "bad_request", message, details);
export const notFound = (message = "Recurso no encontrado") => new HttpError(404, "not_found", message);

// Ejecuta el trabajo del handler y traduce CUALQUIER error a la estructura
// consistente: HttpError → su status; ZodError → 400 validation_error; resto → 500.
export async function run(work: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await work();
  } catch (err) {
    if (err instanceof HttpError) return fail(err.status, err.code, err.message, err.details);
    if (err instanceof ZodError) return fail(400, "validation_error", "Parámetros inválidos", err.flatten());
    console.error("[api] error no controlado:", err);
    return fail(500, "internal_error", "Error interno del servidor");
  }
}

// Lee y parsea el body JSON; 400 (bad_request) si no es JSON válido.
export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw badRequest("El cuerpo debe ser JSON válido");
  }
}

// Query string como objeto, descartando valores vacíos para que los campos
// opcionales sigan siendo opcionales al validar con Zod.
export function queryParams(req: Request): Record<string, string> {
  const out: Record<string, string> = {};
  new URL(req.url).searchParams.forEach((value, key) => {
    if (value !== "") out[key] = value;
  });
  return out;
}
