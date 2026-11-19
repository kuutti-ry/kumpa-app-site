import { DEFAULT_LOCALE, pathOf } from "../i18n/locales.ts";
import { routes } from "./routes.ts";

const ORIGIN = new URL(import.meta.env.SITE ?? "https://kumpa.fi");

export async function sitemapEntries(): Promise<{ loc: string; lastmod: string | undefined }[]> {
  return (await routes())
    .filter(({ props }) => !props.noindex)
    .map(({ props }) => ({
      loc: new URL(pathOf(DEFAULT_LOCALE, props.slug), ORIGIN).href,
      lastmod: props.lastmod,
    }));
}
