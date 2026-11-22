import { byLocale, DEFAULT_LOCALE, LOCALES, type Locale } from "../i18n/locales.ts";
import { t } from "../i18n/ui.ts";
import { EARLIER } from "./consent.ts";
import { allLegal, allPages, legalShelf, type Page, placeOf, writtenIn } from "./content.ts";

type PageInfo = { title: string; description: string };

export type RouteProps = {
  slug: string;
  head: Record<Locale, PageInfo>;
  pages?: Record<Locale, Page>;
  noindex?: boolean;
  lastmod?: string;
};

export async function routes() {
  const pages = await allPages();
  const texts = await allLegal();
  const result: RouteProps[] = [];
  for (const page of pages.filter((entry) => placeOf(entry.id).locale === DEFAULT_LOCALE)) {
    const { slug } = placeOf(page.id);
    const versions = byLocale((locale) => {
      const version = pages.find((entry) => entry.id === `${locale}/${slug}`);
      if (!version) throw new Error(`Missing page: ${locale}/${slug}`);
      return version;
    });
    result.push({
      slug: slug === "home" ? "" : slug,
      head: byLocale((locale) => versions[locale].data),
      pages: versions,
    });
  }

  for (const name of ["legal", "earlier"] as const) {
    const info = (locale: Locale) => ({
      title: t(locale, `${name}.title`),
      description: t(locale, `${name}.description`),
    });
    result.push({
      slug: name === "legal" ? name : EARLIER,
      head: byLocale(info),
      noindex: name === "earlier",
    });
  }
  const shelves = await Promise.all(LOCALES.map((locale) => legalShelf(locale)));
  for (const slug of new Set(texts.map((entry) => writtenIn(entry.id).slug))) {
    const versions = texts.filter((entry) => writtenIn(entry.id).slug === slug);
    // A newly proposed draft may have no binding version yet.
    const original = versions.find((entry) => entry.data.binding) ?? versions[0];
    if (!original) throw new Error(`Missing legal text: ${slug}`);
    // A language the text is not written in names it as its shelf does.
    const info = (locale: Locale) => {
      const item = shelves[LOCALES.indexOf(locale)]?.find((entry) => entry.slug === slug);
      if (!item) throw new Error(`Missing legal text: ${locale}/${slug}`);
      return { title: item.title, description: item.description };
    };
    result.push({
      slug: `legal/${slug}`,
      head: byLocale(info),
      noindex: original.data.status === "draft",
      lastmod: original.data.dated.toISOString().slice(0, 10),
    });
  }
  return result.map((props) => ({ params: { path: props.slug || undefined }, props }));
}
