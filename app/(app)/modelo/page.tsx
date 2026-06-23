// app/(app)/modelo/page.tsx
// Transparencia del modelo (model card): qué significa el score, cómo se calcula,
// métricas, calibración, confianza y gobernanza. Es el artefacto que un comité de
// planta (Ford), Legal o el sindicato exigen antes de confiar en un número que
// afecta a personas.
"use client";

import { useTranslations, useFormatter } from "next-intl";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MODEL_INFO, type CalibrationPoint } from "@/lib/model";

export default function ModelPage() {
  const t = useTranslations("model");
  const f = useFormatter();
  const m = MODEL_INFO;
  const dims = [t("dim1"), t("dim2"), t("dim3"), t("dim4"), t("dim5"), t("dim6")];
  const gov = [t("gov1"), t("gov2"), t("gov3"), t("gov4")];

  return (
    <div className="animate-fade pb-12">
      <div className="py-5">
        <h1 className="text-[27px] font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-ink-2">{t("subtitle")}</p>
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

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="rounded-xl p-[22px]">
          <h3 className="text-[15px] font-semibold">{t("calibTitle")}</h3>
          <p className="mt-0.5 text-[12.5px] text-ink-2">{t("calibSub")}</p>
          <Calibration points={m.calibration} predicted={t("calibPredicted")} observed={t("calibObserved")} />
        </Card>

        <Card className="rounded-xl p-[22px]">
          <h3 className="text-[15px] font-semibold">{t("howTitle")}</h3>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-2">{t("howBody")}</p>
          <div className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-ink-3">{t("dimsTitle")}</div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {dims.map((d) => (
              <span key={d} className="rounded-lg bg-surface-bg px-2.5 py-1.5 text-[12px] text-ink-1">
                {d}
              </span>
            ))}
          </div>
          <h4 className="mt-4 text-[13px] font-semibold">{t("confTitle")}</h4>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-2">{t("confBody")}</p>
        </Card>
      </div>

      <Card className="mt-4 rounded-xl p-[22px]">
        <h3 className="text-[15px] font-semibold">{t("govTitle")}</h3>
        <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {gov.map((g) => (
            <li key={g} className="flex gap-2 text-[12.5px] leading-relaxed text-ink-1">
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
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-3">{label}</div>
      <div className={`mt-1 text-[14px] font-medium text-ink-1 ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Card className="px-[17px] py-[15px]">
      <div className="text-[11.5px] text-ink-2">{label}</div>
      <div className="mt-1 font-mono text-[23px] font-bold leading-tight" style={{ color }}>
        {value}
      </div>
    </Card>
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
