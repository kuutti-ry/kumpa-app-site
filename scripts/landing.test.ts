import assert from "node:assert/strict";
import { test } from "node:test";
import { landingProblems } from "./landing.ts";

// What in a style sheet keeps a link to an anchor from landing where it points
// (scripts/landing.ts); scripts/check-site.ts reads every style sheet of a build with it.

test("smooth scrolling is refused, however a style sheet writes it", () => {
  for (const css of [
    "html{scroll-behavior:smooth}",
    "@media (prefers-reduced-motion:no-preference){html{scroll-behavior:smooth}}",
    ".x {\n  SCROLL-BEHAVIOR : Smooth !important;\n}",
  ]) {
    const problems = landingProblems(css);
    assert.equal(problems.length, 1, css);
    assert.match(problems[0] ?? "", /^scroll-behavior: smooth; a link to an anchor lands at once/);
  }
});

test("scrolling at once is not refused, nor smooth scrolling named in a string or a comment", () => {
  for (const css of [
    "html{scroll-behavior:auto;scroll-padding-top:5rem}",
    '.x::after{content:"scroll-behavior:smooth"}',
    "/* scroll-behavior: smooth */html{color:red}",
  ]) {
    assert.deepEqual(landingProblems(css), [], css);
  }
});

test("a length measured on the font is refused, in each unit and each way of writing its number", () => {
  for (const length of [
    "68ch",
    "1.5ex",
    ".5cap",
    "-1ch",
    "2ic",
    "3rch",
    "1rex",
    "1rcap",
    "2ric",
    "68CH",
  ]) {
    const problems = landingProblems(`.prose{max-width:${length}}`);
    assert.equal(problems.length, 1, length);
    assert.ok(problems[0]?.startsWith(`${length}, a length measured on the font`), problems[0]);
  }
  assert.equal(landingProblems(".a{margin:0 1ch;padding:calc(1em + 2ex)}").length, 2);
});

test("em, rem and px are not lengths on the font, nor such letters in a name, a colour, a string or an address", () => {
  for (const css of [
    ":root{--column:42.9em;--wide:72rem;--radius:8px}",
    ".w-68ch{width:100%}",
    "#a3ex{color:#1ec}",
    '@font-face{src:url(/fonts/x-2ch.woff2) format("woff2")}',
    ".x::before{content:'68ch'}",
    "/* 68ch */.x{font-style:italic}",
  ]) {
    assert.deepEqual(landingProblems(css), [], css);
  }
});
