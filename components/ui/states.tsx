// components/ui/states.tsx
// Estados compartidos de carga y error para las vistas que consumen datos.
// Centralizados a propósito: antes cada vista hacía `if (isLoading || !data)`,
// lo que dejaba un spinner infinito si el fetch fallaba. Aquí el error SIEMPRE
// tiene salida (reintentar).
"use client";

import { Card } from "@/components/ui/card";

export function LoadingState({ label = "Cargando…" }: { label?: string }) {
  return (
    <div
      className="flex items-center justify-center gap-2.5 py-20 text-sm text-ink-3"
      role="status"
      aria-live="polite"
    >
      <span
        className="h-4 w-4 animate-spin rounded-full border-2 border-line-2 border-t-risk-sol"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({
  title = "No pudimos cargar los datos",
  detail,
  onRetry,
  retrying = false,
}: {
  title?: string;
  detail?: string;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  return (
    <Card
      className="my-8 flex flex-col items-center gap-3 px-6 py-12 text-center"
      role="alert"
    >
      <span
        className="flex h-11 w-11 items-center justify-center rounded-full bg-risk-cri/10 text-[22px] font-bold text-risk-cri"
        aria-hidden="true"
      >
        !
      </span>
      <div>
        <p className="text-[15px] font-semibold text-ink-1">{title}</p>
        {detail && <p className="mt-1 text-[13px] text-ink-2">{detail}</p>}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          disabled={retrying}
          className="mt-1 rounded-lg border border-line-2 px-4 py-2 text-[13px] font-medium text-ink-1 transition-colors hover:border-risk-sol hover:text-risk-sol disabled:opacity-50"
        >
          {retrying ? "Reintentando…" : "Reintentar"}
        </button>
      )}
    </Card>
  );
}
