// app/(app)/modelo/page.tsx
// Transparencia del modelo (model card): qué señales ve, cómo se combinan, qué tan
// preciso es y las reglas que lo rodean. Todas las métricas se COMPUTAN sobre un
// cohorte de validación (lib/model.ts), no son constantes. Es el artefacto que un
// comité de planta (Ford), Legal o el sindicato exigen antes de confiar en un
// número que afecta a personas.
"use client";

import { useTranslations, useFormatter } from "next-intl";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  MODEL_INFO,
  FEATURES,
  signalsOf,
  explain,
  type CalibrationPoint,
  type Feature,
} from "@/lib/model";

// Vector de ejemplo para la descomposición (operador L3, turno nocturno): mismo
// orden que FEATURES. Sirve para demostrar que el SHAP suma exactamente al score.
const EXAMPLE_X = [0.82, 0.725, 0.88, 1.0, 0.1, 0.38];
const MAX_BETA = Math.max(...FEATURES.map((f) => f.beta));

export default function ModelPage() {
  const t = useTranslations("model");
  const f = useFormatter();
  const m = MODEL_INFO;
  const gov = [t("gov1"), t("gov2"), t("gov3"), t("gov4")];
  const ex = explain(EXAMPLE_X);

  return (
    <div className="animate-fade pb-12">
      <div className="py-5">
        <h1 className="text-title font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-body text-ink-2">{t("subtitle")}</p>
      </div>

      <Card className="rounded-xl p-[22px]">
        <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-5">
          <Field label={t("version")} value={m.version} mono />
          <Field label={t("typeLabel")} value={t("typeValue")} />
          <Field label={t("horizonLabel")} value={t("horizonValue", { days: m.horizonDays })} />
          <Field label={t("trainedLabel")} value={f.dateTime(new Date(m.trainedAt), { dateStyle: "medium" })} />
          <Field label={t("sampleLabel")} value={t("sampleValue", { n: f.number(m.sampleSize) })} />
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label={t("mAuc")} value={m.metrics.auc.toFixed(2)} color="#5B6EF5" />
        <Metric label={t("mPrecision")} value={`${Math.round(m.metrics.precision * 100)}%`} color="#8476FF" />
        <Metric label={t("mRecall")} value={`${Math.round(m.metrics.recall * 100)}%`} color="#B49AED" />
        <Metric label={t("mLead")} value={t("leadValue", { days: m.metrics.leadTimeDays })} color="#5B6EF5" />
      </div>

      <p className="mt-2.5 text-meta text-ink-3">
        {t("validationNote", {
          n: f.number(m.sampleSize),
          brier: m.brier.toFixed(2),
          lift: m.lift.toFixed(1),
          base: `${Math.round(m.baseRate * 100)}%`,
          thr: `${Math.round(m.threshold * 100)}%`,
        })}
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="rounded-xl p-[22px]">
          <h3 className="text-body font-semibold">{t("calibTitle")}</h3>
          <p className="mt-0.5 text-copy text-ink-2">{t("calibSub")}</p>
          <Calibration points={m.calibration} predicted={t("calibPredicted")} observed={t("calibObserved")} />
        </Card>

        <Card className="rounded-xl p-[22px]">
          <h3 className="text-body font-semibold">{t("howTitle")}</h3>
          <p className="mt-1 text-copy leading-relaxed text-ink-2">{t("howBody")}</p>
          <h4 className="mt-4 text-copy font-semibold">{t("decompTitle")}</h4>
          <p className="mt-0.5 text-meta text-ink-2">{t("decompSub")}</p>
          <Decomposition ex={ex} t={t} baseLabel={t("decompBase")} finalLabel={t("decompFinal")} />
        </Card>
      </div>

      <Card className="mt-4 rounded-xl p-[22px]">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="text-body font-semibold">{t("signalsTitle")}</h3>
            <p className="mt-0.5 text-copy text-ink-2">{t("signalsSub", { n: 14 })}</p>
          </div>
          <span className="text-micro font-semibold uppercase tracking-wide text-ink-3">{t("weightLabel")}</span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {FEATURES.map((feat) => (
            <FamilyCard key={feat.id} feature={feat} t={t} />
          ))}
        </div>
      </Card>

      <Card className="mt-4 rounded-xl p-[22px]">
        <h3 className="text-body font-semibold">{t("govTitle")}</h3>
        <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {gov.map((g) => (
            <li key={g} className="flex gap-2 text-copy leading-relaxed text-ink-1">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-risk-sol-soft text-risk-sol">
                <Check className="h-3 w-3" />
              </span>
              {g}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-micro font-semibold uppercase tracking-wide text-ink-3">{label}</div>
      <div className={`mt-1 text-body font-medium text-ink-1 ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Card className="px-[17px] py-[15px]">
      <div className="text-meta text-ink-2">{label}</div>
      <div className="mt-1 font-mono text-heading font-bold leading-tight" style={{ color }}>
        {value}
      </div>
    </Card>
  );
}

// Una familia de señales = una feature del modelo. Muestra su peso relativo (β) y
// las señales granulares que la componen, cada una con su fuente y dirección.
function FamilyCard({ feature, t }: { feature: Feature; t: (k: string) => string }) {
  const signals = signalsOf(feature.id);
  return (
    <div className="rounded-lg border border-line bg-surface-bg/60 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-copy font-semibold text-ink-1">{t(`feat_${feature.id}`)}</span>
        <span className="font-mono text-micro text-ink-3">×{feature.beta.toFixed(1)}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-risk-sol" style={{ width: `${(feature.beta / MAX_BETA) * 100}%` }} />
      </div>
      <ul className="mt-3 space-y-2">
        {signals.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-2 text-meta">
            <span className="flex items-center gap-1.5 text-ink-1">
              <span
                className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: s.direction === "up" ? "#EB4F6C" : "#5B6EF5" }}
                aria-hidden="true"
              />
              {t(`sig_${s.id}`)}
            </span>
            <span className="shrink-0 font-mono text-micro text-ink-3">{s.source}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Descomposición SHAP del score de ejemplo: probabilidad base → contribuciones con
// signo (rojo sube riesgo, azul protege) → probabilidad final. Σφ = score exacto.
function Decomposition({
  ex,
  t,
  baseLabel,
  finalLabel,
}: {
  ex: ReturnType<typeof explain>;
  t: (k: string) => string;
  baseLabel: string;
  finalLabel: string;
}) {
  const maxAbs = Math.max(...ex.contribs.map((c) => Math.abs(c.phi)), 0.001);
  return (
    <div className="mt-3">
      <Row label={baseLabel} value={`${Math.round(ex.base * 100)}%`} muted />
      <div className="my-2 space-y-1.5">
        {ex.contribs.map((c) => {
          const up = c.phi >= 0;
          const w = (Math.abs(c.phi) / maxAbs) * 50; // % del ancho (centro = 50%)
          return (
            <div key={c.id} className="flex items-center gap-2 text-meta">
              <span className="w-[124px] shrink-0 truncate text-ink-2">{t(`feat_${c.id}`)}</span>
              <div className="relative h-3.5 flex-1">
                <div className="absolute inset-y-0 left-1/2 w-px bg-line" />
                <div
                  className="absolute inset-y-0 rounded-sm"
                  style={{
                    background: up ? "#EB4F6C" : "#5B6EF5",
                    left: up ? "50%" : `${50 - w}%`,
                    width: `${w}%`,
                  }}
                />
              </div>
              <span className="w-[44px] shrink-0 text-right font-mono text-micro" style={{ color: up ? "#EB4F6C" : "#5B6EF5" }}>
                {up ? "+" : "−"}
                {Math.abs(c.phi).toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
      <Row label={finalLabel} value={`${Math.round(ex.final * 100)}%`} />
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-surface-bg px-3 py-1.5">
      <span className="text-meta text-ink-2">{label}</span>
      <span className={`font-mono text-body font-bold ${muted ? "text-ink-3" : "text-risk-sol"}`}>{value}</span>
    </div>
  );
}

function Calibration({ points, predicted, observed }: { points: CalibrationPoint[]; predicted: string; observed: string }) {
  const W = 300;
  const H = 220;
  const pad = 34;
  const x = (v: number) => pad + (v / 100) * (W - pad - 8);
  const y = (v: number) => H - pad - (v / 100) * (H - pad - 8);
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(p.predicted).toFixed(1)} ${y(p.observed).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="mt-3" role="img" aria-label="Calibration">
      {/* ejes */}
      <line x1={pad} y1={H - pad} x2={W - 8} y2={H - pad} stroke="#E8EAF2" />
      <line x1={pad} y1={8} x2={pad} y2={H - pad} stroke="#E8EAF2" />
      {/* referencia perfecta (diagonal) */}
      <line x1={x(0)} y1={y(0)} x2={x(100)} y2={y(100)} stroke="#C7CCDC" strokeDasharray="4 4" strokeWidth={1.25} />
      {/* curva del modelo */}
      <path d={line} fill="none" stroke="#5B6EF5" strokeWidth={2.5} strokeLinejoin="round" />
      {points.map((p) => (
        <circle key={p.predicted} cx={x(p.predicted)} cy={y(p.observed)} r={3.5} fill="#5B6EF5" />
      ))}
      <text x={W / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="#A9AEC2">{predicted}</text>
      <text x={12} y={H / 2} textAnchor="middle" fontSize="11" fill="#A9AEC2" transform={`rotate(-90 12 ${H / 2})`}>{observed}</text>
    </svg>
  );
}
