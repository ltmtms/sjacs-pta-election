import { cookies } from "next/headers";
import type { Locale } from "./i18n";
import { DEFAULT_LOCALE, parseLocale } from "./i18n";

export async function resolveLocale(searchLang?: string | null): Promise<Locale> {
  if (searchLang) {
    return parseLocale(searchLang);
  }
  const jar = await cookies();
  const fromCookie = jar.get("sjacs_locale")?.value;
  return parseLocale(fromCookie);
}

export { DEFAULT_LOCALE };
