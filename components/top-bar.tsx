// components/risk-table.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { riskColor } from "@/lib/utils";
import type { EmployeePrediction } from "@/types";
import { RecommendationModal } from "@/components/recommendation-modal";

interface RiskTableProps {
  rows: EmployeePrediction[];
  showLine?: boolean;
  emptyLabel?: string;
}

export function RiskTable({ rows, showLine = true, emptyLabel }: RiskTableProps) {
  const [modalEmp, setModalEmp] = useState<EmployeePrediction | null>(null);

  return (
    <>
      <Table>
        <THead>
          <TR className="hover:bg-transparent">
            <TH>Empleado</TH>
            <TH>Score</TH>
            <TH>Driver principal</TH>
            {showLine && <TH>Línea</TH>}
            <TH />
          </TR>
        </THead>
        <tbody>
          {rows.length === 0 && (
            <TR>
              <TD colSpan={showLine ? 5 : 4} className="py-8 text-center text-ink-3">
                {emptyLabel ?? "Sin empleados en riesgo."}
              </TD>
            </TR>
          )}
          {rows.map((e) => {
            const c = riskColor(e.score);
            return (
              <TR key={e.ref}>
                <TD>
                  <Link
                    href={`/empleado/${encodeURIComponent(e.ref)}`}
                    className="font-mono text-[13px] text-ink-1 hover:text-risk-sol"
                  >
                    {e.ref}
                  </Link>
                </TD>
                <TD>
                  <div className="flex items-center gap-[11px]">
                    <div className="h-1.5 w-16 overflow-hidden rounded-[3px] bg-surface-bg">
                      <div className="h-full rounded-[3px]" style={{ width: `${e.score}%`, background: c }} />
                    </div>
                    <span className="min-w-[38px] font-mono font-bold" style={{ color: c }}>
                      {e.score}%
                    </span>
                  </div>
                </TD>
                <TD>{e.driver}</TD>
                {showLine && <TD className="font-mono text-[13px] text-ink-2">{e.line}</TD>}
                <TD className="text-right">
                  <button
                    onClick={() => setModalEmp(e)}
                    className="whitespace-nowrap rounded-lg border border-line-2 px-3.5 py-[7px] text-[12.5px] font-medium text-ink-1 transition-colors hover:border-risk-sol hover:bg-risk-sol-soft hover:text-risk-sol"
                  >
                    Acción
                  </button>
                </TD>
              </TR>
            );
          })}
        </tbody>
      </Table>

      <RecommendationModal employee={modalEmp} onClose={() => setModalEmp(null)} />
    </>
  );
}
