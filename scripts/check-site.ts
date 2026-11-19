/**
 * What the built site must hold (dist/, after `pnpm build`). Run by
 * `pnpm check:site` and by CI.
 *
 * - Only the integrity-pinned language switch may run. No frames or forms.
 * - Nothing is loaded from anybody else: every stylesheet, image, font and
 *   icon is the site's own. Links to other sites are links, not loads.
 * - Every link inside the site leads to a page or a file that exists, and an
 *   anchor to an id that is there.
 * - Every bilingual page has one h1 per language and unique anchors.
 * - The home page, made of several pages' texts, has no id twice, so that an
 *   anchor leads to one place.
 * - The sitemap names every page search engines may index and no other, and
 *   robots.txt names the sitemap.
 * - /legal/versions.json names every kind of the app's, and each address
 *   leads to a page of the site and to the anchor of its version there. A
 *   consent read on another text's page says there which of its wordings
 *   counts: the one in the language this file gives the app. One the app
 *   does not ask says so there, and no other does.
 * - Every version of src/consent-versions.ts, not only the newest, has its
 *   one anchor on its page: people agreed to it, and the app's builds in their
 *   hands link to it until they are updated.
 * - Saiga's style sheet is linked on every page of a build that has Saiga's
 *   files, and on no page of a build that has not (docs/decisions.md, 28).
 * - A link to an anchor lands where it points and stays there: no style sheet
 *   scrolls smoothly or measures a length on the font (scripts/landing.ts).
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { PINNED } from "../src/consent-versions.ts";
import { DEFAULT_LOCALE, isTextLanguage, LOCALES, pathOf } from "../src/i18n/locales.ts";
import { LANGUAGE_IN, t } from "../src/i18n/ui.ts";
import {
  anchorOf,
  CONSENT_KINDS,
  type ConsentKind,
  EARLIER,
  isConsentKind,
  TEXT_OF,
} from "../src/lib/consent.ts";
import { fingerprinted } from "../src/lib/fingerprint.ts";
import { languageIntegrity } from "../src/lib/language-script.ts";
import { redirects } from "../src/lib/redirects.ts";
import { SAIGA_DIR, SAIGA_FILES } from "../src/lib/saiga.ts";
import { landingProblems } from "./landing.ts";

const dist = join(import.meta.dirname, "..", "dist");
if (!existsSync(dist)) {
  console.error("no dist/: run pnpm build first");
  process.exit(1);
}

const ORIGIN = "https://kumpa.fi";
const problems: string[] = [];
const pages: string[] = [];
const styleSheets: string[] = [];
(function walk(dir: string) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (name.endsWith(".html")) pages.push(path);
    else if (name.endsWith(".css")) styleSheets.push(path);
  }
})(dist);

/** The file an address of the site is served from, or null when there is none. */
const fileOf = (address: string): string | null => {
  const file = address.endsWith("/") ? join(dist, address, "index.html") : join(dist, address);
  return existsSync(file) && !statSync(file).isDirectory() ? file : null;
};

const attribute = (tag: string, name: string) =>
  new RegExp(`\\s${name}="([^"]*)"`, "i").exec(tag)?.[1];

// Saiga is in a build with every one of its files, as a page's layout reads
// it (hasSaiga in src/lib/saiga.ts): Amplify's build fetches them, CI's does not.
const saiga = SAIGA_FILES.every(
  ({ file }) => fileOf(`${SAIGA_DIR.replace(/^public/, "")}/${file}`) !== null,
);

