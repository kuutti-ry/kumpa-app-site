/**
 * What the built site must hold (dist/, after `pnpm build`). Run by
 * `pnpm check:site` and by CI.
 *
 * - No script, no frame, no form: the site runs nothing in the browser.
 * - Nothing is loaded from anybody else: every stylesheet, image, font and
 *   icon is the site's own. Links to other sites are links, not loads.
 * - Every link inside the site leads to a page or a file that exists, and an
 *   anchor to an id that is there.
 * - Every page says its language, has a title, a description and one h1.
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
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { PINNED } from "../src/consent-versions.ts";
import { DEFAULT_LOCALE, isTextLanguage, LOCALES, pathOf } from "../src/i18n/locales.ts";
import { LANGUAGE_IN, t } from "../src/i18n/ui.ts";
import { anchorOf, CONSENT_KINDS, isConsentKind, TEXT_OF } from "../src/lib/consent.ts";
import { SAIGA_DIR, SAIGA_FILES } from "../src/lib/saiga.ts";

const dist = join(import.meta.dirname, "..", "dist");
if (!existsSync(dist)) {
  console.error("no dist/: run pnpm build first");
  process.exit(1);
}

const ORIGIN = "https://kuutti.app";
const problems: string[] = [];
const pages: string[] = [];
(function walk(dir: string) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (name.endsWith(".html")) pages.push(path);
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

  for (const banned of ["script", "iframe", "form", "object", "embed"]) {
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
  if (!/<title>[^<]+<\/title>/.test(html)) problems.push(`${page}: no title`);
  if (!/<meta name="description" content="[^"]+"/.test(html))
    problems.push(`${page}: no description`);
  const h1 = html.match(/<h1[\s>]/g)?.length ?? 0;
  if (h1 !== 1) problems.push(`${page}: ${h1} h1 headings, and a page has one`);
  // The home page is made of several pages' texts (docs/decisions.md, 22): an anchor leads to one place.
  if (LOCALES.some((locale) => here === pathOf(locale, ""))) {
    const ids = [...html.matchAll(/\sid="([^"]*)"/g)].map(([, id = ""]) => id);
    for (const id of new Set(ids.filter((id, at) => ids.indexOf(id) !== at))) {
      problems.push(`${page}: the id "${id}" is there more than once`);
    }
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
  [...sitemap.matchAll(/<loc>https:\/\/kuutti\.app(\/[^<]*)<\/loc>/g)].map(([, at = ""]) => at),
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

// What the app's CI reads (kuutti-ry/kuutti-app#208): a version per kind, at an anchor that is there.
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
          ? t(DEFAULT_LOCALE, "consents.counts", {
              language: LANGUAGE_IN[DEFAULT_LOCALE][language],
            })
          : null;
      const said = t(DEFAULT_LOCALE, "consents.counts").split("{language}").at(-1) ?? "";
      if (counts === null || !own.includes(counts) || own.split(said).length !== 2) {
        problems.push(
          `${pathname}: ${kind} is published as counted in "${String(language)}", and the page does not say that wording, and it alone, is the one that counts`,
        );
      }
      // A consent the app does not ask (`asked: false` in a wording's front
      // matter) says so in its part of the page, and no other consent does.
      const consents = join(import.meta.dirname, "..", "src", "content", "consents");
      const notAsked = readdirSync(consents).some((folder) => {
        const wording = join(consents, folder, `${kind}.md`);
        if (!existsSync(wording)) return false;
        const [, front = ""] = /^---\n([\s\S]*?)\n---\n/.exec(readFileSync(wording, "utf8")) ?? [];
        return /^asked:\s*false\s*$/m.test(front);
      });
      if (own.includes(t(DEFAULT_LOCALE, "consents.notAsked")) !== notAsked) {
        problems.push(
          notAsked
            ? `${pathname}: the app does not ask for ${kind}, and the page does not say so`
            : `${pathname}: the app asks for ${kind}, and the page says that it does not`,
        );
      }
    }
  }
}

// A version people agreed to keeps its text on its page under its own anchor,
// since production records consents to it until the next release of the API
// and the stores: the newest on the text's own line, each earlier one in the
// page's earlier versions, from src/content/earlier (docs/decisions.md, 14).
for (const kind of CONSENT_KINDS) {
  const path = pathOf(DEFAULT_LOCALE, `legal/${TEXT_OF[kind]}`);
  const file = fileOf(path);
  const html = file ? readFileSync(file, "utf8") : "";
  for (const version of Object.keys(PINNED[kind])) {
    const anchors = html.split(` id="${anchorOf(kind, version)}"`).length - 1;
    if (anchors === 0) {
      problems.push(
        `${path}: no anchor for ${kind} ${version}; a version people agreed to keeps its text on the site under its anchor`,
      );
    } else if (anchors > 1) {
      problems.push(
        `${path}: ${anchors} anchors for ${kind} ${version}; the app's link to it leads to one place`,
      );
    }
  }
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(
  `the site holds: ${pages.length} pages, no script, nothing from elsewhere, no dead link, the sitemap names what may be indexed, /legal/versions.json leads to every version, every pinned version has its anchor, and ${saiga ? "every page links Saiga" : "no page asks for Saiga, which this build has not"}`,
);
