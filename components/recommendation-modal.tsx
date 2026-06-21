// components/recommendation-modal.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { riskColor } from "@/lib/risk";
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
  const t = useTranslations("modal");
  const tb = useTranslations("bands");
  const tc = useTranslations("common");

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
    assign.reset();
    onClose();
  }

  return (
    <Dialog open={!!employee} onClose={handleClose} label={t("label", { ref: employee.ref })}>
      <div className="mb-[18px] flex items-start justify-between">
        <div>
          <Badge color={c}>
            {tb(employee.band)} · {employee.score}%
          </Badge>
          <div className="mt-1.5 font-mono text-[15px]">
            {t("refLine", { ref: employee.ref, line: employee.line })}
          </div>
        </div>
        <DialogClose onClose={handleClose} />
      </div>

      <div className="mb-[18px] rounded-md border border-line bg-surface-2 px-4 py-3.5">
        <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-ink-3">
          {t("evidenceTitle")}
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
        {t("recoTitle")}
      </div>
      <div className="mb-[22px] whitespace-pre-line text-[13.5px] leading-relaxed text-ink-1">
        {employee.reco}
      </div>

      {assign.isError && (
        <div
          className="mb-3 rounded-md border border-risk-cri/30 bg-risk-cri/5 px-3.5 py-2.5 text-[12.5px] text-risk-cri"
          role="alert"
        >
          {t("assignError")}
        </div>
      )}

      <div className="flex justify-end gap-2.5">
        <Button variant="default" onClick={handleClose}>
          {t("dismiss")}
        </Button>
        <Button
          variant="primary"
          onClick={handleAssign}
          disabled={assign.isPending || assigned}
        >
          {assigned
            ? t("assigned")
            : assign.isPending
            ? t("assigning")
            : assign.isError
            ? tc("retry")
            : t("assign")}
        </Button>
      </div>
    </Dialog>
  );
}
