// components/employee/timeline.tsx
// Expediente 360: la línea de tiempo del trabajador. Cose la señal del modelo
// (señal → alerta) con las intervenciones REALES y su resultado (loop de
// resultados). Es la columna vertebral del expediente: todo cuelga del trabajador.
"use client";

import { useTranslations, useFormatter } from "next-intl";
import { Activity, TriangleAlert, ClipboardCheck, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { useEmployeeTimeline } from "@/lib/queries";
import { Card } from "@/components/ui/card";
import type { TimelineEvent } from "@/types";

const META: Record<TimelineEvent["kind"], { color: string; Icon: typeof Activity }> = {
  signal: { color: "#E59BB0", Icon: Activity },
  alert: { color: "#EB4F6C", Icon: TriangleAlert },
  intervention: { color: "#5B6EF5", Icon: ClipboardCheck },
  outcome: { color: "#8476FF", Icon: CheckCircle2 },
};

export function Timeline({ refId }: { refId: string }) {
  const t = useTranslations("employee");
  const f = useFormatter();
  const { data, isLoading } = useEmployeeTimeline(refId);

  return (
    <Card className="mb-[18px] px-[22px] py-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-[14px] font-semibold">{t("timelineTitle")}</h3>
          <p className="mt-0.5 text-[12px] text-ink-3">{t("timelineSub")}</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-risk-sol-soft px-2.5 py-1 text-[10.5px] font-medium text-risk-sol">
          <ShieldCheck className="h-3 w-3" />
          {t("piiBadge")}
        </span>
      </div>

      {isLoading && <p className="py-6 text-[13px] text-ink-3">{t("loading")}</p>}

      {data && data.events.length > 0 && (
        <ol className="mt-4">
          {data.events.map((e, i) => {
            const m = META[e.kind];
            const Icon = e.kind === "outcome" && e.outcome === "left" ? XCircle : m.Icon;
            const color = e.kind === "outcome" && e.outcome === "left" ? "#EB4F6C" : m.color;
            const last = i === data.events.length - 1;
            return (
              <li key={e.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                    style={{ background: `${color}1a`, color }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {!last && <span className="my-1 w-px flex-1 bg-line" />}
                </div>
                <div className={last ? "pb-1" : "pb-5"}>
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide"
                      style={{ color, background: `${color}14` }}
                    >
                      {t(`tag_${e.kind}`)}
                    </span>
                    <span className="text-[11px] text-ink-3">
                      {f.dateTime(new Date(e.at), { dateStyle: "medium" })}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-snug text-ink-1">{label(e, t)}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <p className="mt-2 text-[11px] leading-relaxed text-ink-3">{t("piiNote")}</p>
    </Card>
  );
}

function label(e: TimelineEvent, t: (k: string, v?: Record<string, string | number>) => string): string {
  switch (e.kind) {
    case "signal":
      return t("tlSignal", { driver: e.driver ?? "—" });
    case "alert":
      return t("tlAlert", { score: e.score ?? 0 });
    case "intervention":
      return `${t("tlIntervention", { play: e.play ?? "—" })} · ${t("tlBy", { by: e.by ?? "—" })}`;
    case "outcome":
      return e.outcome === "left" ? t("tlOutcomeLeft") : t("tlOutcomeRetained");
  }
}
