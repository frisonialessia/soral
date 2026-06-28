// components/dashboard/getting-started.tsx
// Tarjeta de "Primeros pasos" para quien abre Soral por primera vez: dice en una
// línea qué hace la app y muestra un checklist de 2 pasos (configura tu planta,
// calcula tu costo de rotación) que llevan a /admin. Se oculta sola cuando ambos
// pasos están configurados, o si la persona la cierra (recordado en el navegador).
// Mientras carga el estado no se muestra, para no parpadear.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Check, ChevronRight, Compass, X } from "lucide-react";
import { useCostModel, usePlantProfile } from "@/lib/queries";
import { useCan } from "@/components/auth/can";

const DISMISS_KEY = "soral_onboarding_dismissed";

export function GettingStarted() {
  const t = useTranslations("onboarding");
  const plant = usePlantProfile();
  const cost = useCostModel();
  const canConfigure = useCan("admin.view");
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  // El "ocultar" se lee del navegador después de montar (evita desajuste de hidratación).
  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  // Solo quien puede configurar (admin) ve la guía de configuración.
  if (!canConfigure) return null;
  // Sin saber aún el estado local, o cargando los datos → no renderizar (sin parpadeo).
  if (dismissed === null || plant.isLoading || cost.isLoading) return null;
  if (dismissed) return null;
  if (plant.isError || cost.isError || !plant.data || !cost.data) return null;

  const plantDone = plant.data.configured;
  const costDone = cost.data.configured;
  // Ya configuró ambas cosas → no estorbar.
  if (plantDone && costDone) return null;

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // sin storage → solo se oculta en esta sesión
    }
    setDismissed(true);
  }

  const steps = [
    { done: plantDone, title: t("step1Title"), body: t("step1Body"), anchor: "plant-config" },
    { done: costDone, title: t("step2Title"), body: t("step2Body"), anchor: "cost-config" },
  ];
  // El CTA lleva al primer paso que falta (o a /admin si los dos están listos).
  const nextAnchor = steps.find((s) => !s.done)?.anchor ?? "plant-config";

  return (
    <div className="relative overflow-hidden rounded-xl border border-risk-sol/25 bg-gradient-to-br from-risk-sol-soft/70 via-surface to-surface p-5">
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("dismiss")}
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-surface-bg hover:text-ink-1"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="mb-1 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-risk-sol text-white">
          <Compass className="h-4 w-4" />
        </span>
        <span className="text-copy font-semibold text-ink-1">{t("title")}</span>
      </div>
      <p className="max-w-3xl pr-8 text-copy leading-relaxed text-ink-2">{t("intro")}</p>

      <ol className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {steps.map((s) => (
          <li key={s.anchor} className="flex items-start gap-3 rounded-xl border border-line bg-surface p-3.5">
            <span
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-micro font-semibold ${
                s.done ? "bg-risk-sol text-white" : "border border-line-2 bg-surface-bg text-ink-2"
              }`}
            >
              {s.done ? <Check className="h-3.5 w-3.5" /> : steps.indexOf(s) + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-body font-semibold text-ink-1">{s.title}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-micro font-medium ${
                    s.done ? "bg-risk-sol-soft text-risk-sol" : "bg-surface-bg text-ink-3"
                  }`}
                >
                  {s.done ? t("done") : t("pending")}
                </span>
              </span>
              <span className="mt-0.5 block text-meta text-ink-2">{s.body}</span>
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <Link
          href={`/admin#${nextAnchor}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-risk-sol px-4 py-2 text-copy font-medium text-white transition-colors hover:bg-risk-sol/90"
        >
          {t("cta")}
          <ChevronRight className="h-4 w-4" />
        </Link>
        <p className="min-w-0 flex-1 text-meta text-ink-3">{t("demoHint")}</p>
      </div>
    </div>
  );
}
