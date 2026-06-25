// components/admin/plant-profile-section.tsx
// Perfil de la planta: nombre y headcount. El headcount dimensiona la población
// sintética, así que el dashboard cuenta sobre tantos trabajadores como dice aquí
// (no "1,180 detrás de 10 registros"). Guardar redimensiona y recalcula.
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Building2, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/ui/states";
import { usePlantProfile, useUpdatePlantProfile } from "@/lib/queries";
import type { PlantProfile } from "@/types";

export function PlantProfileSection() {
  const t = useTranslations("plant");
  const tc = useTranslations("common");
  const { data, isLoading, isError, refetch, isFetching } = usePlantProfile();

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
  return <Form profile={data} />;
}

function Form({ profile }: { profile: PlantProfile }) {
  const t = useTranslations("plant");
  const mut = useUpdatePlantProfile();
  const [name, setName] = useState(profile.name);
  const [headcount, setHeadcount] = useState(profile.headcount);
  const [lines, setLines] = useState(profile.lines.join(", "));
  const [shifts, setShifts] = useState(profile.shifts.join(", "));

  const parseList = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

  function save() {
    const ls = parseList(lines);
    const ss = parseList(shifts);
    mut.mutate({
      name: name.trim() || profile.name,
      headcount: Math.max(10, Math.round(headcount || 0)),
      lines: ls.length ? ls : profile.lines,
      shifts: ss.length ? ss : profile.shifts,
    });
  }

  return (
    <Card className="mt-6 rounded-xl p-[22px]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-risk-sol-soft text-risk-sol">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-subhead font-semibold tracking-tight">{t("title")}</h2>
            <p className="mt-0.5 max-w-xl text-copy text-ink-2">{t("subtitle")}</p>
          </div>
        </div>
        {profile.configured ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-risk-sol-soft px-2 py-0.5 text-micro font-medium text-risk-sol">
            <Check className="h-3 w-3" /> {t("configured")}
          </span>
        ) : (
          <span className="rounded-full bg-surface-bg px-2 py-0.5 text-micro font-medium text-ink-3">{t("demoValues")}</span>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-meta text-ink-2">{t("nameLabel")}</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-copy text-ink-1 outline-none focus:border-risk-sol"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-meta text-ink-2">{t("headcountLabel")}</span>
          <input
            type="number"
            min={10}
            inputMode="numeric"
            value={headcount}
            onChange={(e) => setHeadcount(Math.max(0, Math.round(Number(e.target.value) || 0)))}
            className="rounded-lg border border-line bg-surface px-3 py-2 font-mono text-copy text-ink-1 outline-none focus:border-risk-sol"
          />
        </label>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-meta text-ink-2">{t("linesLabel")}</span>
          <input
            type="text"
            value={lines}
            onChange={(e) => setLines(e.target.value)}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-copy text-ink-1 outline-none focus:border-risk-sol"
          />
          <span className="text-micro text-ink-3">{t("listHint")}</span>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-meta text-ink-2">{t("shiftsLabel")}</span>
          <input
            type="text"
            value={shifts}
            onChange={(e) => setShifts(e.target.value)}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-copy text-ink-1 outline-none focus:border-risk-sol"
          />
          <span className="text-micro text-ink-3">{t("listHint")}</span>
        </label>
      </div>

      <p className="mt-3 text-meta text-ink-3">{t("appliesNote")}</p>

      <div className="mt-4 border-t border-line pt-4">
        <button
          type="button"
          onClick={save}
          disabled={mut.isPending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-risk-sol px-4 py-2 text-copy font-medium text-white transition-colors hover:bg-risk-sol/90 disabled:opacity-60"
        >
          {mut.isPending ? t("saving") : mut.isSuccess ? <><Check className="h-4 w-4" /> {t("saved")}</> : t("save")}
        </button>
        {mut.isError && <span className="ml-3 text-meta text-risk-cri">{t("saveError")}</span>}
      </div>
    </Card>
  );
}
