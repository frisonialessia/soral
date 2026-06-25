// app/(app)/evidencia/page.tsx
// LA PRUEBA del cerebro. Predecir quién se va es la mitad; demostrar que ACTUAR
// reduce la rotación es la venta. Esta vista presenta el pilot ALEATORIZADO
// (tratados vs. control) con estadística real (lib/causal.ts): efecto causal (ATE)
// con IC 95 % y valor p, ROI en MXN, heterogeneidad por línea y el flywheel que
// convierte los resultados del loop en un modelo cada vez mejor. Es el artefacto que
// un comité de planta (Ford) o un CFO exige antes de pagar por el número.
"use client";

import Link from "next/link";
import { useTranslations, useFormatter } from "next-intl";
import { ArrowRight } from "lucide-react";
import { usePilotSummary } from "@/lib/queries";
import { Card } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/ui/states";
import { formatMxn } from "@/lib/utils";
import { EstimateBadge } from "@/components/dashboard/estimate-badge";
import type { PilotSummary, PilotLineUplift, PilotTrendPoint, RetrainPoint } from "@/types";

const SOL = "#5B6EF5";
const VIO = "#8476FF";
const MUTED = "#A9AEC2";

export default function EvidencePage() {
  const t = useTranslations("evidence");
  const tc = useTranslations("common");
  const f = useFormatter();
  const { data, isLoading, isError, refetch, isFetching } = usePilotSummary();

  if (isLoading) return <LoadingState label={t("loading")} />;
  if (isError || !data) {
    return <ErrorState title={t("errorTitle")} detail={tc("checkConnection")} onRetry={() => refetch()} retrying={isFetching} />;
  }
  const p: PilotSummary = data;
  const pText = p.pValue < 0.001 ? "< 0.001" : `= ${p.pValue.toFixed(3)}`;

  return (
    <div className="animate-fade pb-12">
      <div className="py-5">
        <h1 className="text-title font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1 max-w-2xl text-body text-ink-2">{t("subtitle")}</p>
      </div>

      {/* Veredicto causal */}
      <Card className="rounded-xl p-[22px]">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <div className="text-micro font-semibold uppercase tracking-wide text-ink-3">{t("verdictLabel")}</div>
            <div className="mt-1 flex items-end gap-3">
              <span className="font-mono text-hero font-bold leading-none" style={{ color: SOL }}>+{f.number(p.ate)}</span>
              <span className="mb-1.5 text-body font-medium text-ink-2">pp</span>
              <span
                className="mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-meta font-semibold"
                style={{ background: p.significant ? "#5B6EF51A" : "#A9AEC21A", color: p.significant ? SOL : MUTED }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.significant ? SOL : MUTED }} />
                p {pText} · {t(p.significant ? "significant" : "notSignificant")}
              </span>
            </div>
            <div className="mt-2 text-copy text-ink-3">{t("ci", { low: f.number(p.ciLow), high: f.number(p.ciHigh) })}</div>
            <p className="mt-3 max-w-md text-body leading-relaxed text-ink-1">
              {t("verdictSentence", { t: Math.round(p.treated.rate), c: Math.round(p.control.rate) })}
            </p>
          </div>
          <div className="space-y-3">
            <ArmBar label={t("armTreated")} sub={t("armSub", { n: p.treated.n, retained: p.treated.retained })} rate={p.treated.rate} color={SOL} />
            <ArmBar label={t("armControl")} sub={t("armSub", { n: p.control.n, retained: p.control.retained })} rate={p.control.rate} color={MUTED} />
          </div>
        </div>
      </Card>

      {/* Diseño + ROI */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <Card className="rounded-xl p-[22px]">
          <h3 className="text-body font-semibold">{t("designTitle")}</h3>
          <div className="mt-4 grid grid-cols-2 gap-5">
            <Field label={t("designN")} value={t("designNValue", { n: f.number(p.designN) })} />
            <Field label={t("designSplit")} value={t("designSplitValue")} />
            <Field label={t("designHorizon")} value={t("designHorizonValue", { days: 90 })} />
            <Field label={t("designNnt")} value={String(p.nnt)} sub={t("nntSub")} />
          </div>
        </Card>

        <Card className="rounded-xl p-[22px]">
          <h3 className="text-body font-semibold">{t("roiTitle")}</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-line bg-surface-bg/60 p-4">
              <div className="text-meta text-ink-2">{t("roiPilotLabel")}</div>
              <div className="mt-1 font-mono text-title font-bold leading-tight" style={{ color: SOL }}>{p.extraRetainedPilot}</div>
              <div className="mt-1 text-meta text-ink-3">{t("roiCostPilot")}: <span className="font-medium text-ink-1">{formatMxn(p.costAvoidedPilot)}</span></div>
            </div>
            <div className="rounded-lg border border-line bg-surface-bg/60 p-4">
              <div className="text-meta text-ink-2">{t("roiAnnualLabel")}</div>
              <div className="mt-1 font-mono text-title font-bold leading-tight" style={{ color: VIO }}>{formatMxn(p.costAvoidedAnnual)}</div>
              <div className="mt-1 text-meta text-ink-3">{t("roiAnnualSub", { n: f.number(p.annualEligible) })}</div>
            </div>
          </div>
          <p className="mt-3 flex flex-wrap items-center gap-2 text-meta text-ink-3">
            <span>{t("roiNote", { cost: formatMxn(p.replacementCostMxn) })}</span>
            {p.costEstimated && <EstimateBadge />}
          </p>
        </Card>
      </div>

      {/* Convergencia del efecto */}
      <Card className="mt-4 rounded-xl p-[22px]">
        <h3 className="text-body font-semibold">{t("trendTitle")}</h3>
        <p className="mt-0.5 text-copy text-ink-2">{t("trendSub")}</p>
        <TrendChart points={p.trend} xLabel={t("trendX")} yLabel={t("trendY")} />
      </Card>

      {/* Heterogeneidad por línea */}
      <Card className="mt-4 rounded-xl p-[22px]">
        <h3 className="text-body font-semibold">{t("byLineTitle")}</h3>
        <p className="mt-0.5 max-w-2xl text-copy text-ink-2">{t("byLineSub")}</p>
        <ByLine rows={p.byLine} t={t} f={f} />
      </Card>

      {/* Flywheel del modelo */}
      <Card className="mt-4 rounded-xl p-[22px]">
        <h3 className="text-body font-semibold">{t("flywheelTitle")}</h3>
        <p className="mt-1 max-w-3xl text-copy leading-relaxed text-ink-2">{t("flywheelBody")}</p>
        <Flywheel retrains={p.retrains} labelsWord={t("flywheelLabels")} projectedWord={t("flywheelProjected")} />
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Link href="/seguimiento" className="inline-flex items-center gap-1.5 rounded-lg border border-line-2 px-3 py-1.5 text-copy font-medium text-ink-1 transition-colors hover:border-risk-sol hover:text-risk-sol">
            {t("flywheelLinkLoop")} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link href="/modelo" className="inline-flex items-center gap-1.5 rounded-lg border border-line-2 px-3 py-1.5 text-copy font-medium text-ink-1 transition-colors hover:border-risk-sol hover:text-risk-sol">
            {t("flywheelLinkModel")} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </Card>

      <p className="mt-4 max-w-3xl text-meta leading-relaxed text-ink-3">
        <span className="font-semibold text-ink-2">{t("methodTitle")}: </span>
        {t("methodBody")}
      </p>
    </div>
  );
}

