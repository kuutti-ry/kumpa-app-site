import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { DEFAULT_LOCALE, isLocale, LOCALES, pathOf } from "../src/i18n/locales.ts";
import { formatDate, LANGUAGE_IN, t, UI } from "../src/i18n/ui.ts";
import { fingerprinted } from "../src/lib/fingerprint.ts";
import { languageIntegrity } from "../src/lib/language-script.ts";
import { MARKS } from "../src/lib/marks.ts";
import { SITE } from "../src/site.ts";

test("Finnish is the default and switching languages keeps every page URL", () => {
  assert.equal(DEFAULT_LOCALE, "fi");
  for (const locale of LOCALES) {
    assert.equal(pathOf(locale, ""), "/");
    assert.equal(pathOf(locale, "about/people"), "/about/people/");
    assert.equal(pathOf(locale, "legal/privacy"), "/legal/privacy/");
  }
});

test("a language is one of the site's and nothing else", () => {
  for (const locale of LOCALES) assert.equal(isLocale(locale), true);
  for (const other of ["", "EN", "en-FI", "sv", "de", "legal"]) {
    assert.equal(isLocale(other), false);
  }
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

test("the content security policy permits the pinned language script alone", () => {
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
  assert.deepEqual(directives.get("script-src"), [`'${languageIntegrity}'`]);
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
