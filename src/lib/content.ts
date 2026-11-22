import { type CollectionEntry, getCollection } from "astro:content";
import { isLocale, isTextLanguage, type Locale, type TextLanguage } from "../i18n/locales.ts";
import {
  byLanguage,
  CONSENT_KINDS,
  type ConsentKind,
  countedWording,
  isConsentKind,
  TEXT_OF,
  type Wording,
} from "./consent.ts";

export type Page = CollectionEntry<"pages">;
export type LegalText = CollectionEntry<"legal">;

/** "fi/about" is the page "about" in Finnish: the folder is the language, the file the slug. */
export function placeOf(id: string): { locale: Locale; slug: string } {
  const [locale, ...segments] = id.split("/");
  const slug = segments.join("/");
  if (!locale || !slug || !isLocale(locale)) {
    throw new Error(`content "${id}" is not at <language>/<slug>.md`);
  }
  return { locale, slug };
}

export const LEGAL = "legal";

/** "fi/bylaws" is the text "bylaws" as written in Finnish, whether or not the site speaks Finnish. */
export function writtenIn(id: string): { language: TextLanguage; slug: string } {
  const [language, slug, ...rest] = id.split("/");
  if (!language || !slug || rest.length > 0 || !isTextLanguage(language)) {
    throw new Error(`legal text "${id}" is not at <language>/<slug>.md`);
  }
  return { language, slug };
}

export async function allPages(): Promise<Page[]> {
  return getCollection("pages");
}

export async function allLegal(): Promise<LegalText[]> {
  const texts = await getCollection("legal");
  return texts.sort((a, b) => a.data.order - b.data.order);
}

/**
 * Every current legal text in the shelf's reading order, named in the
 * reader's language: by its version in that language, or, while it has none
 * (no legal text is translated by machine into a language it was not written
 * in), by the name a version gives it there (`listing`). `written` says which,
 * and `original` is the language of the version that counts.
 */
export async function legalShelf(locale: Locale) {
  const texts = await allLegal();
  return [...new Set(texts.map((text) => writtenIn(text.id).slug))].map((slug) => {
    const versions = texts.filter((text) => writtenIn(text.id).slug === slug);
    // A newly proposed draft may have no binding version yet.
    const original = versions.find((text) => text.data.binding) ?? versions[0];
    const own = versions.find((text) => writtenIn(text.id).language === locale);
    const listed = versions.map((text) => text.data.listing?.[locale]).find(Boolean);
    const name = own?.data ?? listed;
    if (!original || !name) throw new Error(`legal text "${slug}" has no name in ${locale}`);
    return {
      slug,
      title: name.title,
      description: name.description,
      status: (own ?? original).data.status,
      written: own !== undefined,
      original: writtenIn(original.id).language,
    };
  });
}

const bodyOf = (entry: { id: string; body?: string }): string => {
  if (entry.body === undefined) throw new Error(`${entry.id} has no body`);
  return entry.body;
};

/**
 * Every text a person agrees to in the app, in each language it is written
 * in, with its version: the terms and the privacy policy, and the consents
 * the privacy page carries (src/lib/consent.ts).
 */
export async function wordings(): Promise<Wording[]> {
  const texts = (await allLegal()).flatMap((text): Wording[] => {
    const { language, slug } = writtenIn(text.id);
    if (!isConsentKind(slug)) return [];
    const { consent_version: version, dated, title, status, binding } = text.data;
    const standing = { status, binding };
    return [{ kind: slug, language, version, dated, title, standing, body: bodyOf(text) }];
  });
  const consents = (await getCollection("consents")).flatMap((entry): Wording[] => {
    const { language, slug } = writtenIn(entry.id);
    if (!isConsentKind(slug)) throw new Error(`consent "${entry.id}" is not a kind of the app's`);
    const { consent_version: version, dated, title, binding } = entry.data;
    const binds = binding ? { binds: true } : {};
    return [{ kind: slug, language, version, dated, title, ...binds, body: bodyOf(entry) }];
  });
  return [...texts, ...consents];
}

/** One kept earlier version (src/content/earlier), as the page shows it and the build checks it. */
export type EarlierText = Wording & { version: string; html: string };

/** "en/privacy/2026-09-draft-1": the language, the kind and the version of a kept text. */
function keptAt(id: string): { language: TextLanguage; kind: ConsentKind; version: string } {
  const [language, kind, version, ...rest] = id.split("/");
  if (!language || !kind || !version || rest.length > 0 || !isTextLanguage(language)) {
    throw new Error(`kept text "${id}" is not at <language>/<kind>/<version>.md`);
  }
  if (!isConsentKind(kind)) throw new Error(`kept text "${id}" is not of a kind of the app's`);
  return { language, kind, version };
}

/**
 * Every kept earlier version of the texts a person agrees to (docs/decisions.md,
 * 14), newest first and a version's Finnish first, each with its rendered text.
 * The file's name is its version, and its own consent_version says the same.
 */
export async function earlierTexts(): Promise<EarlierText[]> {
  const entries = await getCollection("earlier");
  return byLanguage(
    entries.map((entry): EarlierText => {
      const { language, kind, version } = keptAt(entry.id);
      const { consent_version, dated, title, status, binding } = entry.data;
      if (consent_version !== version) {
        throw new Error(`kept text "${entry.id}" says it is ${consent_version}`);
      }
      if (entry.rendered === undefined) throw new Error(`${entry.id} was not rendered`);
      // A legal text's standing is part of what its row pins; a kept consent
      // only says whether its wording was the one that counted.
      const counted =
        status !== undefined && binding !== undefined
          ? { standing: { status, binding } }
          : binding
            ? { binds: true }
            : {};
      return {
        kind,
        language,
        version,
        dated,
        title,
        ...counted,
        body: bodyOf(entry),
        html: entry.rendered.html,
      };
    }),
  ).sort((a, b) => b.dated.getTime() - a.dated.getTime());
}

/**
 * The consents a legal text carries besides its own (the sensitive answers,
 * on the privacy page), each in every language it is written in, the wording
 * that counts first (`countedWording`), with its version and the day of its
 * wording.
 * The title is the reader's language's where the wording has it.
 */
export async function consentsOn(
  locale: Locale,
  slug: string,
): Promise<
  {
    kind: ConsentKind;
    title: string;
    version: string;
    dated: Date;
    wordings: { language: TextLanguage; title: string; html: string; counts: boolean }[];
  }[]
> {
  const entries = await getCollection("consents");
  return CONSENT_KINDS.filter((kind) => TEXT_OF[kind] === slug && kind !== slug).flatMap((kind) => {
    const own = byLanguage(
      entries
        .filter((entry) => writtenIn(entry.id).slug === kind)
        .map((entry) => ({
          ...entry,
          language: writtenIn(entry.id).language,
          binds: entry.data.binding,
        })),
    );
    // Where there is no telling which counts, the build has already failed
    // (`pinProblems`); the first is then only what this falls back on.
    const counted = countedWording(own) ?? own[0];
    if (!counted) return [];
    const named = own.find((entry) => entry.language === locale) ?? counted;
    return [
      {
        kind,
        title: named.data.title,
        version: counted.data.consent_version,
        dated: counted.data.dated,
        wordings: [counted, ...own.filter((entry) => entry !== counted)].map((entry) => {
          if (entry.rendered === undefined) throw new Error(`${entry.id} was not rendered`);
          return {
            language: entry.language,
            title: entry.data.title,
            html: entry.rendered.html,
            counts: entry === counted,
          };
        }),
      },
    ];
  });
}
