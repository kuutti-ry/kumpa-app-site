import type { Locale } from "../i18n/locales.ts";
import { t } from "../i18n/ui.ts";
import { EARLIER } from "./consent.ts";
import { allLegal, allPages, type Page, placeOf, writtenIn } from "./content.ts";

type PageInfo = { title: string; description: string };

export type RouteProps = {
  slug: string;
  head: Record<Locale, PageInfo>;
  pages?: Record<Locale, Page>;
  noindex?: boolean;
  lastmod?: string;
};

export const aboutSections = ["people", "contact", "details", "media"] as const;

export async function routes() {
  const pages = await allPages();
  const texts = await allLegal();
  const result: RouteProps[] = [];
  for (const page of pages.filter((entry) => placeOf(entry.id).locale === "fi")) {
    const { slug } = placeOf(page.id);
    const english = pages.find((entry) => entry.id === `en/${slug}`);
    if (!english) throw new Error(`Missing English page: ${slug}`);
    result.push({
      slug: slug === "home" ? "" : slug,
      head: { fi: page.data, en: english.data },
      pages: { fi: page, en: english },
    });
  }

  for (const name of ["legal", "earlier"] as const) {
    const info = (locale: Locale) => ({
      title: t(locale, `${name}.title`),
      description: t(locale, `${name}.description`),
    });
    result.push({
      slug: name === "legal" ? name : EARLIER,
      head: { fi: info("fi"), en: info("en") },
      noindex: name === "earlier",
    });
  }
  for (const slug of new Set(texts.map((entry) => writtenIn(entry.id).slug))) {
    const versions = texts.filter((entry) => writtenIn(entry.id).slug === slug);
    // A newly proposed draft may have no binding version yet.
    const original = versions.find((entry) => entry.data.binding) ?? versions[0];
    if (!original) throw new Error(`Missing legal text: ${slug}`);
    const info = (locale: Locale) => {
      const version = versions.find((entry) => entry.id === `${locale}/${slug}`);
      if (!version) throw new Error(`Missing legal text: ${locale}/${slug}`);
      return { title: version.data.title, description: version.data.description };
    };
    result.push({
      slug: `legal/${slug}`,
      head: { fi: info("fi"), en: info("en") },
      noindex: original.data.status === "draft",
      lastmod: original.data.dated.toISOString().slice(0, 10),
    });
  }
  return result.map((props) => ({ params: { path: props.slug || undefined }, props }));
}
