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
  fetchBriefing,
  fetchAsk,
  fetchIntegrations,
  syncConnector,
  fetchInterventions,
  createIntervention,
  updateIntervention,
  fetchLineDetail,
  fetchEmployee,
  assignRecommendation,
} from "./api-client";
import type { InterventionStatus, InterventionOutcome } from "@/types";

export const queryKeys = {
  plant: ["plant", "summary"] as const,
  reports: ["reports", "summary"] as const,
  briefing: ["ai", "briefing"] as const,
  integrations: ["integrations"] as const,
  interventions: ["interventions", "list"] as const,
  line: (id: string) => ["line", id] as const,
  employee: (ref: string) => ["employee", ref] as const,
};

export function usePlantSummary() {
  return useQuery({ queryKey: queryKeys.plant, queryFn: fetchPlantSummary });
}

export function useReportSummary() {
  return useQuery({ queryKey: queryKeys.reports, queryFn: fetchReportSummary });
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
  return useMutation({ mutationFn: (id: string) => syncConnector(id) });
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

export function useLineDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.line(id),
    queryFn: () => fetchLineDetail(id),
    enabled: !!id,
  });
}

export function useEmployee(ref: string) {
  return useQuery({
    queryKey: queryKeys.employee(ref),
    queryFn: () => fetchEmployee(ref),
    enabled: !!ref,
  });
}

export function useAssignRecommendation() {
  return useMutation({
    mutationFn: ({ ref, line }: { ref: string; line: string }) =>
      assignRecommendation(ref, line),
  });
}
