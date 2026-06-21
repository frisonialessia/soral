import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // El plugin de React transforma JSX/TSX en los tests de componentes.
  plugins: [react()],
  // Resuelve el alias "@/..." igual que tsconfig, para poder testear el
  // data-service y el motor de riesgo directamente.
  resolve: {
    alias: { "@": resolve(root) },
  },
  test: {
    // Node por defecto; los tests de componentes piden jsdom con el docblock
    // `// @vitest-environment jsdom` en su cabecera.
    environment: "node",
    include: ["lib/**/*.test.ts", "components/**/*.test.tsx"],
  },
});
