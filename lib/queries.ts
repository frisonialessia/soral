// lib/queries.ts
// Hooks de TanStack Query. Las queryKeys son estables para que el caché
// persista entre navegaciones (clave para que el estado se "mantenga").

import { useQuery, useMutation } from "@tanstack/react-query";
import {
  fetchPlantSummary,
  fetchLineDetail,
  fetchEmployee,
  assignRecommendation,
} from "./mock-api";

export const queryKeys = {
  plant: ["plant", "summary"] as const,
  line: (id: string) => ["line", id] as const,
  employee: (ref: string) => ["employee", ref] as const,
};

export function usePlantSummary() {
  return useQuery({ queryKey: queryKeys.plant, queryFn: fetchPlantSummary });
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
