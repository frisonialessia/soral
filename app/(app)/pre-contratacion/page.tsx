// app/(app)/pre-contratacion/page.tsx
// Pre-contratación: riesgo y costo de una contratación. El mismo motor de
// supervivencia que retención, pero en t=0. NO decide a quién contratar; estima
// permanencia y costo, y da un recap de entrevista (IA o reglas) como evidencia.
"use client";

import { useState, useEffect } from "react";
import { useTranslations, useFormatter } from "next-intl";
import { ShieldCheck, Sparkles } from "lucide-react";
import { useCandidates, useInterviewRecap } from "@/lib/queries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose } from "@/components/ui/dialog";
import { LoadingState, ErrorState } from "@/components/ui/states";
import { EARLY_EXIT_COST_MXN } from "@/lib/hiring";
import type { Candidate, HireRecommendation } from "@/types";

const REC_COLOR: Record<HireRecommendation, string> = {
  advance: "#5B6EF5",
  review: "#B49AED",
  caution: "#EB4F6C",
};
const survivalColor = (s: number) => (s >= 70 ? "#5B6EF5" : s >= 55 ? "#B49AED" : "#EB4F6C");

export default function HiringPage() {
  const t = useTranslations("hiring");
  const tc = useTranslations("common");
  const f = useFormatter();
  const { data, isLoading, isError, refetch, isFetching } = useCandidates();
  const [recapFor, setRecapFor] = useState<Candidate | null>(null);

  if (isLoading) return <LoadingState label={t("loading")} />;
  if (isError || !data) {
    return <ErrorState title={t("errorTitle")} detail={tc("checkConnection")} onRetry={() => refetch()} retrying={isFetching} />;
  }

  const mxn = (n: number) => f.number(n, { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
  const { kpis, candidates } = data;

  return (
    <div className="animate-fade pb-12">
      <div className="py-5">
        <h1 className="text-title font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-body text-ink-2">{t("subtitle")}</p>
      </div>

      {/* Gobernanza: soporte a la decisión, no rechazo automático */}
      <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-risk-sol/20 bg-risk-sol-soft/50 px-4 py-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-risk-sol" />
        <p className="text-copy leading-relaxed text-ink-2">{t("govNote")}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label={t("kpiPipeline")} value={String(kpis.pipeline)} />
        <Kpi label={t("kpiSurvival")} value={`${kpis.avgSurvival90}%`} color={survivalColor(kpis.avgSurvival90)} />
        <Kpi label={t("kpiCostRisk")} value={mxn(kpis.costAtRiskMxn)} color="#EB4F6C" />
        <Kpi label={t("kpiAdvanceReady")} value={String(kpis.advanceReady)} color="#5B6EF5" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* Pipeline de candidatos */}
        <Card className="overflow-hidden rounded-xl">
          <div className="border-b border-line px-[18px] py-3.5">
            <h3 className="text-body font-semibold">{t("pipelineTitle")}</h3>
            <p className="mt-0.5 text-meta text-ink-3">{t("pipelineSub")}</p>
          </div>
          <div className="divide-y divide-line">
            {candidates.map((c) => (
              <CandidateRow key={c.id} c={c} t={t} mxn={mxn} onRecap={() => setRecapFor(c)} />
            ))}
          </div>
        </Card>

        {/* Calculadora de costo de contratación */}
        <CostCalculator pipeline={kpis.pipeline} avgSurvival={kpis.avgSurvival90} t={t} mxn={mxn} />
      </div>

      <RecapModal candidate={recapFor} onClose={() => setRecapFor(null)} t={t} tc={tc} />
    </div>
  );
}

function Kpi({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <Card className="px-[17px] py-[15px]">
      <div className="text-meta text-ink-2">{label}</div>
      <div className="mt-1 font-mono text-heading font-bold leading-tight" style={{ color: color ?? "#2B2D42" }}>
        {value}
      </div>
    </Card>
  );
}

function CandidateRow({
  c,
  t,
  mxn,
  onRecap,
}: {
  c: Candidate;
  t: (k: string, v?: Record<string, string | number>) => string;
  mxn: (n: number) => string;
  onRecap: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-[18px] py-3 hover:bg-surface-2/50">
      <div className="min-w-[150px] flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-copy font-semibold">{c.ref}</span>
          <RecChip rec={c.recommendation} label={t(`rec_${c.recommendation}`)} />
        </div>
        <div className="mt-0.5 text-meta text-ink-2">
          {c.role} · {c.line} · <span className="text-ink-3">{t(`src_${c.source}`)}</span>
        </div>
      </div>

      <div className="w-[150px]">
        <div className="mb-1 flex justify-between text-micro">
          <span className="text-ink-3">{t("colSurvival90")}</span>
          <span className="font-mono font-semibold" style={{ color: survivalColor(c.survival90) }}>{c.survival90}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded bg-surface-bg">
          <div className="h-full rounded" style={{ width: `${c.survival90}%`, background: survivalColor(c.survival90) }} />
        </div>
        <div className="mt-1 text-micro text-ink-3">
          {t("tenureMonths", { n: c.expectedTenureMonths })} · {t("colSurvival12")} {c.survival12m}%
        </div>
      </div>

      <div className="w-[110px] text-right">
        <div className="text-micro text-ink-3">{t("colCostRisk")}</div>
        <div className="font-mono text-copy font-semibold text-risk-cri">{mxn(c.costRisk)}</div>
      </div>

      <Button variant="default" onClick={onRecap} className="shrink-0">
        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
        {t("recapBtn")}
      </Button>
    </div>
  );
}

function RecChip({ rec, label }: { rec: HireRecommendation; label: string }) {
  const c = REC_COLOR[rec];
  return (
    <span
      className="rounded-full px-2 py-0.5 text-micro font-semibold"
      style={{ color: c, background: `${c}1a` }}
    >
      {label}
    </span>
  );
}

function CostCalculator({
  pipeline,
  avgSurvival,
  t,
  mxn,
}: {
  pipeline: number;
  avgSurvival: number;
  t: (k: string, v?: Record<string, string | number>) => string;
  mxn: (n: number) => string;
}) {
  const [hires, setHires] = useState(Math.max(pipeline, 20));
  const earlyExitRate = 1 - avgSurvival / 100;
  const exits = Math.round(hires * earlyExitRate);
  const cost = exits * EARLY_EXIT_COST_MXN;

  return (
    <Card className="rounded-xl p-[18px]">
      <h3 className="text-body font-semibold">{t("calcTitle")}</h3>
      <p className="mt-0.5 text-meta text-ink-3">{t("calcHint", { cost: mxn(EARLY_EXIT_COST_MXN) })}</p>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-copy">
          <span className="text-ink-1">{t("calcHires")}</span>
          <span className="font-mono font-semibold text-ink-1">{hires}</span>
        </div>
        <input
          type="range"
          min={5}
          max={200}
          step={5}
          value={hires}
          aria-label={t("calcHires")}
          onChange={(e) => setHires(Number(e.target.value))}
          className="w-full accent-[#5B6EF5]"
        />
      </div>

      <div className="mt-4 space-y-2.5">
        <div className="flex items-center justify-between rounded-lg border border-line bg-surface-2 px-3.5 py-2.5">
          <span className="text-meta text-ink-2">{t("calcExits", { rate: `${Math.round(earlyExitRate * 100)}%` })}</span>
          <span className="font-mono text-subhead font-bold text-ink-1">{exits}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-risk-cri/25 bg-risk-cri/5 px-3.5 py-2.5">
          <span className="text-meta text-ink-2">{t("calcCost")}</span>
          <span className="font-mono text-subhead font-bold text-risk-cri">{mxn(cost)}</span>
        </div>
      </div>
      <p className="mt-3 text-micro leading-relaxed text-ink-3">{t("calcFoot")}</p>
    </Card>
  );
}

function RecapModal({
  candidate,
  onClose,
  t,
  tc,
}: {
  candidate: Candidate | null;
  onClose: () => void;
  t: (k: string, v?: Record<string, string | number>) => string;
  tc: (k: string) => string;
}) {
  const recap = useInterviewRecap();
  const { mutate, reset } = recap;
  // Dispara el recap al abrir (una vez por candidato).
  useEffect(() => {
    if (candidate) mutate(candidate.id);
  }, [candidate?.id, mutate]);

  function handleClose() {
    reset();
    onClose();
  }

  if (!candidate) return null;
  const r = recap.data;

  return (
    <Dialog open={!!candidate} onClose={handleClose} label={t("recapTitle")}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-risk-sol" />
            <h2 className="text-subhead font-semibold">{t("recapTitle")}</h2>
          </div>
          <div className="mt-1 font-mono text-copy text-ink-2">
            {candidate.ref} · {candidate.role} · {candidate.line}
          </div>
        </div>
        <DialogClose onClose={handleClose} />
      </div>

      {recap.isPending && <p className="py-6 text-center text-copy text-ink-3">{t("recapLoading")}</p>}
      {recap.isError && (
        <div className="rounded-md border border-risk-cri/30 bg-risk-cri/5 px-3.5 py-2.5 text-copy text-risk-cri" role="alert">
          {t("recapError")}
        </div>
      )}

      {r && (
        <div className="space-y-4">
          <p className="text-body leading-relaxed text-ink-1">{r.summary}</p>

          <RecapList title={t("recapStrengths")} items={r.strengths} dot="#5B6EF5" />
          <RecapList title={t("recapWatchouts")} items={r.watchouts} dot="#EB4F6C" />

          <div>
            <div className="mb-1.5 text-micro font-semibold uppercase tracking-wide text-ink-3">{t("recapQuestions")}</div>
            <ol className="space-y-1.5">
              {r.questions.map((q, i) => (
                <li key={i} className="flex gap-2 text-copy text-ink-1">
                  <span className="font-mono text-ink-3">{i + 1}.</span>
                  {q}
                </li>
              ))}
            </ol>
          </div>

          <div className="flex items-center justify-between border-t border-line pt-3">
            <span className="text-micro text-ink-3">
              {r.source === "llm" ? t("sourceLlm") : t("sourceRules")}
            </span>
            <Button variant="default" onClick={handleClose}>{tc("close")}</Button>
          </div>
          <p className="text-micro leading-relaxed text-ink-3">{t("recapNote")}</p>
        </div>
      )}
    </Dialog>
  );
}

function RecapList({ title, items, dot }: { title: string; items: string[]; dot: string }) {
  if (!items.length) return null;
  return (
    <div>
      <div className="mb-1.5 text-micro font-semibold uppercase tracking-wide text-ink-3">{title}</div>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-copy text-ink-1">
            <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: dot }} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
