import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { COPIES, copyOf, cutAtHeading, isSi, linksInSi, stepped } from "../src/lib/si.ts";

// The /si/ and /si2/ copies of the site (docs/decisions.md, 41, 43 and 49).

const [si, si2] = COPIES;

test("an address is of the copy whose address begins it, and of none where none does", () => {
  for (const [address, copy] of [
    ["/si/", si],
    ["/si", si],
    ["/si/legal/privacy/", si],
    ["/si2/", si2],
    ["/si2", si2],
    ["/si2/legal/privacy/", si2],
    ["/si2/si/", si2],
    ["/si/si2/", si],
    ["/", undefined],
    ["/sitemap.xml", undefined],
    ["/simple/", undefined],
    ["/si22/", undefined],
    ["/si3/", undefined],
    ["/si2.html", undefined],
    ["/about/si2/", undefined],
    ["", undefined],
  ] as const) {
    assert.equal(copyOf(address), copy, address);
    assert.equal(isSi(address), copy !== undefined, address);
  }
});

test("a link on a page of /si2/ leads to its /si2/ twin", () => {
  assert.equal(linksInSi('<a href="/">Home</a>', "/si2"), '<a href="/si2/">Home</a>');
  assert.equal(
    linksInSi('<p><a href="/help/">a</a> · <a href="/legal/privacy/#v-2">b</a></p>', "/si2"),
    '<p><a href="/si2/help/">a</a> · <a href="/si2/legal/privacy/#v-2">b</a></p>',
  );
  for (const html of [
    '<a href="/si2/app/">App</a>',
    '<a href="/legal/versions.json">versions</a>',
    '<a class="skip" href="#content">Skip</a>',
  ]) {
    assert.equal(linksInSi(html, "/si2"), html);
  }
});

test("each drawing of /si2/ is its /si/ twin in the softer yellow", () => {
  const folder = (name: string) => join(import.meta.dirname, "..", "public", name);
  // The lime's name went with the colour (docs/decisions.md, 49).
  const twin: Record<string, string> = {
    "blob-yellow.svg": "blob-lime.svg",
    "blob-yellow-wide.svg": "blob-lime-wide.svg",
    "wave-yellow.svg": "wave-lime.svg",
  };
  const drawings = readdirSync(folder("si2-art")).filter((name) => name.endsWith(".svg"));
  assert.notEqual(drawings.length, 0);
  for (const name of drawings) {
    const lime = readFileSync(join(folder("si-art"), twin[name] ?? name), "utf8");
    assert.equal(
      readFileSync(join(folder("si2-art"), name), "utf8"),
      lime.replace(/#(?:E1FE22|E4FE22)\b/gi, "#F6F593"),
      name,
    );
  }
});

test("a link to a page of the site leads to its /si/ twin", () => {
  assert.equal(linksInSi('<a href="/">Home</a>'), '<a href="/si/">Home</a>');
  assert.equal(
    linksInSi('<a class="brand" href="/about/#contact" aria-current="page">x</a>'),
    '<a class="brand" href="/si/about/#contact" aria-current="page">x</a>',
  );
  assert.equal(
    linksInSi('<p><a href="/help/">a</a> · <a href="/legal/privacy/#v-2">b</a></p>'),
    '<p><a href="/si/help/">a</a> · <a href="/si/legal/privacy/#v-2">b</a></p>',
  );
});

test("a file, an anchor of the page, another site and a link already inside stay as they are", () => {
  for (const html of [
    '<a href="/legal/versions.json">versions</a>',
    '<a class="skip" href="#content">Skip</a>',
    '<a href="https://github.com/kuutti-ry/">GitHub</a>',
    '<a href="mailto:hello@kumpa.fi">hello@kumpa.fi</a>',
    '<a href="/si/app/">App</a>',
    '<link rel="canonical" href="https://kumpa.fi/app/">',
    '<link rel="stylesheet" href="/fonts/saiga.css">',
    '<img src="/logo.png" alt="">',
  ]) {
    assert.equal(linksInSi(html), html);
  }
});

test("each third-level heading becomes a step, and a closing line of links stands after them", () => {
  const html =
    '<h2 id="how">How</h2>\n<p>Intro.</p>\n<h3 id="a">A</h3>\n<p>One.</p>\n<h3 id="b">B</h3>\n<p>Two.</p>\n<p>More.</p>\n<p><a href="/help/">Help</a> · <a href="/child-safety/">Safety</a></p>';
  assert.equal(
    stepped(html),
    '<h2 id="how">How</h2>\n<p>Intro.</p>\n<div class="si-steps"><div class="si-step"><h3 id="a">A</h3>\n<p>One.</p></div><div class="si-step"><h3 id="b">B</h3>\n<p>Two.</p>\n<p>More.</p></div></div><p><a href="/help/">Help</a> · <a href="/child-safety/">Safety</a></p>',
  );
});

test("a last step that ends in its own words keeps them, and a text without steps is left alone", () => {
  assert.equal(
    stepped("<h3>A</h3>\n<p>One.</p>\n<h3>B</h3>\n<p>Two.</p>"),
    '<div class="si-steps"><div class="si-step"><h3>A</h3>\n<p>One.</p></div><div class="si-step"><h3>B</h3>\n<p>Two.</p></div></div>',
  );
  assert.equal(stepped("<h2>How</h2><p>Words.</p>"), "<h2>How</h2><p>Words.</p>");
  assert.equal(stepped(""), "");
});

test("a text is cut at its first third-level heading or at its last one", () => {
  const html = '<p>Opening.</p>\n<h3 id="a">A</h3>\n<p>One.</p>\n<h3>B</h3>\n<p>Two.</p>';
  assert.deepEqual(cutAtHeading(html, "first"), [
    "<p>Opening.</p>\n",
    '<h3 id="a">A</h3>\n<p>One.</p>\n<h3>B</h3>\n<p>Two.</p>',
  ]);
  assert.deepEqual(cutAtHeading(html, "last"), [
    '<p>Opening.</p>\n<h3 id="a">A</h3>\n<p>One.</p>\n',
    "<h3>B</h3>\n<p>Two.</p>",
  ]);
});

test("a text with one such heading is cut there either way, and one that begins with it has no opening", () => {
  const html = "<p>Opening.</p><h3>Only</h3><p>Rest.</p>";
  assert.deepEqual(cutAtHeading(html, "first"), ["<p>Opening.</p>", "<h3>Only</h3><p>Rest.</p>"]);
  assert.deepEqual(cutAtHeading(html, "last"), cutAtHeading(html, "first"));
  assert.deepEqual(cutAtHeading("<h3>Only</h3><p>Rest.</p>", "first"), [
    "",
    "<h3>Only</h3><p>Rest.</p>",
  ]);
});

test("a text without a third-level heading is all opening", () => {
  for (const html of [
    "",
    "<p>Words.</p>",
    "<h2>Two</h2><p>Words.</p><h4>Four</h4>",
    "<h30>Not a heading</h30>",
  ]) {
    assert.deepEqual(cutAtHeading(html, "first"), [html, ""]);
    assert.deepEqual(cutAtHeading(html, "last"), [html, ""]);
  }
});
