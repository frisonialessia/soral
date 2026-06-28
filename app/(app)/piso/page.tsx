// app/(app)/piso/page.tsx
// UX de piso: la cabina del supervisor en el teléfono. Acerca el score a quien
// actúa: su línea, a quién atender AHORA, y la cola de acciones del día con avance
// en un tap. Reutiliza el loop de intervenciones (mismas mutaciones que seguimiento)
// y el modal de recomendación, en una vista mobile-first de una sola columna.
"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useTranslations, useFormatter } from "next-intl";
import { ChevronRight } from "lucide-react";
import { usePlantSummary, useLineDetail, useInterventions, useUpdateIntervention } from "@/lib/queries";
import { useSession } from "@/lib/auth/session";
import { RecommendationModal } from "@/components/recommendation-modal";
import { ConfidenceTag } from "@/components/model/confidence-tag";
import { LoadingState, ErrorState } from "@/components/ui/states";
import { riskColor } from "@/lib/risk";
import type { EmployeePrediction, InterventionStatus, InterventionOutcome } from "@/types";

const STATUS_COLOR: Record<InterventionStatus, string> = { assigned: "#A9AEC2", in_progress: "#B49AED", done: "#5B6EF5" };
const OUTCOME_COLOR: Record<InterventionOutcome, string> = { pending: "#A9AEC2", retained: "#5B6EF5", left: "#EB4F6C" };
const lineColor = (count: number) => (count >= 4 ? "#EB4F6C" : count >= 2 ? "#B49AED" : "#5B6EF5");

