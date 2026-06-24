// lib/server/inputs.ts
// Esquemas Zod de ENTRADA: params de ruta, query string y bodies. Separados de los
// contratos de RESPUESTA (types/index.ts) a propósito — son fronteras distintas.
// Validan en el borde del handler; run() convierte un ZodError en 400.
import { z } from "zod";
import { RiskBandSchema, InterventionStatusSchema, InterventionOutcomeSchema } from "@/types";

// — Params de ruta —
export const RefParam = z.object({ ref: z.string().min(1).max(64) });
export const IdParam = z.object({ id: z.string().min(1).max(64) });
export const LineIdParam = z.object({ id: z.string().regex(/^L\d{1,2}$/i, "id de línea inválido (p. ej. L3)") });

// — Query string —
// GET /api/employees. Los números llegan como string en la URL → z.coerce.
export const EmployeeListQuery = z.object({
  line: z.string().max(8).optional(),
  shift: z.string().max(24).optional(),
  band: RiskBandSchema.optional(),
  minScore: z.coerce.number().min(0).max(100).optional(),
  maxScore: z.coerce.number().min(0).max(100).optional(),
  search: z.string().max(100).optional(),
  sort: z.enum(["score", "tenure", "ref"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
export type EmployeeListQueryInput = z.infer<typeof EmployeeListQuery>;

// — Bodies —
export const CreateInterventionBody = z.object({
  ref: z.string().min(1).max(64),
  line: z.string().min(1).max(8),
  play: z.string().max(500).optional().default(""),
  assignedBy: z.string().max(120).optional().default(""),
});

export const UpdateInterventionBody = z
  .object({
    status: InterventionStatusSchema.optional(),
    outcome: InterventionOutcomeSchema.optional(),
  })
  .refine((v) => v.status !== undefined || v.outcome !== undefined, {
    message: "Se requiere al menos status u outcome",
  });

export const AssignBody = z.object({ line: z.string().min(1).max(8) });

export const AskBody = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .min(1)
    .max(50),
});
