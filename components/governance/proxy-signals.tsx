// components/governance/proxy-signals.tsx
// Señales proxy: cada driver del modelo evaluado por si correlaciona con un
// atributo protegido. La idea de gobernanza es NO esconderlo (no borrar el driver):
// se etiqueta el riesgo, se nombra el posible proxy y se documenta cómo mitigarlo.
"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import type { ProxySignal } from "@/types";

const RISK_STYLE: Record<ProxySignal["risk"], string> = {
  high: "bg-[#FBE9ED] text-risk-cri",
  medium: "bg-[#FCEFF3] text-[#C2547A]",
  low: "bg-surface-bg text-ink-3",
};
const RISK_DOT: Record<ProxySignal["risk"], string> = { high: "#EB4F6C", medium: "#E59BB0", low: "#A9AEC2" };

export function ProxySignals({ proxies }: { proxies: ProxySignal[] }) {
  const t = useTranslations("governance");

  return (
    <Card className="overflow-hidden rounded-xl p-0">
      <ul>
        {proxies.map((p) => (
          <li key={p.factor} className="flex flex-col gap-2 border-b border-line px-5 py-4 last:border-0 sm:flex-row sm:items-start sm:gap-4">
            <div className="flex items-center gap-2.5 sm:w-[260px] sm:shrink-0">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-micro font-semibold ${RISK_STYLE[p.risk]}`}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: RISK_DOT[p.risk] }} />
                {t(`risk_${p.risk}`)}
              </span>
              <div className="min-w-0">
                <div className="truncate text-body font-medium text-ink-1">{p.factor}</div>
                <div className="text-meta text-ink-3">
                  {p.proxyFor === "none" ? (
                    t("cleanLabel")
                  ) : (
                    <>
                      {t("proxyForLabel")}: <span className="font-medium text-ink-2">{t(`proxy_${p.proxyFor}`)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <p className="min-w-0 flex-1 text-copy leading-relaxed text-ink-2">{t(`note_${p.proxyFor}`)}</p>
            <div className="shrink-0 text-meta text-ink-3 sm:w-[120px] sm:text-right">
              {p.weight}% · {t("modelWeight")}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
