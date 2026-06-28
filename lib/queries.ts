// lib/queries.ts
// Hooks de TanStack Query. Las queryKeys son estables para que el caché
// persista entre navegaciones (clave para que el estado se "mantenga").
//
// queryFn → lib/api-client (fetch a los Route Handlers de app/api/*). Los
// componentes solo ven estos hooks; no saben de HTTP.

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPlantSummary,
  fetchReportSummary,
  fetchPilotSummary,
  fetchGovernance,
  fetchBriefing,
  fetchAsk,
  fetchIntegrations,
  syncConnector,
  fetchInterventions,
  createIntervention,
  updateIntervention,
  fetchCandidates,
  fetchInterviewRecap,
  fetchVoiceSummary,
  fetchVoiceDigest,
  fetchLineDetail,
  fetchEmployee,
  fetchEmployees,
  fetchEmployeeTimeline,
  assignRecommendation,
  fetchCostModel,
  updateCostModel,
  fetchPlantProfile,
  updatePlantProfile,
  type EmployeesQuery,
} from "./api-client";
import type { InterventionStatus, InterventionOutcome, CostComponents, IntegrationsSummary } from "@/types";

export const queryKeys = {
  plant: ["plant", "summary"] as const,
  reports: ["reports", "summary"] as const,
  pilot: ["pilot", "summary"] as const,
  governance: ["governance", "summary"] as const,
  costModel: ["settings", "cost-model"] as const,
  plantProfile: ["settings", "plant-profile"] as const,
  briefing: ["ai", "briefing"] as const,
  integrations: ["integrations"] as const,
  interventions: ["interventions", "list"] as const,
  candidates: ["candidates", "list"] as const,
  voice: ["voice", "summary"] as const,
  voiceDigest: ["voice", "digest"] as const,
  line: (id: string) => ["line", id] as const,
  employees: (query: EmployeesQuery) => ["employees", query] as const,
  employee: (ref: string) => ["employee", ref] as const,
  employeeTimeline: (ref: string) => ["employee", ref, "timeline"] as const,
};

export function usePlantSummary() {
  return useQuery({ queryKey: queryKeys.plant, queryFn: fetchPlantSummary });
}

export function useReportSummary() {
  return useQuery({ queryKey: queryKeys.reports, queryFn: fetchReportSummary });
}

export function useGovernance() {
  return useQuery({ queryKey: queryKeys.governance, queryFn: fetchGovernance });
}

export function usePilotSummary() {
  return useQuery({ queryKey: queryKeys.pilot, queryFn: fetchPilotSummary });
}

export function useCostModel() {
  return useQuery({ queryKey: queryKeys.costModel, queryFn: fetchCostModel });
}

// Guardar el costo recalcula los montos en todo: planta, reportes, ROI y candidatos.
export function useUpdateCostModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (components: CostComponents) => updateCostModel(components),
    onSuccess: () => {
      for (const key of [queryKeys.costModel, queryKeys.plant, queryKeys.reports, queryKeys.pilot, queryKeys.candidates]) {
        qc.invalidateQueries({ queryKey: key });
      }
    },
  });
}

export function usePlantProfile() {
  return useQuery({ queryKey: queryKeys.plantProfile, queryFn: fetchPlantProfile });
}

// Cambiar el headcount redimensiona la población → reconteo de planta, reportes y directorio.
export function useUpdatePlantProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; headcount: number; lines: string[]; shifts: string[]; lineRisk?: number[] }) => updatePlantProfile(input),
    onSuccess: () => {
      for (const key of [queryKeys.plantProfile, queryKeys.plant, queryKeys.reports]) {
        qc.invalidateQueries({ queryKey: key });
      }
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useBriefing() {
  return useQuery({ queryKey: queryKeys.briefing, queryFn: fetchBriefing });
}

export function useAskSoral() {
  return useMutation({
    mutationFn: (messages: { role: "user" | "assistant"; content: string }[]) => fetchAsk(messages),
  });
}

export function useIntegrations() {
  return useQuery({ queryKey: queryKeys.integrations, queryFn: fetchIntegrations });
}

export function useSyncConnector() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => syncConnector(id),
    // Refleja la sync también en la tarjeta (no solo en el modal): pasa a conectado y
    // "última sync: hace un momento". Con Supabase, esto lo confirmaría el backend.
    onSuccess: (_res, id) => {
      qc.setQueryData<IntegrationsSummary>(queryKeys.integrations, (prev) =>
        prev
          ? { ...prev, connectors: prev.connectors.map((c) => (c.id === id ? { ...c, lastSyncMin: 0, status: "connected" } : c)) }
          : prev
      );
    },
  });
}

export function useInterventions() {
  return useQuery({ queryKey: queryKeys.interventions, queryFn: fetchInterventions });
}

export function useCreateIntervention() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { ref: string; line: string; play: string; assignedBy: string }) =>
      createIntervention(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.interventions }),
  });
}

export function useUpdateIntervention() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; patch: { status?: InterventionStatus; outcome?: InterventionOutcome } }) =>
      updateIntervention(v.id, v.patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.interventions }),
  });
}

export function useCandidates() {
  return useQuery({ queryKey: queryKeys.candidates, queryFn: fetchCandidates });
}

export function useInterviewRecap() {
  return useMutation({ mutationFn: (id: string) => fetchInterviewRecap(id) });
}

export function useVoiceSummary() {
  return useQuery({ queryKey: queryKeys.voice, queryFn: fetchVoiceSummary });
}

export function useVoiceDigest() {
  return useQuery({ queryKey: queryKeys.voiceDigest, queryFn: fetchVoiceDigest });
}

export function useLineDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.line(id),
    queryFn: () => fetchLineDetail(id),
    enabled: !!id,
  });
}

export function useEmployees(query: EmployeesQuery = {}) {
  return useQuery({
    queryKey: queryKeys.employees(query),
    queryFn: () => fetchEmployees(query),
  });
}

export function useEmployee(ref: string) {
  return useQuery({
    queryKey: queryKeys.employee(ref),
    queryFn: () => fetchEmployee(ref),
    enabled: !!ref,
  });
}

export function useEmployeeTimeline(ref: string) {
  return useQuery({
    queryKey: queryKeys.employeeTimeline(ref),
    queryFn: () => fetchEmployeeTimeline(ref),
    enabled: !!ref,
  });
}

export function useAssignRecommendation() {
  return useMutation({
    mutationFn: ({ ref, line }: { ref: string; line: string }) =>
      assignRecommendation(ref, line),
  });
}
