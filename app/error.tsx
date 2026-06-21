// app/error.tsx
// Error boundary del segmento: captura errores de render (no los de fetch, que
// React Query maneja con isError en cada vista). El shell (barra lateral +
// cabecera) sigue montado, así que el usuario conserva la navegación.
"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/states";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // En producción: enviar a observabilidad (Sentry, etc.).
    console.error("[soral] error de ruta:", error);
  }, [error]);

  return (
    <div className="animate-fade">
      <ErrorState
        title="Algo salió mal en esta vista"
        detail="Ocurrió un error inesperado. Puedes reintentar."
        onRetry={reset}
      />
    </div>
  );
}
