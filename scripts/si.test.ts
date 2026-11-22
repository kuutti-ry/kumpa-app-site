import assert from "node:assert/strict";
import { test } from "node:test";
import { cutAtHeading, stepped } from "../src/lib/si.ts";

// The site's look (docs/decisions.md, 41, 43 and 52).

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
