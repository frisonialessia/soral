// components/integrations/connector-modal.tsx
// Detalle de un conector: estado, frecuencia, última sync, mapeo de campos y
// "sincronizar ahora" (mutación mock). Reusa el Dialog con focus-trap.
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslations, useFormatter } from "next-intl";
import { RefreshCw, Check } from "lucide-react";
import { Dialog, DialogClose } from "@/components/ui/dialog";
import { useSyncConnector } from "@/lib/queries";
import { STATUS_COLOR, CAT_ICON } from "./util";
import type { IntegrationConnector } from "@/types";

export function ConnectorModal({
  connector,
  onClose,
}: {
  connector: IntegrationConnector | null;
  onClose: () => void;
}) {
  const t = useTranslations("integrations");
  const format = useFormatter();
  const sync = useSyncConnector();
  const [justSynced, setJustSynced] = useState(false);

  useEffect(() => {
    if (connector) {
      setJustSynced(false);
      sync.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connector]);

  if (!connector) return null;
  const c = connector;
  const color = STATUS_COLOR[c.status];
  const Icon = CAT_ICON[c.category];
  const rel =
    c.lastSyncMin == null ? t("neverSynced") : format.relativeTime(new Date(Date.now() - c.lastSyncMin * 60000));

  return (
    <Dialog open={!!connector} onClose={onClose} label={c.name}>
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-bg text-ink-2">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <div className="text-subhead font-semibold text-ink-1">{c.name}</div>
            <div className="text-meta text-ink-3">{t(`cat_${c.category}`)}</div>
          </div>
        </div>
        <DialogClose onClose={onClose} />
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        <Meta
          label={t("statusLabel")}
          value={
            <span className="inline-flex items-center gap-1.5" style={{ color }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
              {t(`status_${c.status}`)}
            </span>
          }
        />
        <Meta label={t("frequency")} value={t(`freq_${c.frequency}`)} />
        <Meta label={t("lastSync")} value={justSynced ? t("syncedNow") : rel} />
      </div>

      <div className="mt-4">
        <div className="mb-2 text-micro font-semibold uppercase tracking-wide text-ink-3">{t("fieldMapping")}</div>
        {c.fields.length === 0 ? (
          <p className="text-copy text-ink-3">{t("noFields")}</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-line">
            <div className="grid grid-cols-2 bg-surface-2 px-3 py-1.5 text-micro font-semibold uppercase tracking-wide text-ink-3">
              <span>{t("source")}</span>
              <span>{t("target")}</span>
            </div>
            {c.fields.map((f) => (
              <div key={f.source} className="grid grid-cols-2 items-center border-t border-line px-3 py-2 text-copy">
                <span className="font-mono text-ink-2">{f.source}</span>
                <span className="font-mono text-ink-1">→ {f.target}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={() => sync.mutate(c.id, { onSuccess: () => setJustSynced(true) })}
          disabled={sync.isPending || c.status === "disconnected"}
          className="inline-flex items-center gap-1.5 rounded-lg bg-risk-sol px-4 py-2 text-copy font-medium text-white transition-opacity disabled:opacity-40"
        >
          {justSynced ? (
            <>
              <Check className="h-4 w-4" />
              {t("syncedNow")}
            </>
          ) : sync.isPending ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              {t("syncing")}
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              {t("syncNow")}
            </>
          )}
        </button>
      </div>
    </Dialog>
  );
}

function Meta({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-surface-2 px-3 py-2">
      <div className="text-micro uppercase tracking-wide text-ink-3">{label}</div>
      <div className="mt-0.5 text-copy font-medium text-ink-1">{value}</div>
    </div>
  );
}
