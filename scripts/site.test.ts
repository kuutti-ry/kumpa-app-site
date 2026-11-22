import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { DEFAULT_LOCALE, HIDDEN_LOCALES, isLocale, LOCALES, pathOf } from "../src/i18n/locales.ts";
import { formatDate, LANGUAGE_IN, t, UI } from "../src/i18n/ui.ts";
import { fingerprinted } from "../src/lib/fingerprint.ts";
import { MARKS } from "../src/lib/marks.ts";
import { pageHtml } from "../src/lib/page-html.ts";
import {
  languageIntegrity,
  statusIntegrity,
  waitlistIntegrity,
} from "../src/lib/script-integrity.ts";
import { SITE } from "../src/site.ts";

test("Finnish is the default and switching languages keeps every page URL", () => {
  assert.equal(DEFAULT_LOCALE, "fi");
  for (const locale of LOCALES) {
    assert.equal(pathOf(locale, ""), "/");
    assert.equal(pathOf(locale, "about/people"), "/about/people/");
    assert.equal(pathOf(locale, "legal/privacy"), "/legal/privacy/");
  }
});

test("embedded About sections keep a heading hierarchy and link within the reader’s language", () => {
  const page = {
    id: "en/about/people",
    rendered: {
      html: '<h2 id="credit">Credit</h2><a href="#credit">Credit</a><a href="/about/contact/">Contact</a>',
    },
  };
  for (const locale of LOCALES) {
    const html = pageHtml(page, locale, "people");
    const id = `${locale}-people-credit`;
    assert.ok(html.includes(`<h3 id="${id}">Credit</h3>`));
    assert.ok(html.includes(`href="#${id}"`));
    assert.ok(html.includes(`href="${locale === "fi" ? "#contact" : `#${locale}-contact`}"`));
    const standalone = pageHtml(page, locale);
    assert.ok(standalone.includes(`<h2 id="${locale}-credit">Credit</h2>`));
    assert.ok(standalone.includes('href="/about/contact/"'));
  }
});

test("a language is one of the site's and nothing else", () => {
  for (const locale of LOCALES) assert.equal(isLocale(locale), true);
  for (const other of ["", "EN", "SV", "en-FI", "sv-FI", "de", "legal"]) {
    assert.equal(isLocale(other), false);
  }
});

// Swedish is built and offered to nobody (decision 40): the switch shows only
// the language the reader is in and those offered, and the script knows every
// language, so that a link can still choose one.
test("each language hides the others, a hidden language's label shows only once it is chosen, and the script knows them all", () => {
  const root = join(import.meta.dirname, "..");
  const css = readFileSync(join(root, "src", "styles", "global.css"), "utf8");
  const hiding = /([^{}]*)\{\s*display: none;\s*\}/g;
  const hidden = [...css.matchAll(hiding)].flatMap(([, selectors = ""]) =>
    selectors.split(",").map((selector) => selector.trim()),
  );
  for (const locale of LOCALES) {
    assert.ok(
      hidden.includes(`body:has(#lang-${locale}:checked) [data-lang]:not([data-lang="${locale}"])`),
      `${locale} does not hide the other languages`,
    );
    assert.equal(
      hidden.includes(`body:not(:has(#lang-${locale}:checked)) label[for="lang-${locale}"]`),
      HIDDEN_LOCALES.has(locale),
      `${locale}'s label`,
    );
  }
  assert.ok(!HIDDEN_LOCALES.has(DEFAULT_LOCALE));
  const script = readFileSync(join(root, "public", "language.js"), "utf8");
  assert.deepEqual(JSON.parse(/const languages = (\[[^\]]*\]);/.exec(script)?.[1] ?? "[]"), [
    ...LOCALES,
  ]);
});

test("every language has every one of the site's words, and no other", () => {
  const keys = Object.keys(UI.en).sort();
  for (const locale of LOCALES) {
    assert.deepEqual(Object.keys(UI[locale]).sort(), keys, locale);
    for (const [key, text] of Object.entries(UI[locale])) {
      assert.notEqual(text.trim(), "", `${locale} ${key}`);
    }
  }
});

test("a translation names the same values as the English", () => {
  const names = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
  for (const locale of LOCALES) {
    for (const [key, text] of Object.entries(UI[locale])) {
      assert.deepEqual(names(text), names(UI.en[key as keyof typeof UI.en]), `${locale} ${key}`);
    }
  }
});

test("values are put into the text, and a value that is missing is left to be seen", () => {
  assert.equal(t("en", "doc.version", { version: "2026-09" }), "Version 2026-09");
  assert.equal(t("en", "doc.version"), "Version {version}");
});

test("dates are written as Finland writes them", () => {
  const day = new Date("2026-09-25T00:00:00Z");
  assert.equal(formatDate("en", day), "25 September 2026");
  assert.equal(formatDate("sv", day), "25 september 2026");
  assert.equal(formatDate("fi", day), "25. syyskuuta 2026");
});

test("each language names each language", () => {
  for (const reader of LOCALES) {
    for (const text of LOCALES) assert.notEqual(LANGUAGE_IN[reader][text], "");
  }
});

test("every channel of the association is an https address with a mark the footer draws", () => {
  for (const channel of SITE.social) {
    assert.match(channel.href, /^https:\/\//);
    assert.ok(Object.hasOwn(MARKS, channel.mark));
  }
});

test("both contact pages give the published email address", () => {
  for (const locale of LOCALES) {
    const contact = readFileSync(
      join(import.meta.dirname, "..", "src", "content", "pages", locale, "about", "contact.md"),
      "utf8",
    );
    assert.ok(SITE.contactEmail && contact.includes(`(mailto:${SITE.contactEmail})`));
  }
});

// The pages write the address out, so a change of `contactEmail` has to reach
// each of them (decision 37). The earlier versions stay as they were published.
test("every email address on a page or in a legal text in force is the published one", () => {
  const content = join(import.meta.dirname, "..", "src", "content");
  const written: string[] = [];
  for (const shelf of ["pages", "legal"]) {
    for (const name of readdirSync(join(content, shelf), { recursive: true, encoding: "utf8" })) {
      if (!name.endsWith(".md")) continue;
      const text = readFileSync(join(content, shelf, name), "utf8");
      for (const [address] of text.matchAll(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g)) {
        written.push(`${shelf}/${name}: ${address}`);
      }
    }
  }
  assert.ok(written.length > 0);
  assert.deepEqual(
    written.filter((line) => !line.endsWith(`: ${SITE.contactEmail}`)),
    [],
  );
});

test("the content security policy pins all scripts and scopes waitlist requests", () => {
  const headers = readFileSync(join(import.meta.dirname, "..", "customHttp.yml"), "utf8");
  const policies = [...headers.matchAll(/key: Content-Security-Policy\s+value: "([^"]*)"/g)];
  assert.equal(policies.length, 1, "one policy for every address");
  const directives = new Map(
    (policies[0]?.[1] ?? "").split(";").map((directive) => {
      const [name = "", ...sources] = directive.trim().split(/\s+/);
      return [name, sources];
    }),
  );
  assert.deepEqual(directives.get("default-src"), ["'none'"]);
  assert.deepEqual(directives.get("script-src"), [
    `'${languageIntegrity}'`,
    `'${statusIntegrity}'`,
    `'${waitlistIntegrity}'`,
  ]);
  assert.deepEqual(directives.get("connect-src"), [
    "'self'",
    "https://waitlist.kumpa.fi/challenge",
  ]);
  assert.deepEqual(directives.get("form-action"), ["https://waitlist.kumpa.fi/join"]);
  assert.deepEqual(directives.get("worker-src"), ["'none'"]);
  for (const directive of ["script-src-elem", "script-src-attr"])
    assert.equal(directives.has(directive), false);
});

test("a file kept elsewhere by its address carries a fingerprint that changes with it, and only then", () => {
  const root = mkdtempSync(join(tmpdir(), "fingerprint-"));
  try {
    mkdirSync(join(root, "public"));
    const write = (text: string) => writeFileSync(join(root, "public", "logo.png"), text);
    write("the tail");
    const tail = fingerprinted("/logo.png", root);
    assert.match(tail, /^\/logo\.png\?v=[0-9a-f]{8}$/);
    assert.equal(fingerprinted("/logo.png", root), tail);
    write("the seal pup's face");
    assert.notEqual(fingerprinted("/logo.png", root), tail);
    assert.throws(() => fingerprinted("/missing.png", root), /ENOENT/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("the share image and the icon are named by their fingerprints", () => {
  for (const file of ["/kuutti.png", "/favicon.png"]) {
    assert.match(fingerprinted(file, join(import.meta.dirname, "..")), /\?v=[0-9a-f]{8}$/, file);
  }
});
