// components/admin/cost-model-section.tsx
// LA herramienta para RH: calcula el costo real de cada salida por componentes
// (reclutamiento, exámenes, capacitación, curva de productividad, cobertura,
// finiquito). Lo que se guarde aquí es la ÚNICA fuente de verdad del monto: el KPI
// "Costo en riesgo", el simulador y el ROI se recalculan solos. Modo simple = un
// número que se reparte con las proporciones de referencia.
"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Calculator, Check, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/ui/states";
import { useCostModel, useUpdateCostModel } from "@/lib/queries";
import type { CostComponents, CostModel } from "@/types";

const KEYS = ["recruiting", "screening", "training", "productivity", "coverage", "separation"] as const;
// Valores de referencia (suman 36,800) — para "usar referencia" y para repartir el modo simple.
const REF: CostComponents = { recruiting: 5_200, screening: 2_400, training: 8_600, productivity: 12_800, coverage: 4_800, separation: 3_000 };
const sumOf = (c: CostComponents) => KEYS.reduce((s, k) => s + (c[k] || 0), 0);

export function CostModelSection() {
  const t = useTranslations("costModel");
  const tc = useTranslations("common");
  const { data, isLoading, isError, refetch, isFetching } = useCostModel();

  if (isLoading) {
    return (
      <Card className="mt-6 rounded-xl p-[22px]">
        <LoadingState label={t("loading")} />
      </Card>
    );
  }
  if (isError || !data) {
    return (
      <Card className="mt-6 rounded-xl p-[22px]">
        <ErrorState title={t("errorTitle")} detail={tc("checkConnection")} onRetry={() => refetch()} retrying={isFetching} />
      </Card>
    );
  }
  return <CostModelForm model={data} />;
}

function CostModelForm({ model }: { model: CostModel }) {
  const t = useTranslations("costModel");
  const locale = useLocale();
  const mut = useUpdateCostModel();
  const [mode, setMode] = useState<"components" | "simple">("components");
  const [form, setForm] = useState<CostComponents>(model.components);
  const [simple, setSimple] = useState<number>(model.costPerReplacement);

  const cur = new Intl.NumberFormat(locale, { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
  const total = mode === "simple" ? Math.max(0, Math.round(simple)) : sumOf(form);

  // Reparte un total por las proporciones de referencia (para el modo simple).
  function fromTotal(tot: number): CostComponents {
    const base = sumOf(REF) || 1;
    return KEYS.reduce((acc, k) => ({ ...acc, [k]: Math.round((REF[k] / base) * tot) }), {} as CostComponents);
  }

  const setField = (k: (typeof KEYS)[number], v: string) =>
    setForm((f) => ({ ...f, [k]: Math.max(0, Math.round(Number(v) || 0)) }));

  function save() {
    mut.mutate(mode === "simple" ? fromTotal(total) : form);
  }

  return (
    <Card id="cost-config" className="mt-6 scroll-mt-24 rounded-xl p-[22px]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-risk-sol-soft text-risk-sol">
            <Calculator className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-subhead font-semibold tracking-tight">{t("title")}</h2>
            <p className="mt-0.5 max-w-xl text-copy text-ink-2">{t("subtitle")}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-title font-bold leading-none text-ink-1">{cur.format(total)}</div>
          <div className="mt-1.5">
            {model.configured ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-risk-sol-soft px-2 py-0.5 text-micro font-medium text-risk-sol">
                <Check className="h-3 w-3" /> {t("configured")}
              </span>
            ) : (
              <span className="rounded-full bg-surface-bg px-2 py-0.5 text-micro font-medium text-ink-3">{t("estimateRef")}</span>
            )}
          </div>
        </div>
      </div>

      {/* Modo */}
      <div role="tablist" aria-label={t("title")} className="mt-5 inline-flex gap-1 rounded-full bg-surface-bg p-1">
        {(["components", "simple"] as const).map((m) => {
          const active = mode === m;
          return (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                if (m === "simple") setSimple(sumOf(form));
                else setForm(fromTotal(Math.max(0, Math.round(simple))));
                setMode(m);
              }}
              className={`rounded-full px-3.5 py-1.5 text-copy transition-colors ${
                active ? "bg-surface font-medium text-ink-1 shadow-sm" : "text-ink-2 hover:text-ink-1"
              }`}
            >
              {m === "components" ? t("modeComponents") : t("modeSimple")}
            </button>
          );
        })}
      </div>

      {/* Captura */}
      {mode === "components" ? (
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {KEYS.map((k) => (
            <label key={k} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-2 px-3.5 py-2.5">
              <span className="min-w-0">
                <span className="block text-copy text-ink-1">{t(`comp_${k}`)}</span>
                <span className="mt-0.5 block text-micro leading-snug text-ink-3">{t(`hint_${k}`)}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1 font-mono text-copy">
                <span className="text-ink-3">$</span>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={form[k]}
                  aria-label={t(`comp_${k}`)}
                  onChange={(e) => setField(k, e.target.value)}
                  className="w-24 rounded-md border border-line bg-surface px-2 py-1 text-right text-ink-1 outline-none focus:border-risk-sol"
                />
              </span>
            </label>
          ))}
        </div>
      ) : (
        <label className="mt-4 flex max-w-md items-center justify-between gap-3 rounded-lg border border-line bg-surface-2 px-3.5 py-3">
          <span className="text-copy text-ink-1">{t("simpleLabel")}</span>
          <span className="flex items-center gap-1 font-mono text-body">
            <span className="text-ink-3">$</span>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={simple}
              aria-label={t("simpleLabel")}
              onChange={(e) => setSimple(Math.max(0, Math.round(Number(e.target.value) || 0)))}
              className="w-32 rounded-md border border-line bg-surface px-2 py-1 text-right text-ink-1 outline-none focus:border-risk-sol"
            />
          </span>
        </label>
      )}

      <p className="mt-3 text-meta text-ink-3">{t("appliesNote")}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-4">
        <button
          type="button"
          onClick={save}
          disabled={mut.isPending || total <= 0}
          className="inline-flex items-center gap-1.5 rounded-lg bg-risk-sol px-4 py-2 text-copy font-medium text-white transition-colors hover:bg-risk-sol/90 disabled:opacity-60"
        >
          {mut.isPending ? t("saving") : mut.isSuccess ? <><Check className="h-4 w-4" /> {t("saved")}</> : t("save")}
        </button>
        <button
          type="button"
          onClick={() => { setForm(REF); setSimple(sumOf(REF)); }}
          className="inline-flex items-center gap-1.5 text-meta font-medium text-ink-2 transition-colors hover:text-risk-sol"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {t("useReference")}
        </button>
        {total <= 0 && <span className="text-meta text-risk-cri">{t("minTotal")}</span>}
        {mut.isError && <span className="text-meta text-risk-cri">{t("saveError")}</span>}
      </div>
    </Card>
  );
}
