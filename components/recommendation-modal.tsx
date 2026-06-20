// components/recommendation-modal.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { riskColor, bandLabel } from "@/lib/utils";
import { useAssignRecommendation } from "@/lib/queries";
import type { EmployeePrediction } from "@/types";

export function RecommendationModal({
  employee,
  onClose,
}: {
  employee: EmployeePrediction | null;
  onClose: () => void;
}) {
  const assign = useAssignRecommendation();
  const [assigned, setAssigned] = useState(false);

  if (!employee) return null;
  const c = riskColor(employee.score);

  function handleAssign() {
    if (!employee) return;
    assign.mutate(
      { ref: employee.ref, line: employee.line },
      { onSuccess: () => setAssigned(true) }
    );
  }

  function handleClose() {
    setAssigned(false);
    onClose();
  }

  return (
    <Dialog open={!!employee} onClose={handleClose}>
      <div className="mb-[18px] flex items-start justify-between">
        <div>
          <Badge color={c}>
            {bandLabel(employee.band)} · {employee.score}%
          </Badge>
          <div className="mt-1.5 font-mono text-[15px]">
            {employee.ref} · Línea {employee.line}
          </div>
        </div>
        <DialogClose onClose={handleClose} />
      </div>

      <div className="mb-[18px] rounded-md border border-line bg-surface-2 px-4 py-3.5">
        <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-ink-3">
          Evidencia · por qué el modelo lo marcó
        </div>
        <p className="text-[13.5px] leading-relaxed text-ink-1">{employee.evidence}</p>
      </div>

      <div className="mb-[11px] flex items-center gap-2 text-[12.5px] font-semibold text-risk-sol">
        <span
          className="h-3.5 w-3.5 rounded-full"
          style={{
            background: "conic-gradient(from 180deg,#5B6EF5,#E59BB0,#EB4F6C,#5B6EF5)",
          }}
        />
        Recomendación generada para el gerente
      </div>
      <div className="mb-[22px] whitespace-pre-line text-[13.5px] leading-relaxed text-ink-1">
        {employee.reco}
      </div>

      <div className="flex justify-end gap-2.5">
        <Button variant="default" onClick={handleClose}>
          Descartar
        </Button>
        <Button
          variant="primary"
          onClick={handleAssign}
          disabled={assign.isPending || assigned}
        >
          {assigned
            ? "✓ Asignada"
            : assign.isPending
            ? "Asignando…"
            : "Asignar al supervisor"}
        </Button>
      </div>
    </Dialog>
  );
}
