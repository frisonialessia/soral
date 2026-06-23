// app/(app)/voz-del-empleado/page.tsx
// Voz del empleado: escucha con IA de encuestas, entrevistas de salida y tickets.
// Convierte texto libre en temas, sentimiento y alertas tempranas por línea — la
// señal "blanda" que alimenta el modelo de retención. Las citas se muestran en su
// idioma original (dato crudo); la interfaz se localiza.
"use client";

import { useTranslations } from "next-intl";
import { Sparkles, TriangleAlert, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useVoiceSummary, useVoiceDigest } from "@/lib/queries";
import { Card } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/ui/states";
import type { VoiceTheme, Verbatim, VoiceChannel } from "@/types";

// Sentimiento −100..100 → color (rojo negativo, azul positivo).
const sentColor = (s: number) =>
  s <= -20 ? "#EB4F6C" : s < 0 ? "#E59BB0" : s === 0 ? "#A9AEC2" : s < 20 ? "#8476FF" : "#5B6EF5";

export default function VoicePage() {
  const t = useTranslations("voice");
  const tc = useTranslations("common");
  const { data, isLoading, isError, refetch, isFetching } = useVoiceSummary();
  const digest = useVoiceDigest();

  if (isLoading) return <LoadingState label={t("loading")} />;
  if (isError || !data) {
    return <ErrorState title={t("errorTitle")} detail={tc("checkConnection")} onRetry={() => refetch()} retrying={isFetching} />;
  }

  return (
    <div className="animate-fade pb-12">
      <div className="py-5">
        <h1 className="text-[27px] font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-ink-2">{t("subtitle")}</p>
      </div>

      {/* Overview + lectura ejecutiva (IA) */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1.6fr]">
        <Card className="rounded-xl p-[20px]">
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat label={t("overallSentiment")} value={fmtSent(data.overallSentiment)} color={sentColor(data.overallSentiment)} />
            <Stat label={t("responseRate")} value={`${data.responseRate}%`} />
            <Stat label={t("responses")} value={String(data.responses)} />
          </div>
          <div className="mt-4">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-3">{t("byLineTitle")}</div>
            <div className="flex flex-wrap gap-1.5">
              {data.byLine.map((l) => (
                <span
                  key={l.line}
                  className="rounded-md px-2 py-1 font-mono text-[11px] font-semibold"
                  style={{ color: sentColor(l.sentiment), background: `${sentColor(l.sentiment)}1a` }}
                  title={`${l.line}: ${fmtSent(l.sentiment)}`}
                >
                  {l.line} {fmtSent(l.sentiment)}
                </span>
              ))}
            </div>
          </div>
        </Card>

        <Card className="rounded-xl p-[20px]">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-risk-sol" />
            <h3 className="text-[14px] font-semibold">{t("execTitle")}</h3>
          </div>
          {digest.isLoading && <p className="py-4 text-[13px] text-ink-3">{tc("loading")}</p>}
          {digest.data && (
            <>
              <p className="text-[15px] font-semibold text-ink-1">{digest.data.headline}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{digest.data.summary}</p>
              <ul className="mt-2.5 space-y-1.5">
                {digest.data.points.map((p, i) => (
                  <li key={i} className="flex gap-2 text-[12.5px] text-ink-1">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-risk-sol" />
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-[11px] text-ink-3">
                {digest.data.source === "llm" ? t("sourceLlm") : t("sourceRules")}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Alertas tempranas */}
      {data.alerts.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.alerts.map((a) => {
            const c = a.severity === "high" ? "#EB4F6C" : "#E59BB0";
            return (
              <div key={a.id} className="flex items-start gap-2.5 rounded-xl border px-3.5 py-3" style={{ borderColor: `${c}40`, background: `${c}0d` }}>
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" style={{ color: c }} />
                <div>
                  <div className="text-[12.5px] font-semibold text-ink-1">
                    {t(`theme_${a.theme}`)} · {a.line}
                  </div>
                  <p className="mt-0.5 text-[12px] leading-snug text-ink-2">
                    {t("alertMsg", { theme: t(`theme_${a.theme}`), line: a.line })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        {/* Temas */}
        <Card className="rounded-xl p-[20px]">
          <h3 className="text-[14px] font-semibold">{t("themesTitle")}</h3>
          <p className="mt-0.5 text-[12px] text-ink-3">{t("themesSub")}</p>
          <div className="mt-4 space-y-3">
            {data.themes.map((th) => (
              <ThemeRow key={th.id} theme={th} label={t(`theme_${th.id}`)} mentionsLabel={t("mentions")} />
            ))}
          </div>
        </Card>

        {/* Verbatims */}
        <Card className="rounded-xl p-[20px]">
          <h3 className="text-[14px] font-semibold">{t("verbatimsTitle")}</h3>
          <p className="mt-0.5 text-[12px] text-ink-3">{t("verbatimsSub")}</p>
          <div className="mt-3 space-y-2.5">
            {data.verbatims.map((v) => (
              <VerbatimCard key={v.id} v={v} channelLabel={t(`channel_${v.channel}`)} themeLabel={t(`theme_${v.theme}`)} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function fmtSent(s: number) {
  return s > 0 ? `+${s}` : String(s);
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div className="font-mono text-[22px] font-bold leading-tight" style={{ color: color ?? "#2B2D42" }}>
        {value}
      </div>
      <div className="mt-0.5 text-[10.5px] leading-tight text-ink-3">{label}</div>
    </div>
  );
}

function ThemeRow({ theme, label, mentionsLabel }: { theme: VoiceTheme; label: string; mentionsLabel: string }) {
  const c = sentColor(theme.sentiment);
  const up = theme.delta >= 0;
  // barra divergente desde el centro
  const half = Math.min(50, (Math.abs(theme.sentiment) / 100) * 100);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[12.5px]">
        <span className="font-medium text-ink-1">{label}</span>
        <span className="flex items-center gap-2">
          <span className="text-[11px] text-ink-3">{theme.mentions} {mentionsLabel}</span>
          <Sparkline data={theme.trend} color={c} />
          <span className="flex items-center font-mono text-[11px]" style={{ color: up ? "#5B6EF5" : "#EB4F6C" }}>
            {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(theme.delta)}
          </span>
          <span className="w-9 text-right font-mono text-[12px] font-bold" style={{ color: c }}>{fmtSent(theme.sentiment)}</span>
        </span>
      </div>
      <div className="relative h-2 rounded bg-surface-bg">
        <div className="absolute inset-y-0 left-1/2 w-px bg-line" />
        <div
          className="absolute inset-y-0 rounded"
          style={{ background: c, left: theme.sentiment < 0 ? `${50 - half}%` : "50%", width: `${half}%` }}
        />
      </div>
    </div>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const W = 46, H = 14;
  const min = Math.min(...data), max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / span) * H}`).join(" ");
  return (
    <svg width={W} height={H} className="shrink-0" aria-hidden="true">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.4} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function VerbatimCard({ v, channelLabel, themeLabel }: { v: Verbatim; channelLabel: string; themeLabel: string }) {
  const c = sentColor(v.sentiment);
  return (
    <div className="rounded-lg border-l-2 bg-surface-bg/50 py-2 pl-3 pr-2.5" style={{ borderColor: c }}>
      <p className="text-[12.5px] leading-snug text-ink-1">“{v.text}”</p>
      <div className="mt-1.5 flex items-center gap-2 text-[10.5px] text-ink-3">
        <ChannelBadge channel={v.channel} label={channelLabel} />
        <span>· {v.line} · {themeLabel}</span>
      </div>
    </div>
  );
}

function ChannelBadge({ channel, label }: { channel: VoiceChannel; label: string }) {
  const bg: Record<VoiceChannel, string> = { survey: "#5B6EF5", exit: "#EB4F6C", ticket: "#8476FF" };
  return (
    <span className="rounded px-1.5 py-0.5 font-semibold" style={{ color: bg[channel], background: `${bg[channel]}1a` }}>
      {label}
    </span>
  );
}
