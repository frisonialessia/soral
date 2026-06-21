import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Resuelve el alias "@/..." igual que tsconfig, para poder testear el
  // data-service y el motor de riesgo directamente.
  resolve: {
    alias: { "@": resolve(root) },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
