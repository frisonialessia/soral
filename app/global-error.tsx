// app/global-error.tsx
// Última red de seguridad: captura errores en el propio RootLayout. Reemplaza
// todo el árbol (incluido <html>/<body>), por eso usa estilos inline y NO puede
// depender del CSS de la app ni del provider de next-intl. Por eso traduce con
// un diccionario inline que lee la cookie `locale`.
"use client";

import { useEffect } from "react";

const MESSAGES = {
  en: {
    title: "Soral failed to load",
    detail: "A critical error occurred while starting the app.",
    reload: "Reload",
  },
  es: {
    title: "Soral no pudo cargar",
    detail: "Ocurrió un error crítico al iniciar la aplicación.",
    reload: "Recargar",
  },
  it: {
    title: "Soral non si è caricato",
    detail: "Si è verificato un errore critico all'avvio dell'app.",
    reload: "Ricarica",
  },
} as const;

function readLocale(): keyof typeof MESSAGES {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|; )locale=([^;]+)/);
  const loc = match?.[1];
  return loc === "es" || loc === "it" ? loc : "en";
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[soral] error crítico:", error);
  }, [error]);

  const locale = readLocale();
  const t = MESSAGES[locale];

  return (
    <html lang={locale}>
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#F3F6FD",
          color: "#2B2D42",
        }}
      >
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: 24,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 600 }}>{t.title}</div>
          <p style={{ fontSize: 14, color: "#6B7088", maxWidth: 360, margin: 0 }}>{t.detail}</p>
          <button
            onClick={() => reset()}
            style={{
              border: "1px solid #DADEEC",
              borderRadius: 9,
              padding: "8px 16px",
              fontSize: 14,
              cursor: "pointer",
              background: "#fff",
              color: "#2B2D42",
            }}
          >
            {t.reload}
          </button>
        </div>
      </body>
    </html>
  );
}