export default function FloorPage() {
  const t = useTranslations("floor");
  const ti = useTranslations("interventions");
  const tc = useTranslations("common");
  const f = useFormatter();
  const user = useSession();

  const plant = usePlantSummary();
  const [line, setLine] = useState<string | null>(null);
  const lines = (plant.data?.lines ?? []).filter((l) => l.count > 0);
  const activeLine = line ?? lines[0]?.id ?? "";

  const detail = useLineDetail(activeLine);
  const interventions = useInterventions();
  const update = useUpdateIntervention();
  const [assignEmp, setAssignEmp] = useState<EmployeePrediction | null>(null);

  if (plant.isLoading) return <LoadingState label={t("loading")} />;
  if (plant.isError || !plant.data) {
    return <ErrorState title={t("errorTitle")} detail={tc("checkConnection")} onRetry={() => plant.refetch()} retrying={plant.isFetching} />;
  }

  const workers = [...(detail.data?.employees ?? [])].sort((a, b) => b.score - a.score);
  const highRisk = workers.filter((w) => w.score >= 80).length;
  const lineIvs = (interventions.data?.interventions ?? []).filter((i) => i.line === activeLine);
  const pending = lineIvs.filter((i) => i.status !== "done");
  const assignedRefs = new Set(lineIvs.map((i) => i.ref));
  const set = (id: string, patch: { status?: InterventionStatus; outcome?: InterventionOutcome }) => update.mutate({ id, patch });

  return (
    <div className="animate-fade mx-auto max-w-md pb-16">
      {/* Header */}
      <div className="pt-5">
        <div className="flex items-center justify-between">
          <h1 className="text-heading font-semibold tracking-tight">{t("title")}</h1>
          <span className="text-meta text-ink-3">{t("plant")}</span>
        </div>
        <p className="mt-0.5 text-copy text-ink-2">{t("greeting", { name: user.name })}</p>
      </div>

      {/* Selector de línea */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {lines.map((l) => {
          const on = l.id === activeLine;
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => setLine(l.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-copy font-medium transition-colors ${
                on ? "border-risk-sol bg-risk-sol text-white" : "border-line bg-surface text-ink-2"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: on ? "#fff" : lineColor(l.count) }} />
              {l.id}
              <span className={on ? "text-white/80" : "text-ink-3"}>{l.count}</span>
            </button>
          );
        })}
      </div>

      {/* Resumen del turno */}
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <Stat label={t("highRisk")} value={String(highRisk)} color={highRisk > 0 ? "#EB4F6C" : "#5B6EF5"} />
        <Stat label={t("pendingActions")} value={String(pending.length)} color="#8476FF" />
      </div>

      {/* Actuar ahora */}
      <SectionTitle title={t("actNow")} sub={t("actNowSub")} />
      {detail.isLoading && <p className="px-1 py-4 text-copy text-ink-3">{t("loading")}</p>}
      <div className="space-y-2.5">
        {workers.length === 0 && !detail.isLoading && (
          <Empty>{t("noAlerts")}</Empty>
        )}
        {workers.map((w) => {
          const c = riskColor(w.score);
          return (
            <div key={w.ref} className="rounded-2xl border border-line bg-surface p-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl font-mono text-white" style={{ background: c }}>
                  <span className="text-body font-bold leading-none">{w.score}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/empleado/${encodeURIComponent(w.ref)}`} className="flex items-center font-mono text-body font-semibold hover:text-risk-sol">
                    {w.ref}
                    <ChevronRight className="h-3.5 w-3.5 text-ink-3" />
                  </Link>
                  <p className="truncate text-meta text-ink-2">{w.driver}</p>
                  <div className="mt-1"><ConfidenceTag score={w.score} /></div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAssignEmp(w)}
                className="mt-3 w-full rounded-xl bg-risk-sol py-2.5 text-body font-semibold text-white transition-colors hover:bg-risk-sol/90"
              >
                {assignedRefs.has(w.ref) ? t("reassignPlan") : t("assignPlan")}
              </button>
            </div>
          );
        })}
      </div>

      {/* Mis acciones hoy */}
      <SectionTitle title={t("myActions")} sub={t("myActionsSub")} />
      <div className="space-y-2.5">
        {pending.length === 0 && <Empty>{t("noActions")}</Empty>}
        {pending.map((i) => (
          <div key={i.id} className="rounded-2xl border border-line bg-surface p-3.5">
            <div className="flex items-center gap-2">
              <Link href={`/empleado/${encodeURIComponent(i.ref)}`} className="font-mono text-copy font-semibold hover:text-risk-sol">{i.ref}</Link>
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-micro font-medium" style={{ background: `${STATUS_COLOR[i.status]}1A`, color: STATUS_COLOR[i.status] }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_COLOR[i.status] }} />
                {ti(`status_${i.status}`)}
              </span>
              <span className="ml-auto text-micro text-ink-3">{f.relativeTime(new Date(i.assignedAt))}</span>
            </div>
            <p className="mt-1.5 text-copy text-ink-1">{i.play}</p>
            <div className="mt-3 flex gap-2">
              {i.status === "assigned" && (
                <Btn full onClick={() => set(i.id, { status: "in_progress" })} disabled={update.isPending}>{ti("start")}</Btn>
              )}
              {i.status === "in_progress" && (
                <>
                  <Btn full primary onClick={() => set(i.id, { status: "done", outcome: "retained" })} disabled={update.isPending}>{ti("markRetained")}</Btn>
                  <Btn full onClick={() => set(i.id, { status: "done", outcome: "left" })} disabled={update.isPending}>{ti("markLeft")}</Btn>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <RecommendationModal employee={assignEmp} onClose={() => setAssignEmp(null)} />
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-3">
      <div className="font-mono text-heading font-bold leading-none" style={{ color }}>{value}</div>
      <div className="mt-1 text-meta text-ink-2">{label}</div>
    </div>
  );
}

function SectionTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-2.5 mt-6">
      <h2 className="text-body font-semibold">{title}</h2>
      <p className="text-meta text-ink-3">{sub}</p>
    </div>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-line bg-surface p-6 text-center text-copy text-ink-3">{children}</div>;
}

function Btn({ children, onClick, disabled, primary, full }: { children: ReactNode; onClick: () => void; disabled?: boolean; primary?: boolean; full?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl py-2.5 text-copy font-semibold transition-colors disabled:opacity-40 ${full ? "flex-1" : "px-4"} ${
        primary ? "bg-risk-sol text-white hover:bg-risk-sol/90" : "border border-line-2 text-ink-1 hover:border-risk-sol hover:text-risk-sol"
      }`}
    >
      {children}
    </button>
  );
}
