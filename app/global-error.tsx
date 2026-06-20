// app/global-error.tsx
// Última red de seguridad: captura errores en el propio RootLayout. Reemplaza
// todo el árbol (incluido <html>/<body>), por eso usa estilos inline y no puede
// depender del CSS de la app.
"use client";

import { useEffect } from "react";

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

  return (
    <html lang="es">
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
          <div style={{ fontSize: 18, fontWeight: 600 }}>Soral no pudo cargar</div>
          <p style={{ fontSize: 14, color: "#6B7088", maxWidth: 360, margin: 0 }}>
            Ocurrió un error crítico al iniciar la aplicación.
          </p>
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
            Recargar
          </button>
        </div>
      </body>
    </html>
  );
}
