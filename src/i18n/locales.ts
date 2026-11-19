export const LOCALES = ["fi", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fi";
export const isLocale = (value: string): value is Locale =>
  (LOCALES as readonly string[]).includes(value);

/** Both languages share a permanent URL, including the app's consent links. */
export function pathOf(_locale: Locale, slug: string): string {
  return slug ? `/${slug}/` : "/";
}

export const TEXT_LANGUAGES = ["fi", "sv", "en"] as const;
export type TextLanguage = (typeof TEXT_LANGUAGES)[number];
export const isTextLanguage = (value: string): value is TextLanguage =>
  (TEXT_LANGUAGES as readonly string[]).includes(value);
