import { DEFAULT_LOCALE, type Locale } from "../i18n/locales.ts";
import { drawFlags } from "./flag.ts";
import { drawTeam } from "./team.ts";

export const aboutSections = ["people", "contact", "details", "media"] as const;

type AboutSection = (typeof aboutSections)[number];
export const sectionAnchor = (locale: Locale, section: AboutSection) =>
  locale === DEFAULT_LOCALE ? section : `${locale}-${section}`;

/** Use the same Markdown for a standalone page and its section in the desktop About view. */
export function pageHtml(
  page: { id: string; rendered?: { html: string } | undefined },
  locale: Locale,
  section?: AboutSection,
): string {
  if (!page.rendered) throw new Error(`${page.id} was not rendered`);
  const prefix = section ? `${locale}-${section}` : locale;
  let html = page.rendered.html
    .replace(/ id="([^"]+)"/g, ` id="${prefix}-$1"`)
    .replace(/ href="#([^"]+)"/g, ` href="#${prefix}-$1"`)
    .replace(/<a href="https:\/\//g, '<a target="_blank" rel="noopener noreferrer" href="https://');

  if (section) {
    // The section title is an h2, so its own subheadings start at h3.
    html = html.replace(/<(\/?)h([2-5])\b/g, (_, slash, level) => `<${slash}h${Number(level) + 1}`);
    for (const other of aboutSections) {
      html = html.replaceAll(`href="/about/${other}/"`, `href="#${sectionAnchor(locale, other)}"`);
    }
  }
  return drawTeam(drawFlags(html), locale);
}