for (const path of pages) {
  const page = `/${relative(dist, path)}`;
  const html = readFileSync(path, "utf8");
  const here = page.replace(/index\.html$/, "");

  for (const banned of ["iframe", "form", "object", "embed"]) {
    if (new RegExp(`<${banned}[\\s>]`, "i").test(html)) problems.push(`${page}: a <${banned}>`);
  }
  if (/\son[a-z]+="/i.test(html.replace(/\scontent="[^"]*"/g, ""))) {
    problems.push(`${page}: an inline event handler`);
  }
  if (/@import|url\(\s*["']?(https?:)?\/\//i.test(html)) {
    problems.push(`${page}: the stylesheet loads something from elsewhere`);
  }

  // What the browser fetches by itself.
  for (const [tag] of html.matchAll(/<(img|source|video|audio|link)\b[^>]*>/gi)) {
    const rel = attribute(tag, "rel") ?? "";
    if (
      /^<link/i.test(tag) &&
      !/stylesheet|icon|preload|prefetch|preconnect|dns-prefetch|manifest/.test(rel)
    ) {
      continue; // canonical and alternate name an address, they load nothing
    }
    const address =
      attribute(tag, "src") ?? attribute(tag, "href") ?? attribute(tag, "srcset") ?? "";
    if (/^(https?:)?\/\//i.test(address)) problems.push(`${page}: loads ${address}`);
    else if (address.startsWith("/") && !existsSync(join(dist, address.split(/[?#]/)[0] ?? ""))) {
      problems.push(`${page}: ${address} is not in the site`);
    }
  }

  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  const redirect = Object.entries(redirects).find(([from]) => from === here);
  if (redirect) {
    const [, destination] = redirect;
    if (scripts.length || !html.includes(`url=${destination}`) || !fileOf(destination))
      problems.push(`${page}: expected a static redirect to ${destination}`);
    continue;
  }
  const [script] = scripts;
  if (
    scripts.length !== 1 ||
    !script ||
    script[2]?.trim() ||
    attribute(script[0], "src") !== fingerprinted("/language.js") ||
    attribute(script[0], "integrity") !== languageIntegrity ||
    !fileOf("/language.js")
  ) {
    problems.push(`${page}: expected only the pinned language switch`);
  }

  // Saiga on every page or on none (docs/decisions.md, 28): a build that has
  // the files and a page without the style sheet has lost its typeface
  // unseen, and a page that asks for it without the files draws nothing from it.
  const linked = [...html.matchAll(/<link\b[^>]*>/gi)].some(
    ([tag]) =>
      attribute(tag, "rel") === "stylesheet" && attribute(tag, "href") === "/fonts/saiga.css",
  );
  if (saiga && !linked) {
    problems.push(
      `${page}: the build has Saiga's files, and the page does not link /fonts/saiga.css`,
    );
  }
  if (!saiga && linked) {
    problems.push(`${page}: links /fonts/saiga.css, and the build has not every file of Saiga`);
  }

  // The share image, which a messenger fetches for a link's preview: a file of the site.
  const share = /<meta property="og:image" content="([^"]*)"/.exec(html)?.[1];
  if (share !== undefined) {
    const at = new URL(share);
    if (at.origin !== ORIGIN || !fileOf(at.pathname)) {
      problems.push(`${page}: the share image ${share} is not a file of the site`);
    }
  }

  // Where a reader can go inside the site.
  for (const [tag] of html.matchAll(/<a\b[^>]*>/gi)) {
    const href = attribute(tag, "href");
    if (href === undefined) {
      problems.push(`${page}: a link without an address`);
      continue;
    }
    if (/^https:\/\//.test(href) || /^mailto:/.test(href)) continue;
    if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//")) {
      problems.push(`${page}: a link to ${href}; other sites are reached by https only`);
      continue;
    }
    const [target = "", anchor] = href.split("#");
    let file = path;
    if (target !== "") {
      if (!target.startsWith("/")) {
        problems.push(`${page}: a relative link, ${href}; links inside the site begin with /`);
        continue;
      }
      file = target.endsWith("/") ? join(dist, target, "index.html") : join(dist, target);
      if (!existsSync(file) || statSync(file).isDirectory()) {
        problems.push(`${page}: ${href} leads nowhere`);
        continue;
      }
    }
    if (anchor && file.endsWith(".html")) {
      const there = readFileSync(file, "utf8");
      if (!new RegExp(`\\sid="${anchor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`).test(there)) {
        problems.push(`${page}: ${href} names an anchor that is not there`);
      }
    }
  }

  if (!new RegExp(`<html[^>]*\\slang="(${LOCALES.join("|")})"`).test(html)) {
    problems.push(`${page}: no language of the site`);
  }
  if (!/<title\b[^>]*>[^<]+<\/title>/.test(html)) problems.push(`${page}: no title`);
  if (!/<meta name="description" content="[^"]+"/.test(html))
    problems.push(`${page}: no description`);
  const main = /<main\b[^>]*>([\s\S]*?)<\/main>/.exec(html)?.[1] ?? "";
  const groups = main.split(/<div data-lang="(fi|en)" lang="(?:fi|en)">/);
  for (const locale of LOCALES) {
    const at = groups.indexOf(locale);
    if (at === -1 || (groups[at + 1]?.match(/<h1[\s>]/g) ?? []).length !== 1)
      problems.push(`${page}: expected one heading in the ${locale} version`);
  }
  const ids = [...html.matchAll(/\sid="([^"]*)"/g)].map(([, id = ""]) => id);
  for (const id of new Set(ids.filter((id, at) => ids.indexOf(id) !== at))) {
    problems.push(`${page}: duplicate id "${id}"`);
  }
  if (!/<meta name="viewport" content="width=device-width, initial-scale=1"/.test(html)) {
    problems.push(`${page}: no viewport for a phone`);
  }
  // A text's marker (src/lib/team.ts) is replaced before a page is written:
  // one left standing is a page that lost its wiring.
  for (const [, marker = ""] of html.matchAll(/<p>(@team)\b/g)) {
    problems.push(`${page}: ${marker} was never replaced`);
  }
}

// The sitemap: every page a search engine may index, and no page it is told to leave alone.
const sitemap = existsSync(join(dist, "sitemap.xml"))
  ? readFileSync(join(dist, "sitemap.xml"), "utf8")
  : "";
if (sitemap === "") problems.push("/sitemap.xml is not there");
const listed = new Set(
  [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].flatMap(([, loc = ""]) => {
    if (loc.startsWith(`${ORIGIN}/`)) return [loc.slice(ORIGIN.length)];
    problems.push(`/sitemap.xml: ${loc} is not at the site's address, ${ORIGIN}`);
    return [];
  }),
);
for (const address of listed) {
  if (!fileOf(address)) problems.push(`/sitemap.xml: ${ORIGIN}${address} leads nowhere`);
}
for (const path of pages) {
  const page = `/${relative(dist, path)}`;
  if (page === "/404.html") continue;
  const address = page.replace(/index\.html$/, "");
  const leftAlone = /<meta name="robots" content="noindex"/.test(readFileSync(path, "utf8"));
  if (leftAlone && listed.has(address))
    problems.push(`/sitemap.xml names ${address}, which says noindex`);
  if (!leftAlone && !listed.has(address)) problems.push(`/sitemap.xml does not name ${address}`);
}
const robots = existsSync(join(dist, "robots.txt"))
  ? readFileSync(join(dist, "robots.txt"), "utf8")
  : "";
if (!robots.split("\n").includes(`Sitemap: ${ORIGIN}/sitemap.xml`)) {
  problems.push("/robots.txt does not name the sitemap");
}

// What the app's CI reads (kuutti-ry/kumpa-app#208): a version per kind, at an anchor that is there.
const versionsFile = join(dist, "legal", "versions.json");
const versions: unknown = existsSync(versionsFile)
  ? JSON.parse(readFileSync(versionsFile, "utf8"))
  : null;
if (typeof versions !== "object" || versions === null) {
  problems.push("/legal/versions.json is not there");
} else {
  for (const kind of Object.keys(versions)) {
    if (!isConsentKind(kind))
      problems.push(`/legal/versions.json: ${kind} is not a kind of the app's`);
  }
  for (const kind of CONSENT_KINDS) {
    const entry: unknown = Object.hasOwn(versions, kind)
      ? (versions as Record<string, unknown>)[kind]
      : undefined;
    const url = typeof entry === "object" && entry !== null && "url" in entry ? entry.url : null;
    if (typeof url !== "string" || !url.startsWith(`${ORIGIN}/`)) {
      problems.push(`/legal/versions.json: ${kind} has no address on the site`);
      continue;
    }
    const { pathname, hash } = new URL(url);
    const file = fileOf(pathname);
    const anchor = hash.slice(1).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!file) problems.push(`/legal/versions.json: ${kind} leads nowhere (${url})`);
    else if (anchor === "" || !new RegExp(`\\sid="${anchor}"`).test(readFileSync(file, "utf8"))) {
      problems.push(`/legal/versions.json: ${kind} names an anchor that is not there (${url})`);
    } else if (TEXT_OF[kind] !== kind) {
      // The consent's own part of the page: from its anchor to the next heading.
      const [, after = ""] = readFileSync(file, "utf8").split(new RegExp(`\\sid="${anchor}"`));
      const [own = ""] = after.split(/<h[23][\s>]/);
      const language =
        typeof entry === "object" && entry !== null && "language" in entry ? entry.language : null;
      const counts =
        typeof language === "string" && isTextLanguage(language)
          ? t("en", "consents.counts", {
              language: LANGUAGE_IN.en[language],
            })
          : null;
      const said = t("en", "consents.counts").split("{language}").at(-1) ?? "";
      if (counts === null || !own.includes(counts) || own.split(said).length !== 2) {
        problems.push(
          `${pathname}: ${kind} is published as counted in "${String(language)}", and the page does not say that wording, and it alone, is the one that counts`,
        );
      }
    }
  }
}

// A version people agreed to keeps its text on the site under its own anchor,
// since production records consents to it until the next release of the API
// and the stores (docs/decisions.md, 14): the newest on the text's own line,
// each earlier one on the page of earlier versions, from src/content/earlier,
// and never on the text's page, which shows the text in force alone (32).
const anchorsIn = (path: string, kind: ConsentKind, version: string): number => {
  const file = fileOf(path);
  const html = file ? readFileSync(file, "utf8") : "";
  return html.split(` id="${anchorOf(kind, version)}"`).length - 1;
};
for (const kind of CONSENT_KINDS) {
  const own = pathOf(DEFAULT_LOCALE, `legal/${TEXT_OF[kind]}`);
  const kept = pathOf(DEFAULT_LOCALE, EARLIER);
  const versions = Object.keys(PINNED[kind]);
  for (const version of versions) {
    const [path, other] = version === versions.at(-1) ? [own, kept] : [kept, own];
    const anchors = anchorsIn(path, kind, version);
    if (anchors === 0) {
      problems.push(
        `${path}: no anchor for ${kind} ${version}; a version people agreed to keeps its text on the site under its anchor`,
      );
    } else if (anchors > 1) {
      problems.push(
        `${path}: ${anchors} anchors for ${kind} ${version}; the app's link to it leads to one place`,
      );
    }
    if (anchorsIn(other, kind, version) > 0) {
      problems.push(
        `${other}: an anchor for ${kind} ${version}, which belongs on ${path}; a text in force is read alone, and each earlier version on ${kept}`,
      );
    }
  }
}

// A link to an anchor lands where it points and stays there when the fonts arrive.
for (const path of styleSheets) {
  for (const problem of landingProblems(readFileSync(path, "utf8"))) {
    problems.push(`/${relative(dist, path)}: ${problem}`);
  }
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(
  `the site holds: ${pages.length} pages, only the language switch, nothing from elsewhere, no dead link, the sitemap names what may be indexed, /legal/versions.json leads to every version, every pinned version has its anchor (the newest on its text's page, the rest on the page of earlier versions), ${styleSheets.length} style sheets that let a link land where it points, and ${saiga ? "every page links Saiga" : "no page asks for Saiga, which this build has not"}`,
);
