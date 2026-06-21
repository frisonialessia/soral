// i18n/config.ts
// Configuración de locales — sin "server-only", para que también la importen
// componentes cliente (p. ej. el selector de idioma).
export const locales = ["en", "es", "it"] as const;
export type Locale = (typeof locales)[number];

// Inglés es el idioma principal del producto.
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  it: "Italiano",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}