function Field({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="text-micro font-semibold uppercase tracking-wide text-ink-3">{label}</div>
      <div className="mt-1 text-body font-medium text-ink-1">{value}</div>
      {sub && <div className="mt-0.5 text-micro text-ink-3">{sub}</div>}
    </div>
  );
}

// Barra de retención de un brazo (tratados / control). El ancho = % de retención.
function ArmBar({ label, sub, rate, color }: { label: string; sub: string; rate: number; color: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-copy font-medium text-ink-1">{label}</span>
        <span className="font-mono text-body font-bold" style={{ color }}>{rate.toFixed(1)}%</span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full" style={{ width: `${rate}%`, background: color }} />
      </div>
      <div className="mt-1 text-micro text-ink-3">{sub}</div>
    </div>
  );
}

// Curva acumulada del efecto con banda de IC 95 %: el estimado se estabiliza y la
// banda se angosta a medida que el pilot enrola — la evidencia se vuelve concluyente.
function TrendChart({ points, xLabel, yLabel }: { points: PilotTrendPoint[]; xLabel: string; yLabel: string }) {
  const W = 620, H = 250, padL = 40, padR = 14, padT = 14, padB = 30;
  const lo = Math.floor((Math.min(0, ...points.map((p) => p.ciLow)) - 4) / 10) * 10;
  const hi = Math.ceil((Math.max(...points.map((p) => p.ciHigh)) + 4) / 10) * 10;
  const x = (w: number) => padL + ((w - points[0].week) / (points[points.length - 1].week - points[0].week)) * (W - padL - padR);
  const y = (v: number) => H - padB - ((v - lo) / (hi - lo)) * (H - padT - padB);
  const ribbon =
    points.map((p, i) => `${i ? "L" : "M"}${x(p.week).toFixed(1)} ${y(p.ciHigh).toFixed(1)}`).join(" ") +
    " " +
    [...points].reverse().map((p) => `L${x(p.week).toFixed(1)} ${y(p.ciLow).toFixed(1)}`).join(" ") +
    " Z";
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(p.week).toFixed(1)} ${y(p.ate).toFixed(1)}`).join(" ");
  const yTicks = [lo, Math.round((lo + hi) / 2 / 10) * 10, hi].filter((v, i, a) => a.indexOf(v) === i);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="mt-3" role="img" aria-label={yLabel}>
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={padL} y1={y(v)} x2={W - padR} y2={y(v)} stroke="#F0F2F8" />
          <text x={padL - 6} y={y(v) + 3} textAnchor="end" fontSize="10" fill={MUTED}>{v}</text>
        </g>
      ))}
      {/* cero */}
      <line x1={padL} y1={y(0)} x2={W - padR} y2={y(0)} stroke="#C7CCDC" strokeDasharray="4 4" />
      {/* banda IC */}
      <path d={ribbon} fill={`${SOL}1F`} stroke="none" />
      {/* línea del efecto */}
      <path d={line} fill="none" stroke={SOL} strokeWidth={2.5} strokeLinejoin="round" />
      {points.map((p) => (
        <circle key={p.week} cx={x(p.week)} cy={y(p.ate)} r={2.5} fill={SOL} />
      ))}
      {points.filter((_, i) => i % 2 === 1).map((p) => (
        <text key={p.week} x={x(p.week)} y={H - 8} textAnchor="middle" fontSize="10" fill={MUTED}>{p.week}</text>
      ))}
      <text x={padL} y={H - 8} textAnchor="start" fontSize="10" fill={MUTED}>{xLabel}</text>
      <text x={12} y={H / 2} textAnchor="middle" fontSize="10" fill={MUTED} transform={`rotate(-90 12 ${H / 2})`}>{yLabel}</text>
    </svg>
  );
}

// Uplift por línea con bigote de IC 95 %. Si el IC cruza el cero, el efecto en esa
// línea aún NO es concluyente (se marca distinto): honestidad estadística.
function ByLine({ rows, t, f }: { rows: PilotLineUplift[]; t: (k: string, v?: Record<string, string | number>) => string; f: ReturnType<typeof useFormatter> }) {
  const lo = Math.min(0, ...rows.map((r) => r.ciLow)) - 4;
  const hi = Math.max(...rows.map((r) => r.ciHigh)) + 4;
  const pct = (v: number) => ((v - lo) / (hi - lo)) * 100;
  return (
    <div className="mt-4 space-y-2.5">
      {rows.map((r) => {
        const sig = r.ciLow > 0;
        const color = sig ? SOL : MUTED;
        return (
          <div key={r.line} className="flex items-center gap-3">
            <span className="w-7 shrink-0 font-mono text-meta font-semibold text-ink-1">{r.line}</span>
            <span className="w-24 shrink-0 text-micro text-ink-3">{t("byLineCount", { nt: r.nT, nc: r.nC })}</span>
            <div className="relative h-4 flex-1">
              {/* cero */}
              <div className="absolute inset-y-0 w-px bg-line-2" style={{ left: `${pct(0)}%` }} />
              {/* bigote IC */}
              <div className="absolute top-1/2 h-px -translate-y-1/2" style={{ left: `${pct(r.ciLow)}%`, width: `${pct(r.ciHigh) - pct(r.ciLow)}%`, background: color, opacity: 0.5 }} />
              <div className="absolute top-1/2 h-2 w-px -translate-y-1/2" style={{ left: `${pct(r.ciLow)}%`, background: color, opacity: 0.5 }} />
              <div className="absolute top-1/2 h-2 w-px -translate-y-1/2" style={{ left: `${pct(r.ciHigh)}%`, background: color, opacity: 0.5 }} />
              {/* punto del uplift */}
              <div className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: `${pct(r.uplift)}%`, background: color }} />
            </div>
            <span className="w-12 shrink-0 text-right font-mono text-meta font-semibold" style={{ color }}>
              {r.uplift > 0 ? "+" : ""}{f.number(r.uplift)}
            </span>
            {!sig && <span className="w-[88px] shrink-0 text-micro text-ink-3">{t("notSignificant")}</span>}
            {sig && <span className="w-[88px] shrink-0" />}
          </div>
        );
      })}
    </div>
  );
}

// Flywheel: los resultados del loop son etiquetas; al acumularse, el modelo se
// reentrena y mejora. El último punto embarcado ancla al AUC actual; el siguiente
// es proyección (marcado con borde discontinuo).
function Flywheel({ retrains, labelsWord, projectedWord }: { retrains: RetrainPoint[]; labelsWord: string; projectedWord: string }) {
  return (
    <div className="mt-4 flex items-stretch gap-2 overflow-x-auto pb-1">
      {retrains.map((r, i) => (
        <div key={r.version} className="flex items-center gap-2">
          <div className={`min-w-[124px] rounded-lg border p-3 ${r.projected ? "border-dashed border-line-2 bg-transparent" : "border-line bg-surface-bg/60"}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-meta font-semibold text-ink-1">{r.version}</span>
              {r.projected && <span className="rounded-full bg-line px-1.5 py-0.5 text-micro font-medium uppercase tracking-wide text-ink-3">{projectedWord}</span>}
            </div>
            <div className="mt-2 font-mono text-heading font-bold leading-none" style={{ color: r.projected ? MUTED : SOL }}>{r.auc.toFixed(2)}</div>
            <div className="mt-0.5 text-micro text-ink-3">AUC</div>
            <div className="mt-2 text-micro text-ink-2">{r.labels.toLocaleString("es-MX")} <span className="text-ink-3">{labelsWord}</span></div>
          </div>
          {i < retrains.length - 1 && <ArrowRight className="h-4 w-4 shrink-0 text-ink-3" />}
        </div>
      ))}
    </div>
  );
}
