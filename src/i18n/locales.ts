export const LOCALES = ["fi", "sv", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fi";
/**
 * Built into every page and offered to nobody (docs/decisions.md, 40): its
 * radio is hidden, and the style sheet hides its label and its text unless it
 * is selected. Only a link that asks for it selects it: one ending in its
 * code ("#sv"), which the tab then keeps, or one to an anchor in its text.
 */
export const HIDDEN_LOCALES: ReadonlySet<Locale> = new Set(["sv"]);
export const isLocale = (value: string): value is Locale =>
  (LOCALES as readonly string[]).includes(value);

/** One value for each language of the site. */
export const byLocale = <T>(make: (locale: Locale) => T): Record<Locale, T> =>
  Object.fromEntries(LOCALES.map((locale) => [locale, make(locale)])) as Record<Locale, T>;

/** Every language shares a permanent URL, including the app's consent links. */
export function pathOf(_locale: Locale, slug: string): string {
  return slug ? `/${slug}/` : "/";
}

export const TEXT_LANGUAGES = ["fi", "sv", "en"] as const;
export type TextLanguage = (typeof TEXT_LANGUAGES)[number];
export const isTextLanguage = (value: string): value is TextLanguage =>
  (TEXT_LANGUAGES as readonly string[]).includes(value);
