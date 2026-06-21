// i18n/request.ts
// Resuelve el locale por request leyendo la cookie `locale` (preferencia de
// usuario). TODO(supabase): tomar el locale del perfil del usuario autenticado.
import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { defaultLocale, isLocale } from "./config";

export default getRequestConfig(async () => {
  const store = await cookies();
  const cookieLocale = store.get("locale")?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
